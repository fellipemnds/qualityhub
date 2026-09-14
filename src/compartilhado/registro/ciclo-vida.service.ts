import { aprovacaoRepository } from "../aprovacao/aprovacao.repository.js"
import { atribuicaoRepository } from "../atribuicao/atribuicao.repository.js"
import { auditoriaRepository } from "../auditoria/auditoria.repository.js"
import { EntidadeAuditada } from "../auditoria/entidades-auditadas.js"
import { cancelamentoRepository } from "../cancelamento/cancelamento.repository.js"
import { Papel } from "../entidades/papeis.js"
import { TipoRegistro } from "../entidades/tipos-registro.js"
import { NaoEncontradoError, SemPermissaoError, TransicaoInvalidaError, ValidacaoError } from "../errors/errors.js"
import { podeExecutar, temPapel } from "../permissoes/pode-executar.js"
import { ClientePrisma } from "../prisma/tipos.js"
import { reaberturaRepository } from "../reabertura/reabertura.repository.js"
import { sequenciaService } from "../sequencia/sequencia.service.js"
import { portoesPorTipo } from "./portoes.js"
import { prefixoPorTipo } from "./prefixos.js"
import { registroRepository } from "./registro.repository.js"

export const cicloVidaService = {
    async criarRascunho(tx: ClientePrisma, dados: { tipo: TipoRegistro, criadoPorId: string }) {
        const registro = await registroRepository.criar(tx, dados);

        await auditoriaRepository.registrar(tx, {
            entidade: EntidadeAuditada[registro.tipo],
            entidadeId: registro.id,
            acao: "CRIAR_RASCUNHO",
            usuarioId: registro.criadoPorId,
            antes: undefined,
            depois: registro
        });

        return registro;
    },

    async publicar(tx: ClientePrisma, registroId: string, ator: { id: string, papeis: Papel[] }, dados: unknown, validador: (dados: unknown) => unknown) {
        const registro = await registroRepository.buscarPorId(tx, registroId);

        if (registro === null) {
            throw new NaoEncontradoError("Item não encontrado");
        }

        if (registro.estado !== "RASCUNHO") {
            throw new TransicaoInvalidaError("Apenas itens em rascunho podem ser publicados!");
        }

        const podeEditar = await podeExecutar(tx, ator, "PUBLICAR", registroId);

        if (!podeEditar) {
            throw new SemPermissaoError("Você não pode realizar esta ação pois você não está atribuido neste item.")
        }

        const dadoValidado = validador(dados);

        const prefixo = prefixoPorTipo[registro.tipo];
        const anoAtual = new Date().getFullYear();

        const codigo = await sequenciaService.proximoCodigo(tx, prefixo, anoAtual);

        const registroAtualizado = await registroRepository.atualizar(tx, registroId, { estado: "ABERTO", codigo });

        await auditoriaRepository.registrar(tx, {
            entidade: EntidadeAuditada[registro.tipo],
            entidadeId: registroAtualizado.id,
            acao: "PUBLICAR",
            usuarioId: ator.id,
            antes: dadoValidado,
            depois: registroAtualizado
        })

        return registroAtualizado;
    },

    async excluirRascunho(tx: ClientePrisma, registroId: string, ator: { id: string, papeis: Papel[] }) {
        const registro = await registroRepository.buscarPorId(tx, registroId);

        if (registro === null) {
            throw new NaoEncontradoError("Item não foi encontrado.");
        }

        if (registro.estado !== "RASCUNHO") {
            throw new TransicaoInvalidaError("Apenas itens em rascunho podem ser deletados!");
        }

        const podeDeletar = await podeExecutar(tx, ator, "GERENCIAR_RASCUNHO", registroId);

        if (!podeDeletar) {
            throw new SemPermissaoError("Você não pode realizar esta ação pois você não está atribuido neste item.");
        }

        const registroDeletado = await registroRepository.excluir(tx, registroId);

        await auditoriaRepository.registrar(tx, {
            entidade: EntidadeAuditada[registroDeletado.tipo],
            entidadeId: registroDeletado.id,
            acao: "EXCLUIR_RASCUNHO",
            usuarioId: ator.id,
            antes: registroDeletado,
            depois: undefined
        });

        return registroDeletado;
    },

    async submeter(tx: ClientePrisma, registroId: string, ator: { id: string, papeis: Papel[] }, dados: unknown, validador: (dados: unknown) => unknown) {
        const registro = await registroRepository.buscarPorId(tx, registroId);

        if (registro === null) {
            throw new NaoEncontradoError("Item não foi encontrado.");
        }

        if (registro.estado !== "ABERTO" || portoesPorTipo[registro.tipo].length <= 0) {
            throw new TransicaoInvalidaError();
        }

        const podeSubmeter = await podeExecutar(tx, ator, "SUBMETER", registroId);

        if (!podeSubmeter) {
            throw new SemPermissaoError("Você não pode realizar esta ação pois você não está atribuido neste item ou não possui as permissões necessárias.");
        }

        const temAprovador = await atribuicaoRepository.existeAprovador(tx, registroId);

        if (!temAprovador) {
            throw new TransicaoInvalidaError("Este item deve possuir um aprovador delegado antes de ser submetido.");
        }

        const dadoValidado = validador(dados);

        const dadoAtualizado = await registroRepository.atualizar(tx, registroId, { estado: "EM_APROVACAO" });

        await auditoriaRepository.registrar(tx, {
            entidade: EntidadeAuditada[dadoAtualizado.tipo],
            entidadeId: dadoAtualizado.id,
            acao: "SUBMETER",
            usuarioId: ator.id,
            antes: registro,
            depois: dadoAtualizado
        });

        return dadoAtualizado;
    },

    async decidir(tx: ClientePrisma, registroId: string, ator: { id: string, papeis: Papel[] }, dados: { decisao: "APROVADO" | "REPROVADO", motivo?: string }) {
        const registro = await registroRepository.buscarPorId(tx, registroId);

        if (registro === null) {
            throw new NaoEncontradoError("O item não foi encontrado");
        }

        if (registro.estado !== "EM_APROVACAO") {
            throw new TransicaoInvalidaError("O item não está em aprovação!");
        }

        const papel = temPapel(ator, "APROVAR");

        const atribuicao = await atribuicaoRepository.ehAprovador(tx, registroId, ator.id);

        if (!papel || !atribuicao) {
            throw new SemPermissaoError("Você não pode realizar esta ação pois você não está atribuido neste item ou não possui as permissões necessárias.");
        }

        if (dados.decisao === "REPROVADO" && (!dados.motivo || dados.motivo.trim() === "")) {
            throw new ValidacaoError("O motivo é obrigatório em caso de reprovação!")
        }

        const portaoDecidido = portoesPorTipo[registro.tipo][registro.portaoAtual];

        if (portaoDecidido === undefined) {
            throw new TransicaoInvalidaError("Estado de portao inconsistente.")
        }

        const autoAprovacao = ator.id === registro.criadoPorId;

        const aprovacao = await aprovacaoRepository.criar(tx, {
            registroId,
            portao: portaoDecidido,
            decisao: dados.decisao,
            motivo: dados.motivo,
            aprovadorId: ator.id,
            autoAprovacao
        })

        let registroAtualizado;

        if (aprovacao.decisao === "REPROVADO") {
            registroAtualizado = await registroRepository.atualizar(tx, registroId, { estado: "ABERTO" })
        }
        else if (aprovacao.decisao === "APROVADO" && registro.portaoAtual + 1 < portoesPorTipo[registro.tipo].length) {
            const novoPortao = registro.portaoAtual + 1
            registroAtualizado = await registroRepository.atualizar(tx, registroId, { estado: "ABERTO", portaoAtual: novoPortao })
        }
        else {
            registroAtualizado = await registroRepository.atualizar(tx, registroId, { estado: "FECHADO" })
        }

        await auditoriaRepository.registrar(tx, {
            entidade: EntidadeAuditada[registroAtualizado.tipo],
            entidadeId: registroAtualizado.id,
            acao: aprovacao.decisao,
            usuarioId: ator.id,
            antes: registro,
            depois: registroAtualizado
        })

        return registroAtualizado;
    },

    async concluir(tx: ClientePrisma, registroId: string, ator: { id: string, papeis: Papel[] }, dados: unknown, validador: (dados: unknown) => unknown) {
        const registro = await registroRepository.buscarPorId(tx, registroId);

        if (registro === null) {
            throw new NaoEncontradoError("O item não foi encontrado");
        }

        if (registro.estado !== "ABERTO" || portoesPorTipo[registro.tipo].length !== 0) {
            throw new TransicaoInvalidaError('O item não pode ser concluído pois não está no status "ABERTO" ou não está no portão correto!');
        }

        const papel = temPapel(ator, "CONCLUIR_VERIFICACAO");

        const atribuicao = await atribuicaoRepository.ehColaborador(tx, registroId, ator.id);

        if (!papel || !atribuicao) {
            throw new SemPermissaoError("Você não pode realizar esta ação pois você não está atribuido neste item ou não possui as permissões necessárias.");
        }

        const dadoValidado = validador(dados);

        const dadoAtualizado = await registroRepository.atualizar(tx, registroId, { estado: "FECHADO" });

        await auditoriaRepository.registrar(tx, {
            entidade: EntidadeAuditada[dadoAtualizado.tipo],
            entidadeId: dadoAtualizado.id,
            acao: "CONCLUIR_VERIFICACAO",
            usuarioId: ator.id,
            antes: registro,
            depois: dadoAtualizado
        });

        return dadoAtualizado;
    },

    async reabrir(tx: ClientePrisma, registroId: string, ator: { id: string, papeis: Papel[] }, motivo: string) {
        const registro = await registroRepository.buscarPorId(tx, registroId);

        if (registro === null) {
            throw new NaoEncontradoError("O item não foi encontrado");
        }

        if (registro.estado !== "FECHADO" || (!motivo || motivo.trim() === "")) {
            throw new TransicaoInvalidaError('O item não pode ser concluído pois não está no status "FECHADO" ou porque o motivo está em branco!');
        }

        const papel = temPapel(ator, "REABRIR");

        if (!papel) {
            throw new SemPermissaoError("Você não pode realizar esta ação pois você não possui as permissões necessárias.");
        }

        await reaberturaRepository.criar(tx, { registroId, reabertoPorId: ator.id, motivo });

        const registroAtualizado = await registroRepository.atualizar(tx, registroId, { estado: "ABERTO", portaoAtual: 0 })

        await auditoriaRepository.registrar(tx, {
            entidade: EntidadeAuditada[registroAtualizado.tipo],
            entidadeId: registroAtualizado.id,
            acao: "REABRIR",
            usuarioId: ator.id,
            antes: registro,
            depois: registroAtualizado
        })

        return registroAtualizado;
    },

    async cancelar(tx: ClientePrisma, registroId: string, ator: { id: string, papeis: Papel[] }, motivo: string) {
        const registro = await registroRepository.buscarPorId(tx, registroId);

        if (registro === null) {
            throw new NaoEncontradoError("O item não foi encontrado");
        }

        if ((registro.estado === "FECHADO" || registro.estado === "CANCELADO") || motivo.trim() === "") {
            throw new TransicaoInvalidaError('O item não pode ser concluído pois já está no status "FECHADO/CANCELADO" ou porque o motivo está em branco!');
        }

        const gerente = ator.papeis.includes("GERENTE");

        const atribuicao = await atribuicaoRepository.ehAprovador(tx, registroId, ator.id);

        if (!gerente && !atribuicao) {
            throw new SemPermissaoError("Você não pode realizar esta ação pois você não possui as permissões necessárias.");
        }

        await cancelamentoRepository.criar(tx, { registroId, canceladoPorId: ator.id, motivo });

        const registroAtualizado = await registroRepository.atualizar(tx, registroId, { estado: "CANCELADO" })

        await auditoriaRepository.registrar(tx, {
            entidade: EntidadeAuditada[registroAtualizado.tipo],
            entidadeId: registroAtualizado.id,
            acao: "CANCELAR",
            usuarioId: ator.id,
            antes: registro,
            depois: registroAtualizado
        })

        return registroAtualizado;
    }
}