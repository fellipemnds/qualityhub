import { aprovacaoRepository } from "../../../compartilhado/aprovacao/aprovacao.repository.js";
import { atribuicaoRepository } from "../../../compartilhado/atribuicao/atribuicao.repository.js";
import { auditoriaRepository } from "../../../compartilhado/auditoria/auditoria.repository.js";
import { EntidadeAuditada } from "../../../compartilhado/auditoria/entidades-auditadas.js";
import type { Ator } from "../../../compartilhado/entidades/ator.js";
import type { EstadoRegistro } from "../../../compartilhado/entidades/estados.js";
import { NaoEncontradoError, SemPermissaoError, TransicaoInvalidaError } from "../../../compartilhado/errors/errors.js";
import { temPapel } from "../../../compartilhado/permissoes/pode-executar.js";
import { prisma } from "../../../compartilhado/prisma/cliente.js";
import type { ClientePrisma } from "../../../compartilhado/prisma/tipos.js";
import { buscarRegistroDoTipoOuFalhar } from "../../../compartilhado/registro/buscar-registro-do-tipo.js";
import { cicloVidaService } from "../../../compartilhado/registro/ciclo-vida.service.js";
import type { DecisaoInput } from "../../../compartilhado/registro/decidir.schema.js";
import { ESTADOS_EDITAVEIS } from "../../../compartilhado/registro/estados-editaveis.js";
import { LIMITE_PADRAO_PAGINACAO, paginar } from "../../../compartilhado/registro/paginacao-cursor.js";
import { registroRepository } from "../../../compartilhado/registro/registro.repository.js";
import { classificacaoRepository } from "../classificacao/classificacao.repository.js";
import { contencaoRepository } from "../contencao/contencao.repository.js";
import { investigacaoRepository } from "../investigacao/investigacao.repository.js";
import { avaliarFechamentoNC, type DadosFechamentoNC } from "./avaliar-fechamento.js";
import { ncRepository } from "./nc.repository.js";
import {
    type NCFiltrosListagemInput,
    type NCRascunhoInput,
    ncFechamentoSchema,
    ncPublicacaoSchema,
} from "./nc.schema.js";

// Carrega do banco o que a guarda de fechamento precisa (RN-21): a decisão fica com a função pura
async function carregarDadosFechamento(
    cliente: ClientePrisma,
    naoConformidadeId: string,
    nc: { riscosRevisados: string | null; mudancasSGQ: string | null },
): Promise<DadosFechamentoNC> {
    const filtro = { naoConformidadeId };
    const comoFilho = (filho: { registro: { id: string; codigo: string | null; estado: EstadoRegistro } }) => ({
        id: filho.registro.id,
        codigo: filho.registro.codigo,
        estado: filho.registro.estado,
    });

    return {
        riscosRevisados: nc.riscosRevisados,
        mudancasSGQ: nc.mudancasSGQ,
        temAprovador: await atribuicaoRepository.existeAprovador(cliente, naoConformidadeId),
        classificacoes: (await classificacaoRepository.listarClassificacoes(cliente, filtro)).map(comoFilho),
        investigacoes: (await investigacaoRepository.listarInvestigacoes(cliente, filtro)).map(comoFilho),
        contencoes: (await contencaoRepository.listarContencoes(cliente, filtro)).map(comoFilho),
    };
}

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
            const registro = await buscarRegistroDoTipoOuFalhar(tx, registroId, "NAO_CONFORMIDADE");

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
            // A edição também é gravação no Registro: o atualizadoEm muda (B24), e a trava do B19 recusa editar um item
            // que mudou de estado no meio
            const registroTocado = await registroRepository.atualizar(tx, registroId, registro.estado, {});

            await auditoriaRepository.registrar(tx, {
                entidade: EntidadeAuditada[registro.tipo],
                entidadeId: registro.id,
                acao: "EDITAR",
                usuarioId: ator.id,
                antes: ncAntes,
                depois: ncAtualizada,
            });

            return { ...registroTocado, ...ncAtualizada };
        });
    },

    async excluirRascunhoNC(registroId: string, ator: Ator) {
        return prisma.$transaction(async (tx) => {
            const registroExcluido = await cicloVidaService.excluirRascunho(tx, registroId, "NAO_CONFORMIDADE", ator);

            return registroExcluido;
        });
    },

    async publicarNC(registroId: string, ator: Ator) {
        return prisma.$transaction(async (tx) => {
            const nc = await ncRepository.buscarPorId(tx, registroId);

            if (nc === null) {
                throw new NaoEncontradoError("Item não encontrado.");
            }

            const registroPublicado = await cicloVidaService.publicar(tx, registroId, "NAO_CONFORMIDADE", ator, () =>
                ncPublicacaoSchema.parse(nc),
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

            const faltando = avaliarFechamentoNC(await carregarDadosFechamento(tx, registroId, nc)).filter(
                (item) => !item.atendido,
            );

            // A guarda roda como validador, depois das checagens de estado, permissão e aprovador do ciclo de vida:
            // quem não pode submeter recebe 403, não a lista
            const registroSubmetido = await cicloVidaService.submeter(tx, registroId, "NAO_CONFORMIDADE", ator, () => {
                if (faltando.length > 0) {
                    throw new TransicaoInvalidaError(
                        "Ainda falta o que está na lista para submeter esta Não Conformidade para fechamento.",
                        faltando,
                    );
                }
                ncFechamentoSchema.parse(nc);
            });

            return { ...registroSubmetido, ...nc };
        });
    },

    // A mesma guarda do submeter, só para ler: a tela mostra o checklist sem tentar submeter (TRD §5)
    async checklistFechamentoNC(registroId: string, ator: Ator) {
        const nc = await ncRepository.buscarPorId(prisma, registroId);

        if (nc === null) {
            throw new NaoEncontradoError("Item não encontrado.");
        }

        if (!temPapel(ator, "VISUALIZAR")) {
            throw new SemPermissaoError("Você não tem permissões suficientes para visualizar.");
        }

        return avaliarFechamentoNC(await carregarDadosFechamento(prisma, registroId, nc));
    },

    // O colaborador desiste do envio: volta a ABERTO, sem decisão registrada (RN-48)
    async retirarNC(registroId: string, ator: Ator) {
        return prisma.$transaction(async (tx) => {
            const registroRetirado = await cicloVidaService.retirar(tx, registroId, "NAO_CONFORMIDADE", ator);
            const nc = await ncRepository.buscarPorId(tx, registroId);

            return { ...registroRetirado, ...nc };
        });
    },

    async decidirNC(registroId: string, ator: Ator, dados: DecisaoInput) {
        return prisma.$transaction(async (tx) => {
            const registroDecidido = await cicloVidaService.decidir(tx, registroId, "NAO_CONFORMIDADE", ator, dados);
            const nc = await ncRepository.buscarPorId(tx, registroId);

            return { ...registroDecidido, ...nc };
        });
    },

    async reabrirNC(registroId: string, ator: Ator, motivo: string) {
        return prisma.$transaction(async (tx) => {
            const registroReaberto = await cicloVidaService.reabrir(tx, registroId, "NAO_CONFORMIDADE", ator, motivo);
            const nc = await ncRepository.buscarPorId(tx, registroId);

            return { ...registroReaberto, ...nc };
        });
    },

    async cancelarNC(registroId: string, ator: Ator, motivo: string) {
        return prisma.$transaction(async (tx) => {
            const registroCancelado = await cicloVidaService.cancelar(tx, registroId, "NAO_CONFORMIDADE", ator, motivo);
            const nc = await ncRepository.buscarPorId(tx, registroId);

            return { ...registroCancelado, ...nc };
        });
    },

    async buscarPorIdNC(registroId: string, ator: Ator) {
        const registro = await buscarRegistroDoTipoOuFalhar(prisma, registroId, "NAO_CONFORMIDADE");

        const nc = await ncRepository.buscarPorId(prisma, registroId);

        const papel = temPapel(ator, "VISUALIZAR");

        if (!papel) {
            throw new SemPermissaoError("Você não tem permissões suficientes para visualizar.");
        }

        const ultimoMotivoReprovacao = await aprovacaoRepository.ultimoMotivoReprovacao(prisma, registroId);

        return { ...registro, ...nc, ultimoMotivoReprovacao };
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
