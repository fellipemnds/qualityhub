import { atribuicaoRepository } from "../atribuicao/atribuicao.repository.js"
import { auditoriaRepository } from "../auditoria/auditoria.repository.js"
import { EntidadeAuditada } from "../auditoria/entidades-auditadas.js"
import { Papel } from "../entidades/papeis.js"
import { TipoRegistro } from "../entidades/tipos-registro.js"
import { NaoEncontradoError, SemPermissaoError, TransicaoInvalidaError, ValidacaoError } from "../errors/errors.js"
import { podeExecutar } from "../permissoes/pode-executar.js"
import { ClientePrisma } from "../prisma/tipos.js"
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
            antes: dadoValidado,
            depois: dadoAtualizado
        });

        return dadoAtualizado;
    },

    async decidir(tx: ClientePrisma, registroId: string, ator: { id: string, papeis: Papel[] }) {
        
    }
}