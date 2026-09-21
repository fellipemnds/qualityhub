import { atribuicaoRepository } from "../../compartilhado/atribuicao/atribuicao.repository.js";
import { auditoriaRepository } from "../../compartilhado/auditoria/auditoria.repository.js";
import { EntidadeAuditada } from "../../compartilhado/auditoria/entidades-auditadas.js";
import { EstadoRegistro } from "../../compartilhado/entidades/estados.js";
import { Papel } from "../../compartilhado/entidades/papeis.js";
import { NaoEncontradoError, SemPermissaoError, TransicaoInvalidaError } from "../../compartilhado/errors/errors.js";
import { temPapel } from "../../compartilhado/permissoes/pode-executar.js";
import { prisma } from "../../compartilhado/prisma/cliente.js";
import { cicloVidaService } from "../../compartilhado/registro/ciclo-vida.service.js";
import { DecisaoInput } from "../../compartilhado/registro/decidir.schema.js";
import { ESTADOS_EDITAVEIS } from "../../compartilhado/registro/estados-editaveis.js";
import { registroRepository } from "../../compartilhado/registro/registro.repository.js";
import { acaoCorretivaRepository } from "./acao-corretiva.repository.js";
import { acaoCorretivaExecucaoSchema, acaoCorretivaPlanoSchema, acaoCorretivaPublicacaoSchema, AcaoCorretivaRascunhoInput } from "./acao-corretiva.schema.js";
import { ncRepository } from "./nc.repository.js";

export const acaoCorretivaService = {
    async criarRascunhoAcaoCorretiva(ator: { id: string, papeis: Papel[] }, naoConformidadeId: string, dados: AcaoCorretivaRascunhoInput & { investigacaoId?: string }) {
        return prisma.$transaction(async (tx) => {
            const papel = temPapel(ator, "GERENCIAR_RASCUNHO");
            if (!papel) throw new SemPermissaoError("Você não tem permissões suficientes para criar um novo rascunho.");

            const nc = await ncRepository.buscarPorId(tx, naoConformidadeId);
            if (nc === null) throw new NaoEncontradoError("A Não Conformidade não existe ou não foi encontrada");

            const registro = await cicloVidaService.criarRascunho(tx, { tipo: "ACAO_CORRETIVA", criadoPorId: ator.id });
            const acaoCorretiva = await acaoCorretivaRepository.criar(tx, { id: registro.id, naoConformidadeId, ...dados });

            await atribuicaoRepository.inserirAtribuicao(tx, registro.id, ator.id, ator.id, "COLABORADOR");

            return { ...registro, ...acaoCorretiva };
        });
    },

    async atualizarAcaoCorretiva(registroId: string, ator: { id: string, papeis: Papel[] }, dados: AcaoCorretivaRascunhoInput) {
        return prisma.$transaction(async (tx) => {
            const registro = await registroRepository.buscarPorId(tx, registroId);
            if (registro === null) throw new NaoEncontradoError("Item não encontrado.");
            if (!ESTADOS_EDITAVEIS.includes(registro.estado)) {
                throw new TransicaoInvalidaError('Este item não pode mais ser editado neste estado.');
            }

            const papel = temPapel(ator, "GERENCIAR_RASCUNHO");
            const atribuicao = await atribuicaoRepository.ehColaborador(tx, registroId, ator.id);
            if (!papel || !atribuicao) throw new SemPermissaoError("Você não tem permissões suficientes para atualizar este item.");

            const antes = await acaoCorretivaRepository.buscarPorId(tx, registroId);
            const atualizada = await acaoCorretivaRepository.atualizar(tx, registroId, dados);

            await auditoriaRepository.registrar(tx, {
                entidade: EntidadeAuditada[registro.tipo],
                entidadeId: registro.id,
                acao: "SALVAR_RASCUNHO",
                usuarioId: ator.id,
                antes,
                depois: atualizada
            });

            return atualizada;
        });
    },

    async excluirRascunhoAcaoCorretiva(registroId: string, ator: { id: string, papeis: Papel[] }) {
        return prisma.$transaction(async (tx) => {
            return cicloVidaService.excluirRascunho(tx, registroId, ator);
        });
    },

    async publicarAcaoCorretiva(registroId: string, ator: { id: string, papeis: Papel[] }) {
        return prisma.$transaction(async (tx) => {
            const acaoCorretiva = await acaoCorretivaRepository.buscarPorId(tx, registroId);
            if (acaoCorretiva === null) throw new NaoEncontradoError("Item não encontrado.");

            const registroPublicado = await cicloVidaService.publicar(tx, registroId, ator, acaoCorretiva, (d) => acaoCorretivaPublicacaoSchema.parse(d));
            return { ...registroPublicado, ...acaoCorretiva };
        });
    },

    // ACAO_CORRETIVA agora tem um unico portao (PLANO) — esta e a UNICA
    // submissao que existe no ciclo de vida desta entidade. A execucao
    // nunca e submetida para aprovacao; ela e registrada e finalizada
    // direto via finalizarExecucaoAcaoCorretiva, sem passar por EM_APROVACAO.
    async submeterAcaoCorretiva(registroId: string, ator: { id: string, papeis: Papel[] }) {
        return prisma.$transaction(async (tx) => {
            const acaoCorretiva = await acaoCorretivaRepository.buscarPorId(tx, registroId);
            if (acaoCorretiva === null) throw new NaoEncontradoError("Item não encontrado.");

            const registroSubmetido = await cicloVidaService.submeter(tx, registroId, ator, acaoCorretiva, (d) => acaoCorretivaPlanoSchema.parse(d));
            return { ...registroSubmetido, ...acaoCorretiva };
        });
    },

    // fecharAoAprovarUltimoPortao = false: aprovar o PLANO volta o item
    // para ABERTO (autorizando a execucao) em vez de fechar — mesmo sendo
    // o unico portao.
    async decidirAcaoCorretiva(registroId: string, ator: { id: string, papeis: Papel[] }, dados: DecisaoInput) {
        return prisma.$transaction(async (tx) => {
            const registroDecidido = await cicloVidaService.decidir(tx, registroId, ator, dados, false);
            const acaoCorretiva = await acaoCorretivaRepository.buscarPorId(tx, registroId);
            return { ...registroDecidido, ...acaoCorretiva };
        });
    },

    // Leva o item de ABERTO (plano ja aprovado, portaoAtual continua 0
    // porque decidir() com fecharAoAprovarUltimoPortao=false nao incrementa)
    // direto para FECHADO, sem aprovacao — feito pelo colaborador que
    // executou, exige executadoEm/evidencia preenchidos (RN-25).
    async finalizarExecucaoAcaoCorretiva(registroId: string, ator: { id: string, papeis: Papel[] }) {
        return prisma.$transaction(async (tx) => {
            const registro = await registroRepository.buscarPorId(tx, registroId);

            if (registro === null) {
                throw new NaoEncontradoError("Item não encontrado.");
            }

            if (registro.estado !== "ABERTO" || registro.portaoAtual !== 0) {
                throw new TransicaoInvalidaError('O plano precisa estar aprovado antes de finalizar a execução.');
            }

            const papel = temPapel(ator, "SUBMETER");
            const atribuicao = await atribuicaoRepository.ehColaborador(tx, registroId, ator.id);

            if (!papel || !atribuicao) {
                throw new SemPermissaoError("Você não tem permissões suficientes para finalizar esta execução.");
            }

            const acaoCorretiva = await acaoCorretivaRepository.buscarPorId(tx, registroId);
            if (acaoCorretiva === null) {
                throw new NaoEncontradoError("Item não encontrado.");
            }

            acaoCorretivaExecucaoSchema.parse(acaoCorretiva);

            const registroAtualizado = await registroRepository.atualizar(tx, registroId, { estado: "FECHADO" });

            await auditoriaRepository.registrar(tx, {
                entidade: EntidadeAuditada[registro.tipo],
                entidadeId: registro.id,
                acao: "FINALIZAR_EXECUCAO",
                usuarioId: ator.id,
                antes: registro,
                depois: registroAtualizado
            });

            return { ...registroAtualizado, ...acaoCorretiva };
        });
    },

    async cancelarAcaoCorretiva(registroId: string, ator: { id: string, papeis: Papel[] }, motivo: string) {
        return prisma.$transaction(async (tx) => {
            const registroCancelado = await cicloVidaService.cancelar(tx, registroId, ator, motivo);
            const acaoCorretiva = await acaoCorretivaRepository.buscarPorId(tx, registroId);
            return { ...registroCancelado, ...acaoCorretiva };
        });
    },

    async buscarPorIdAcaoCorretiva(registroId: string, ator: { id: string, papeis: Papel[] }) {
        const registro = await registroRepository.buscarPorId(prisma, registroId);
        if (registro === null) throw new NaoEncontradoError("Item não encontrado.");

        const papel = temPapel(ator, "VISUALIZAR");
        if (!papel) throw new SemPermissaoError("Você não tem permissões suficientes para visualizar.");

        const acaoCorretiva = await acaoCorretivaRepository.buscarPorId(prisma, registroId);
        return { ...registro, ...acaoCorretiva };
    },

    async listarAcoesCorretivas(ator: { id: string, papeis: Papel[] }, filtros: { naoConformidadeId?: string, estado?: EstadoRegistro }) {
        const papel = temPapel(ator, "VISUALIZAR");
        if (!papel) throw new SemPermissaoError("Você não tem permissões suficientes para visualizar.");

        const registros = await acaoCorretivaRepository.listar(prisma, filtros);
        return registros.map((item) => {
            const { registro, ...resto } = item;
            return { ...registro, ...resto };
        });
    }
}