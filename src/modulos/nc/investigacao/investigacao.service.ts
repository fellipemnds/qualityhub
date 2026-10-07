import { atribuicaoRepository } from "../../../compartilhado/atribuicao/atribuicao.repository.js";
import { herdarAprovadorDaNC } from "../../../compartilhado/atribuicao/herdar-aprovador.js";
import { auditoriaRepository } from "../../../compartilhado/auditoria/auditoria.repository.js";
import { EntidadeAuditada } from "../../../compartilhado/auditoria/entidades-auditadas.js";
import type { Ator } from "../../../compartilhado/entidades/ator.js";
import type { EstadoRegistro } from "../../../compartilhado/entidades/estados.js";
import { NaoEncontradoError, SemPermissaoError, TransicaoInvalidaError } from "../../../compartilhado/errors/errors.js";
import { temPapel } from "../../../compartilhado/permissoes/pode-executar.js";
import { prisma } from "../../../compartilhado/prisma/cliente.js";
import { buscarRegistroDoTipoOuFalhar } from "../../../compartilhado/registro/buscar-registro-do-tipo.js";
import { cicloVidaService } from "../../../compartilhado/registro/ciclo-vida.service.js";
import type { DecisaoInput } from "../../../compartilhado/registro/decidir.schema.js";
import { ESTADOS_EDITAVEIS } from "../../../compartilhado/registro/estados-editaveis.js";
import { registroRepository } from "../../../compartilhado/registro/registro.repository.js";
import { acaoCorretivaRepository } from "../acao-corretiva/acao-corretiva.repository.js";
import { ncRepository } from "../nc/nc.repository.js";
import { avaliarCancelamentoInvestigacao } from "./avaliar-cancelamento.js";
import { type AcaoNaGuarda, avaliarSubmissaoInvestigacao } from "./avaliar-submissao.js";
import { hipoteseRepository } from "./hipotese.repository.js";
import { hipoteseFechamentoSchema } from "./hipotese.schema.js";
import { investigacaoRepository } from "./investigacao.repository.js";
import {
    type InvestigacaoRascunhoInput,
    investigacaoFechamentoSchema,
    investigacaoPublicacaoSchema,
} from "./investigacao.schema.js";

export const investigacaoService = {
    async criarRascunhoInvestigacao(ator: Ator, naoConformidadeId: string, dados: InvestigacaoRascunhoInput) {
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

            const investigacao = await investigacaoRepository.criar(tx, {
                id: registro.id,
                naoConformidadeId,
                ...dados,
            });

            await atribuicaoRepository.inserirAtribuicao(tx, registro.id, ator.id, ator.id, "COLABORADOR");
            await herdarAprovadorDaNC(tx, naoConformidadeId, registro.id, ator.id);

            return { ...registro, ...investigacao };
        });
    },

    async atualizarInvestigacao(registroId: string, ator: Ator, dados: InvestigacaoRascunhoInput) {
        return prisma.$transaction(async (tx) => {
            const registro = await buscarRegistroDoTipoOuFalhar(tx, registroId, "INVESTIGACAO");

            if (!ESTADOS_EDITAVEIS.includes(registro.estado)) {
                throw new TransicaoInvalidaError('O item precisa estar no status "Rascunho" ou "Aberto".');
            }

            const papel = temPapel(ator, "GERENCIAR_RASCUNHO");
            const atribuicao = await atribuicaoRepository.ehColaborador(tx, registroId, ator.id);

            if (!papel || !atribuicao) {
                throw new SemPermissaoError("Você não tem permissões suficientes para atualizar este rascunho.");
            }

            const investigacaoAntes = await investigacaoRepository.buscarPorId(tx, registroId);
            const investigacaoAtualizada = await investigacaoRepository.atualizar(tx, registroId, dados);
            // A edição também é gravação no Registro: o atualizadoEm muda (B24), e a trava do B19 recusa editar um item
            // que mudou de estado no meio
            await registroRepository.atualizar(tx, registroId, registro.estado, {});

            await auditoriaRepository.registrar(tx, {
                entidade: EntidadeAuditada[registro.tipo],
                entidadeId: registro.id,
                acao: "SALVAR_RASCUNHO",
                usuarioId: ator.id,
                antes: investigacaoAntes,
                depois: investigacaoAtualizada,
            });

            return investigacaoAtualizada;
        });
    },

    async excluirRascunhoInvestigacao(registroId: string, ator: Ator) {
        return prisma.$transaction(async (tx) => {
            const registroExcluido = await cicloVidaService.excluirRascunho(tx, registroId, "INVESTIGACAO", ator);

            return registroExcluido;
        });
    },

    async publicarInvestigacao(registroId: string, ator: Ator) {
        return prisma.$transaction(async (tx) => {
            const investigacao = await investigacaoRepository.buscarPorId(tx, registroId);

            if (investigacao === null) {
                throw new NaoEncontradoError("Item não encontrado.");
            }

            const registroPublicado = await cicloVidaService.publicar(tx, registroId, "INVESTIGACAO", ator, () =>
                investigacaoPublicacaoSchema.parse(investigacao),
            );

            return { ...registroPublicado, ...investigacao };
        });
    },

    async submeterInvestigacao(registroId: string, ator: Ator) {
        return prisma.$transaction(async (tx) => {
            const investigacao = await investigacaoRepository.buscarPorId(tx, registroId);
            if (investigacao === null) {
                throw new NaoEncontradoError("Item não encontrado.");
            }

            const hipoteses = await hipoteseRepository.listarPorInvestigacao(tx, registroId);
            for (const hipotese of hipoteses) {
                hipoteseFechamentoSchema.parse(hipotese);
            }

            // Os planos das ações ligadas são aprovados antes do envio (RN-24, B5). Como na NC, a guarda roda como
            // validador, depois de estado, permissão e aprovador
            // Uma consulta por vez: dentro da transação, todas usam a mesma conexão
            const acoes: AcaoNaGuarda[] = [];
            for (const acao of await acaoCorretivaRepository.listarPorInvestigacao(tx, registroId)) {
                acoes.push({
                    id: acao.id,
                    codigo: acao.registro.codigo,
                    estado: acao.registro.estado,
                    planoAprovado: await acaoCorretivaRepository.planoAprovado(tx, acao.id),
                });
            }
            const faltando = avaliarSubmissaoInvestigacao({ acoes }).filter((item) => !item.atendido);

            const registroSubmetido = await cicloVidaService.submeter(tx, registroId, "INVESTIGACAO", ator, () => {
                if (faltando.length > 0) {
                    throw new TransicaoInvalidaError(
                        "Ainda falta o que está na lista para submeter esta investigação.",
                        faltando,
                    );
                }
                investigacaoFechamentoSchema.parse(investigacao);
            });

            return { ...registroSubmetido, ...investigacao };
        });
    },

    // O colaborador desiste do envio: volta a ABERTO, sem decisão registrada (RN-48)
    async retirarInvestigacao(registroId: string, ator: Ator) {
        return prisma.$transaction(async (tx) => {
            const registroRetirado = await cicloVidaService.retirar(tx, registroId, "INVESTIGACAO", ator);
            const investigacao = await investigacaoRepository.buscarPorId(tx, registroId);

            return { ...registroRetirado, ...investigacao };
        });
    },

    async decidirInvestigacao(registroId: string, ator: Ator, dados: DecisaoInput) {
        return prisma.$transaction(async (tx) => {
            const registroDecidido = await cicloVidaService.decidir(tx, registroId, "INVESTIGACAO", ator, dados);
            const investigacao = await investigacaoRepository.buscarPorId(tx, registroId);

            return { ...registroDecidido, ...investigacao };
        });
    },

    async cancelarInvestigacao(registroId: string, ator: Ator, motivo: string) {
        return prisma.$transaction(async (tx) => {
            // As ações ligadas precisam estar canceladas ou fechadas, para nenhuma ficar solta (RN-50)
            const acoes = (await acaoCorretivaRepository.listarPorInvestigacao(tx, registroId)).map((acao) => ({
                id: acao.id,
                codigo: acao.registro.codigo,
                estado: acao.registro.estado,
            }));
            const faltando = avaliarCancelamentoInvestigacao({ acoes }).filter((item) => !item.atendido);

            const registroCancelado = await cicloVidaService.cancelar(
                tx,
                registroId,
                "INVESTIGACAO",
                ator,
                motivo,
                () => {
                    if (faltando.length > 0) {
                        throw new TransicaoInvalidaError(
                            "Ainda falta o que está na lista para cancelar esta investigação.",
                            faltando,
                        );
                    }
                },
            );
            const investigacao = await investigacaoRepository.buscarPorId(tx, registroId);

            return { ...registroCancelado, ...investigacao };
        });
    },

    async buscarPorIdInvestigacao(registroId: string, ator: Ator) {
        const papel = temPapel(ator, "VISUALIZAR");

        if (!papel) {
            throw new SemPermissaoError("Você não tem permissões suficientes para visualizar.");
        }

        const registro = await buscarRegistroDoTipoOuFalhar(prisma, registroId, "INVESTIGACAO");

        const investigacao = await investigacaoRepository.buscarPorId(prisma, registroId);

        return { ...registro, ...investigacao };
    },

    async listarInvestigacoes(
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

        const registros = await investigacaoRepository.listarInvestigacoes(prisma, filtros);

        const investigacaoCompleta = registros.map((item) => {
            const { registro, ...resto } = item;
            return { ...registro, ...resto };
        });

        return investigacaoCompleta;
    },
};
