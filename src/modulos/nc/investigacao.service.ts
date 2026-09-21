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
import { registroRepository } from "../../compartilhado/registro/registro.repository.js";
import { investigacaoRepository } from "./investigacao.repository.js";
import { investigacaoPublicacaoSchema, InvestigacaoRascunhoInput } from "./investigacao.schema.js";
import { ncRepository } from "./nc.repository.js";

export const investigacaoService = {
    async criarRascunhoInvestigacao(ator: { id: string, papeis: Papel[] }, naoConformidadeId: string, dados: InvestigacaoRascunhoInput) {
        return prisma.$transaction(async (tx) => {
            const papel = temPapel(ator, "GERENCIAR_RASCUNHO");

            if (!papel) {
                throw new SemPermissaoError("Você não tem permissões suficientes para criar um novo rascunho.");
            }

            const nc = await ncRepository.buscarPorId(tx, naoConformidadeId);

            if (nc === null) {
                throw new NaoEncontradoError("A Não Conformidade não existe ou não foi encontrada");
            }

            const registro = await cicloVidaService.criarRascunho(tx, { tipo: "INVESTIGACAO", criadoPorId: ator.id });

            const investigacao = await investigacaoRepository.criar(tx, { id: registro.id, naoConformidadeId, ...dados });

            await atribuicaoRepository.inserirAtribuicao(tx, registro.id, ator.id, ator.id, "COLABORADOR");

            return { ...registro, ...investigacao };
        });
    },

    async salvarRascunhoInvestigacao(registroId: string, ator: { id: string, papeis: Papel[] }, dados: InvestigacaoRascunhoInput) {
        return prisma.$transaction(async (tx) => {
            const registro = await registroRepository.buscarPorId(tx, registroId);

            if (registro === null) {
                throw new NaoEncontradoError("Item não encontrado.");
            }

            if (registro.estado !== "RASCUNHO") {
                throw new TransicaoInvalidaError('O item precisa estar no status "Rascunho".')
            }

            const papel = temPapel(ator, "GERENCIAR_RASCUNHO");
            const atribuicao = await atribuicaoRepository.ehColaborador(tx, registroId, ator.id);

            if (!papel || !atribuicao) {
                throw new SemPermissaoError("Você não tem permissões suficientes para atualizar este rascunho.");
            }

            const investigacaoAntes = await investigacaoRepository.buscarPorId(tx, registroId);
            const investigacaoAtualizada = await investigacaoRepository.atualizar(tx, registroId, dados);

            await auditoriaRepository.registrar(tx, {
                entidade: EntidadeAuditada[registro.tipo],
                entidadeId: registro.id,
                acao: "SALVAR_RASCUNHO",
                usuarioId: ator.id,
                antes: investigacaoAntes,
                depois: investigacaoAtualizada
            });

            return investigacaoAtualizada;
        });
    },

    async excluirRascunhoInvestigacao(registroId: string, ator: { id: string, papeis: Papel[] }) {
        return prisma.$transaction(async (tx) => {
            const registroExcluido = await cicloVidaService.excluirRascunho(tx, registroId, ator);

            return registroExcluido;
        });
    },

    async publicarInvestigacao(registroId: string, ator: { id: string, papeis: Papel[] }) {
        return prisma.$transaction(async (tx) => {
            const investigacao = await investigacaoRepository.buscarPorId(tx, registroId);

            if (investigacao === null) {
                throw new NaoEncontradoError("Item não encontrado.");
            }

            const registroPublicado = await cicloVidaService.publicar(tx, registroId, ator, investigacao, (dadosParaValidar) => investigacaoPublicacaoSchema.parse(dadosParaValidar));

            return { ...registroPublicado, ...investigacao };
        });
    },

    async submeterInvestigacao(registroId: string, ator: { id: string, papeis: Papel[] }) {
        return prisma.$transaction(async (tx) => {
            const investigacao = await investigacaoRepository.buscarPorId(tx, registroId);

            if (investigacao === null) {
                throw new NaoEncontradoError("Item não encontrado.");
            }

            const registroSubmetido = await cicloVidaService.submeter(tx, registroId, ator, investigacao, (dadosParaValidar) => investigacaoPublicacaoSchema.parse(dadosParaValidar));

            return { ...registroSubmetido, ...investigacao };
        });
    },

    async decidirInvestigacao(registroId: string, ator: { id: string, papeis: Papel[] }, dados: DecisaoInput) {
        return prisma.$transaction(async (tx) => {
            const registroDecidido = await cicloVidaService.decidir(tx, registroId, ator, dados);
            const investigacao = await investigacaoRepository.buscarPorId(tx, registroId);

            return { ...registroDecidido, ...investigacao };
        });
    },

    async cancelarInvestigacao(registroId: string, ator: { id: string, papeis: Papel[] }, motivo: string) {
        return prisma.$transaction(async (tx) => {
            const registroCancelado = await cicloVidaService.cancelar(tx, registroId, ator, motivo);
            const investigacao = await investigacaoRepository.buscarPorId(tx, registroId);

            return { ...registroCancelado, ...investigacao };
        });
    },

    async buscarPorIdInvestigacao(registroId: string, ator: { id: string, papeis: Papel[] }) {
        const papel = temPapel(ator, "VISUALIZAR");

        if (!papel) {
            throw new SemPermissaoError("Você não tem permissões suficientes para visualizar.");
        }

        const registro = await registroRepository.buscarPorId(prisma, registroId);

        if (registro === null) {
            throw new NaoEncontradoError("Item não encontrado.");
        }

        const investigacao = await investigacaoRepository.buscarPorId(prisma, registroId);

        return { ...registro, ...investigacao };
    },

    async listarInvestigacoes(ator: { id: string, papeis: Papel[] }, filtros: {
        naoConformidadeId?: string,
        estado?: EstadoRegistro
    }) {
        const papel = temPapel(ator, "VISUALIZAR");

        if (!papel) {
            throw new SemPermissaoError("Você não tem permissões suficientes para visualizar.");
        }

        const registros = await investigacaoRepository.listarInvestigacoes(prisma, filtros);

        const investigacaoCompleta = registros.map((item) => {
            const { registro, ...resto } = item;
            return { ...registro, ...resto };
        });

        return investigacaoCompleta;
    }
}