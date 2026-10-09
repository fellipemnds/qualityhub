import { aprovacaoRepository } from "../../../compartilhado/aprovacao/aprovacao.repository.js";
import { atribuicaoRepository } from "../../../compartilhado/atribuicao/atribuicao.repository.js";
import { herdarAprovadorDaNC } from "../../../compartilhado/atribuicao/herdar-aprovador.js";
import { auditoriaRepository } from "../../../compartilhado/auditoria/auditoria.repository.js";
import { EntidadeAuditada } from "../../../compartilhado/auditoria/entidades-auditadas.js";
import type { Ator } from "../../../compartilhado/entidades/ator.js";
import { NaoEncontradoError, SemPermissaoError, TransicaoInvalidaError } from "../../../compartilhado/errors/errors.js";
import { temPapel } from "../../../compartilhado/permissoes/pode-executar.js";
import { prisma } from "../../../compartilhado/prisma/cliente.js";
import { buscarRegistroDoTipoOuFalhar } from "../../../compartilhado/registro/buscar-registro-do-tipo.js";
import { cicloVidaService } from "../../../compartilhado/registro/ciclo-vida.service.js";
import type { DecisaoInput } from "../../../compartilhado/registro/decidir.schema.js";
import { ESTADOS_EDITAVEIS } from "../../../compartilhado/registro/estados-editaveis.js";
import { LIMITE_PADRAO_PAGINACAO, paginar } from "../../../compartilhado/registro/paginacao-cursor.js";
import { registroRepository } from "../../../compartilhado/registro/registro.repository.js";
import { ncRepository } from "../nc/nc.repository.js";
import { travarNCParaFilhoNovo } from "../nc/travar-nc-para-filho-novo.js";
import { contencaoRepository } from "./contencao.repository.js";
import {
    type ContencaoFiltrosListagemInput,
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
            await travarNCParaFilhoNovo(tx, naoConformidadeId);

            const registro = await cicloVidaService.criarRascunho(tx, { tipo: "CONTENCAO", criadoPorId: ator.id });

            const contencao = await contencaoRepository.criar(tx, { id: registro.id, naoConformidadeId, ...dados });

            await atribuicaoRepository.inserirAtribuicao(tx, registro.id, ator.id, ator.id, "COLABORADOR");
            await herdarAprovadorDaNC(tx, naoConformidadeId, registro.id, ator.id);

            return { ...registro, ...contencao };
        });
    },

    async atualizarContencao(registroId: string, ator: Ator, dados: ContencaoRascunhoInput) {
        return prisma.$transaction(async (tx) => {
            const registro = await buscarRegistroDoTipoOuFalhar(tx, registroId, "CONTENCAO");

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
            // A edição também é gravação no Registro: o atualizadoEm muda (B24), e a trava do B19 recusa editar um item
            // que mudou de estado no meio
            const registroTocado = await registroRepository.atualizar(tx, registroId, registro.estado, {});

            await auditoriaRepository.registrar(tx, {
                entidade: EntidadeAuditada[registro.tipo],
                entidadeId: registro.id,
                acao: "EDITAR",
                usuarioId: ator.id,
                antes: contencaoAntes,
                depois: contencaoAtualizada,
            });

            return { ...registroTocado, ...contencaoAtualizada };
        });
    },

    async excluirRascunhoContencao(registroId: string, ator: Ator) {
        return prisma.$transaction(async (tx) => {
            const registroExcluido = await cicloVidaService.excluirRascunho(tx, registroId, "CONTENCAO", ator);

            return registroExcluido;
        });
    },

    async publicarContencao(registroId: string, ator: Ator) {
        return prisma.$transaction(async (tx) => {
            const contencao = await contencaoRepository.buscarPorId(tx, registroId);

            if (contencao === null) {
                throw new NaoEncontradoError("Item não encontrado.");
            }

            const registroPublicado = await cicloVidaService.publicar(tx, registroId, "CONTENCAO", ator, () =>
                contencaoPublicacaoSchema.parse(contencao),
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

            const registroSubmetido = await cicloVidaService.submeter(tx, registroId, "CONTENCAO", ator, () =>
                contencaoFechamentoSchema.parse(contencao),
            );

            return { ...registroSubmetido, ...contencao };
        });
    },

    // O colaborador desiste do envio: volta a ABERTO, sem decisão registrada (RN-48)
    async retirarContencao(registroId: string, ator: Ator) {
        return prisma.$transaction(async (tx) => {
            const registroRetirado = await cicloVidaService.retirar(tx, registroId, "CONTENCAO", ator);
            const contencao = await contencaoRepository.buscarPorId(tx, registroId);

            return { ...registroRetirado, ...contencao };
        });
    },

    async decidirContencao(registroId: string, ator: Ator, dados: DecisaoInput) {
        return prisma.$transaction(async (tx) => {
            const registroDecidido = await cicloVidaService.decidir(tx, registroId, "CONTENCAO", ator, dados);
            const contencao = await contencaoRepository.buscarPorId(tx, registroId);

            return { ...registroDecidido, ...contencao };
        });
    },

    async cancelarContencao(registroId: string, ator: Ator, motivo: string) {
        return prisma.$transaction(async (tx) => {
            const registroCancelado = await cicloVidaService.cancelar(tx, registroId, "CONTENCAO", ator, motivo);
            const contencao = await contencaoRepository.buscarPorId(tx, registroId);

            return { ...registroCancelado, ...contencao };
        });
    },

    async buscarPorIdContencao(registroId: string, ator: Ator) {
        const registro = await buscarRegistroDoTipoOuFalhar(prisma, registroId, "CONTENCAO");
        const papel = temPapel(ator, "VISUALIZAR");

        if (!papel) {
            throw new SemPermissaoError("Você não tem permissões suficientes para visualizar.");
        }

        const contencao = await contencaoRepository.buscarPorId(prisma, registroId);

        const ultimoMotivoReprovacao = await aprovacaoRepository.ultimoMotivoReprovacao(prisma, registroId);
        return { ...registro, ...contencao, ultimoMotivoReprovacao };
    },

    async listarContencoes(ator: Ator, filtros: ContencaoFiltrosListagemInput) {
        const papel = temPapel(ator, "VISUALIZAR");

        if (!papel) {
            throw new SemPermissaoError("Você não tem permissões suficientes para visualizar.");
        }

        // O limit vai sempre explícito: sem ele, o repositório traz todas (é o que a guarda de fechamento da NC usa)
        const limit = filtros.limit ?? LIMITE_PADRAO_PAGINACAO;
        const registros = await contencaoRepository.listarContencoes(prisma, { ...filtros, limit });

        const contencaoCompleta = registros.map((item) => {
            const { registro, ...resto } = item;
            return { ...registro, ...resto };
        });

        return paginar(contencaoCompleta, limit);
    },
};
