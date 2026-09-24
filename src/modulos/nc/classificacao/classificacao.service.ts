import { atribuicaoRepository } from "../../../compartilhado/atribuicao/atribuicao.repository.js";
import { auditoriaRepository } from "../../../compartilhado/auditoria/auditoria.repository.js";
import { EntidadeAuditada } from "../../../compartilhado/auditoria/entidades-auditadas.js";
import type { Ator } from "../../../compartilhado/entidades/ator.js";
import type { EstadoRegistro } from "../../../compartilhado/entidades/estados.js";
import { NaoEncontradoError, SemPermissaoError, TransicaoInvalidaError } from "../../../compartilhado/errors/errors.js";
import { temPapel } from "../../../compartilhado/permissoes/pode-executar.js";
import { prisma } from "../../../compartilhado/prisma/cliente.js";
import { cicloVidaService } from "../../../compartilhado/registro/ciclo-vida.service.js";
import type { DecisaoInput } from "../../../compartilhado/registro/decidir.schema.js";
import { ESTADOS_EDITAVEIS } from "../../../compartilhado/registro/estados-editaveis.js";
import { registroRepository } from "../../../compartilhado/registro/registro.repository.js";
import { ncRepository } from "../nc/nc.repository.js";
import { classificacaoRepository } from "./classificacao.repository.js";
import {
    type ClassificacaoRascunhoInput,
    classificacaoFechamentoSchema,
    classificacaoPublicacaoSchema,
} from "./classificacao.schema.js";

export const classificacaoService = {
    async criarRascunhoClassificacao(ator: Ator, naoConformidadeId: string, dados: ClassificacaoRascunhoInput) {
        return prisma.$transaction(async (tx) => {
            const papel = temPapel(ator, "CLASSIFICAR");

            if (!papel) {
                throw new SemPermissaoError("Você não tem permissões suficientes para criar um novo rascunho.");
            }

            const nc = await ncRepository.buscarPorId(tx, naoConformidadeId);

            if (nc === null) {
                throw new NaoEncontradoError("A Não Conformidade não existe ou não foi encontrada");
            }

            const registro = await cicloVidaService.criarRascunho(tx, { tipo: "CLASSIFICACAO", criadoPorId: ator.id });

            const classificacao = await classificacaoRepository.criar(tx, {
                id: registro.id,
                naoConformidadeId,
                ...dados,
            });

            await atribuicaoRepository.inserirAtribuicao(tx, registro.id, ator.id, ator.id, "COLABORADOR");

            return { ...registro, ...classificacao };
        });
    },

    async atualizarClassificacao(registroId: string, ator: Ator, dados: ClassificacaoRascunhoInput) {
        return prisma.$transaction(async (tx) => {
            const registro = await registroRepository.buscarPorId(tx, registroId);

            if (registro === null) {
                throw new NaoEncontradoError("Item não encontrado.");
            }

            if (!ESTADOS_EDITAVEIS.includes(registro.estado)) {
                throw new TransicaoInvalidaError('O item precisa estar no status "Rascunho" ou "Aberto".');
            }

            const papel = temPapel(ator, "CLASSIFICAR");
            const atribuicao = await atribuicaoRepository.ehColaborador(tx, registroId, ator.id);

            if (!papel || !atribuicao) {
                throw new SemPermissaoError("Você não tem permissões suficientes para atualizar este rascunho.");
            }

            const classificacaoAntes = await classificacaoRepository.buscarPorId(tx, registroId);
            const classificacaoAtualizada = await classificacaoRepository.atualizar(tx, registroId, dados);

            await auditoriaRepository.registrar(tx, {
                entidade: EntidadeAuditada[registro.tipo],
                entidadeId: registro.id,
                acao: "SALVAR_RASCUNHO",
                usuarioId: ator.id,
                antes: classificacaoAntes,
                depois: classificacaoAtualizada,
            });

            return classificacaoAtualizada;
        });
    },

    async excluirRascunhoClassificacao(registroId: string, ator: Ator) {
        return prisma.$transaction(async (tx) => {
            const registroExcluido = await cicloVidaService.excluirRascunho(tx, registroId, ator, "CLASSIFICAR");

            return registroExcluido;
        });
    },

    async publicarClassificacao(registroId: string, ator: Ator) {
        return prisma.$transaction(async (tx) => {
            const classificacao = await classificacaoRepository.buscarPorId(tx, registroId);

            if (classificacao === null) {
                throw new NaoEncontradoError("Item não encontrado.");
            }

            const registroPublicado = await cicloVidaService.publicar(
                tx,
                registroId,
                ator,
                classificacao,
                (dadosParaValidar) => classificacaoPublicacaoSchema.parse(dadosParaValidar),
                "CLASSIFICAR",
            );

            return { ...registroPublicado, ...classificacao };
        });
    },

    async submeterClassificacao(registroId: string, ator: Ator) {
        return prisma.$transaction(async (tx) => {
            const classificacao = await classificacaoRepository.buscarPorId(tx, registroId);

            if (classificacao === null) {
                throw new NaoEncontradoError("Item não encontrado.");
            }

            const registroSubmetido = await cicloVidaService.submeter(
                tx,
                registroId,
                ator,
                classificacao,
                (dadosParaValidar) => classificacaoFechamentoSchema.parse(dadosParaValidar),
                "CLASSIFICAR",
            );

            return { ...registroSubmetido, ...classificacao };
        });
    },

    async decidirClassificacao(registroId: string, ator: Ator, dados: DecisaoInput) {
        return prisma.$transaction(async (tx) => {
            const registroDecidido = await cicloVidaService.decidir(tx, registroId, ator, dados);
            const classificacao = await classificacaoRepository.buscarPorId(tx, registroId);

            return { ...registroDecidido, ...classificacao };
        });
    },

    async buscarPorIdClassificacao(registroId: string, ator: Ator) {
        const registro = await registroRepository.buscarPorId(prisma, registroId);

        if (registro === null) {
            throw new NaoEncontradoError("Item não encontrado.");
        }
        const papel = temPapel(ator, "VISUALIZAR");

        if (!papel) {
            throw new SemPermissaoError("Você não tem permissões suficientes para visualizar.");
        }

        const classificacao = await classificacaoRepository.buscarPorId(prisma, registroId);

        return { ...registro, ...classificacao };
    },

    async listarClassificacoes(
        ator: Ator,
        filtros: {
            naoConformidadeId?: string;
            estado?: EstadoRegistro;
        },
    ) {
        const papel = temPapel(ator, "VISUALIZAR");

        if (!papel) {
            throw new SemPermissaoError("Você não tem permissões suficientes para visualizar.");
        }

        const registros = await classificacaoRepository.listarClassificacoes(prisma, filtros);

        const classificacaoCompleta = registros.map((item) => {
            const { registro, ...resto } = item;
            return { ...registro, ...resto };
        });

        return classificacaoCompleta;
    },
};
