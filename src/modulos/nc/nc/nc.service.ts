import { atribuicaoRepository } from "../../../compartilhado/atribuicao/atribuicao.repository.js";
import { auditoriaRepository } from "../../../compartilhado/auditoria/auditoria.repository.js";
import { EntidadeAuditada } from "../../../compartilhado/auditoria/entidades-auditadas.js";
import type { Ator } from "../../../compartilhado/entidades/ator.js";
import { NaoEncontradoError, SemPermissaoError, TransicaoInvalidaError } from "../../../compartilhado/errors/errors.js";
import { temPapel } from "../../../compartilhado/permissoes/pode-executar.js";
import { prisma } from "../../../compartilhado/prisma/cliente.js";
import { cicloVidaService } from "../../../compartilhado/registro/ciclo-vida.service.js";
import type { DecisaoInput } from "../../../compartilhado/registro/decidir.schema.js";
import { ESTADOS_EDITAVEIS } from "../../../compartilhado/registro/estados-editaveis.js";
import { LIMITE_PADRAO_PAGINACAO, paginar } from "../../../compartilhado/registro/paginacao-cursor.js";
import { registroRepository } from "../../../compartilhado/registro/registro.repository.js";
import { classificacaoRepository } from "../classificacao/classificacao.repository.js";
import { contencaoRepository } from "../contencao/contencao.repository.js";
import { investigacaoRepository } from "../investigacao/investigacao.repository.js";
import { ncRepository } from "./nc.repository.js";
import {
    type NCFiltrosListagemInput,
    type NCRascunhoInput,
    ncFechamentoSchema,
    ncPublicacaoSchema,
} from "./nc.schema.js";

export const ncService = {
    async criarRascunhoNC(ator: Ator, dados: NCRascunhoInput) {
        return prisma.$transaction(async (tx) => {
            const papel = temPapel(ator, "GERENCIAR_RASCUNHO");

            if (!papel) {
                throw new SemPermissaoError("Você não tem permissões suficientes para criar um novo rascunho.");
            }

            const registro = await cicloVidaService.criarRascunho(tx, {
                tipo: "NAO_CONFORMIDADE",
                criadoPorId: ator.id,
            });

            const nc = await ncRepository.criar(tx, { id: registro.id, ...dados });

            await atribuicaoRepository.inserirAtribuicao(tx, registro.id, ator.id, ator.id, "COLABORADOR");

            return { ...registro, ...nc };
        });
    },

    async atualizarNC(registroId: string, ator: Ator, dados: NCRascunhoInput) {
        return prisma.$transaction(async (tx) => {
            const registro = await registroRepository.buscarPorId(tx, registroId);

            if (registro === null) {
                throw new NaoEncontradoError("Item não encontrado.");
            }

            if (!ESTADOS_EDITAVEIS.includes(registro.estado)) {
                throw new TransicaoInvalidaError('O item precisa estar no status "Rascunho" ou "Aberto".');
            }

            const papel = temPapel(ator, "GERENCIAR_RASCUNHO");
            const atribuicao = await atribuicaoRepository.ehColaborador(tx, registroId, ator.id);

            if (!papel || !atribuicao) {
                throw new SemPermissaoError("Você não tem permissões suficientes para atualizar este rascunho.");
            }

            const ncAntes = await ncRepository.buscarPorId(tx, registroId);
            const ncAtualizada = await ncRepository.atualizar(tx, registroId, dados);

            await auditoriaRepository.registrar(tx, {
                entidade: EntidadeAuditada[registro.tipo],
                entidadeId: registro.id,
                acao: "SALVAR_RASCUNHO",
                usuarioId: ator.id,
                antes: ncAntes,
                depois: ncAtualizada,
            });

            return ncAtualizada;
        });
    },

    async excluirRascunhoNC(registroId: string, ator: Ator) {
        return prisma.$transaction(async (tx) => {
            const registroExcluido = await cicloVidaService.excluirRascunho(tx, registroId, ator);

            return registroExcluido;
        });
    },

    async publicarNC(registroId: string, ator: Ator) {
        return prisma.$transaction(async (tx) => {
            const nc = await ncRepository.buscarPorId(tx, registroId);

            if (nc === null) {
                throw new NaoEncontradoError("Item não encontrado.");
            }

            const registroPublicado = await cicloVidaService.publicar(tx, registroId, ator, nc, (dadosParaValidar) =>
                ncPublicacaoSchema.parse(dadosParaValidar),
            );

            return { ...registroPublicado, ...nc };
        });
    },

    async submeterNC(registroId: string, ator: Ator) {
        return prisma.$transaction(async (tx) => {
            const nc = await ncRepository.buscarPorId(tx, registroId);

            if (nc === null) {
                throw new NaoEncontradoError("Item não encontrado.");
            }

            const classificacoes = await classificacaoRepository.listarClassificacoes(tx, {
                naoConformidadeId: registroId,
            });
            const temClassificacaoFechada = classificacoes.some((c) => c.registro.estado === "FECHADO");

            if (!temClassificacaoFechada) {
                throw new TransicaoInvalidaError(
                    "É necessário ao menos uma Classificação FECHADA para submeter esta Não Conformidade para fechamento.",
                );
            }

            const investigacoes = await investigacaoRepository.listarInvestigacoes(tx, {
                naoConformidadeId: registroId,
            });
            const temInvestigacaoFechada = investigacoes.some((i) => i.registro.estado === "FECHADO");

            if (!temInvestigacaoFechada) {
                throw new TransicaoInvalidaError(
                    "É necessário ao menos uma Investigação FECHADA para submeter esta Não Conformidade para fechamento.",
                );
            }

            const contencoes = await contencaoRepository.listarContencoes(tx, { naoConformidadeId: registroId });
            const temContencaoPendente = contencoes.some(
                (c) => c.registro.estado !== "FECHADO" && c.registro.estado !== "CANCELADO",
            );

            if (temContencaoPendente) {
                throw new TransicaoInvalidaError(
                    "Existe uma Contenção pendente — ela precisa estar FECHADA ou CANCELADA para submeter esta Não Conformidade para fechamento.",
                );
            }

            const registroSubmetido = await cicloVidaService.submeter(tx, registroId, ator, nc, (dadosParaValidar) =>
                ncFechamentoSchema.parse(dadosParaValidar),
            );

            return { ...registroSubmetido, ...nc };
        });
    },

    async decidirNC(registroId: string, ator: Ator, dados: DecisaoInput) {
        return prisma.$transaction(async (tx) => {
            const registroDecidido = await cicloVidaService.decidir(tx, registroId, ator, dados);
            const nc = await ncRepository.buscarPorId(tx, registroId);

            return { ...registroDecidido, ...nc };
        });
    },

    async reabrirNC(registroId: string, ator: Ator, motivo: string) {
        return prisma.$transaction(async (tx) => {
            const registroReaberto = await cicloVidaService.reabrir(tx, registroId, ator, motivo);
            const nc = await ncRepository.buscarPorId(tx, registroId);

            return { ...registroReaberto, ...nc };
        });
    },

    async cancelarNC(registroId: string, ator: Ator, motivo: string) {
        return prisma.$transaction(async (tx) => {
            const registroCancelado = await cicloVidaService.cancelar(tx, registroId, ator, motivo);
            const nc = await ncRepository.buscarPorId(tx, registroId);

            return { ...registroCancelado, ...nc };
        });
    },

    async buscarPorIdNC(registroId: string, ator: Ator) {
        const registro = await registroRepository.buscarPorId(prisma, registroId);

        if (registro === null) {
            throw new NaoEncontradoError("Item não encontrado.");
        }

        const nc = await ncRepository.buscarPorId(prisma, registroId);

        const papel = temPapel(ator, "VISUALIZAR");

        if (!papel) {
            throw new SemPermissaoError("Você não tem permissões suficientes para visualizar.");
        }

        return { ...registro, ...nc };
    },

    async listarNC(ator: Ator, filtros: NCFiltrosListagemInput) {
        const papel = temPapel(ator, "VISUALIZAR");

        if (!papel) {
            throw new SemPermissaoError("Você não tem permissões suficientes para visualizar.");
        }

        const ncs = await ncRepository.listar(prisma, ator.id, filtros);

        const registros = ncs.map((item) => {
            const { registro, ...resto } = item;
            return { ...registro, ...resto };
        });

        const resultadosPagina = paginar(registros, filtros.limit ?? LIMITE_PADRAO_PAGINACAO);

        return resultadosPagina;
    },
};
