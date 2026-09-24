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
import { contencaoRepository } from "./contencao.repository.js";
import {
    type ContencaoRascunhoInput,
    contencaoFechamentoSchema,
    contencaoPublicacaoSchema,
} from "./contencao.schema.js";

export const contencaoService = {
    async criarRascunhoContencao(ator: Ator, naoConformidadeId: string, dados: ContencaoRascunhoInput) {
        return prisma.$transaction(async (tx) => {
            const papel = temPapel(ator, "GERENCIAR_RASCUNHO");

            if (!papel) {
                throw new SemPermissaoError("Você não tem permissões suficientes para criar um novo rascunho.");
            }

            const nc = await ncRepository.buscarPorId(tx, naoConformidadeId);

            if (nc === null) {
                throw new NaoEncontradoError("A Não Conformidade não existe ou não foi encontrada");
            }

            const registro = await cicloVidaService.criarRascunho(tx, { tipo: "CONTENCAO", criadoPorId: ator.id });

            const contencao = await contencaoRepository.criar(tx, { id: registro.id, naoConformidadeId, ...dados });

            await atribuicaoRepository.inserirAtribuicao(tx, registro.id, ator.id, ator.id, "COLABORADOR");

            return { ...registro, ...contencao };
        });
    },

    async atualizarContencao(registroId: string, ator: Ator, dados: ContencaoRascunhoInput) {
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

            const contencaoAntes = await contencaoRepository.buscarPorId(tx, registroId);
            const contencaoAtualizada = await contencaoRepository.atualizar(tx, registroId, dados);

            await auditoriaRepository.registrar(tx, {
                entidade: EntidadeAuditada[registro.tipo],
                entidadeId: registro.id,
                acao: "SALVAR_RASCUNHO",
                usuarioId: ator.id,
                antes: contencaoAntes,
                depois: contencaoAtualizada,
            });

            return contencaoAtualizada;
        });
    },

    async excluirRascunhoContencao(registroId: string, ator: Ator) {
        return prisma.$transaction(async (tx) => {
            const registroExcluido = await cicloVidaService.excluirRascunho(tx, registroId, ator);

            return registroExcluido;
        });
    },

    async publicarContencao(registroId: string, ator: Ator) {
        return prisma.$transaction(async (tx) => {
            const contencao = await contencaoRepository.buscarPorId(tx, registroId);

            if (contencao === null) {
                throw new NaoEncontradoError("Item não encontrado.");
            }

            const registroPublicado = await cicloVidaService.publicar(
                tx,
                registroId,
                ator,
                contencao,
                (dadosParaValidar) => contencaoPublicacaoSchema.parse(dadosParaValidar),
            );

            return { ...registroPublicado, ...contencao };
        });
    },

    async submeterContencao(registroId: string, ator: Ator) {
        return prisma.$transaction(async (tx) => {
            const contencao = await contencaoRepository.buscarPorId(tx, registroId);

            if (contencao === null) {
                throw new NaoEncontradoError("Item não encontrado.");
            }

            const registroSubmetido = await cicloVidaService.submeter(
                tx,
                registroId,
                ator,
                contencao,
                (dadosParaValidar) => contencaoFechamentoSchema.parse(dadosParaValidar),
            );

            return { ...registroSubmetido, ...contencao };
        });
    },

    async decidirContencao(registroId: string, ator: Ator, dados: DecisaoInput) {
        return prisma.$transaction(async (tx) => {
            const registroDecidido = await cicloVidaService.decidir(tx, registroId, ator, dados);
            const contencao = await contencaoRepository.buscarPorId(tx, registroId);

            return { ...registroDecidido, ...contencao };
        });
    },

    async cancelarContencao(registroId: string, ator: Ator, motivo: string) {
        return prisma.$transaction(async (tx) => {
            const registroCancelado = await cicloVidaService.cancelar(tx, registroId, ator, motivo);
            const contencao = await contencaoRepository.buscarPorId(tx, registroId);

            return { ...registroCancelado, ...contencao };
        });
    },

    async buscarPorIdContencao(registroId: string, ator: Ator) {
        const registro = await registroRepository.buscarPorId(prisma, registroId);

        if (registro === null) {
            throw new NaoEncontradoError("Item não encontrado.");
        }
        const papel = temPapel(ator, "VISUALIZAR");

        if (!papel) {
            throw new SemPermissaoError("Você não tem permissões suficientes para visualizar.");
        }

        const contencao = await contencaoRepository.buscarPorId(prisma, registroId);

        return { ...registro, ...contencao };
    },

    async listarContencoes(
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

        const registros = await contencaoRepository.listarContencoes(prisma, filtros);

        const contencaoCompleta = registros.map((item) => {
            const { registro, ...resto } = item;
            return { ...registro, ...resto };
        });

        return contencaoCompleta;
    },
};
