import { atribuicaoRepository } from "../../../compartilhado/atribuicao/atribuicao.repository.js";
import { auditoriaRepository } from "../../../compartilhado/auditoria/auditoria.repository.js";
import { EntidadeAuditada } from "../../../compartilhado/auditoria/entidades-auditadas.js";
import type { Ator } from "../../../compartilhado/entidades/ator.js";
import type { EstadoRegistro } from "../../../compartilhado/entidades/estados.js";
import { NaoEncontradoError, SemPermissaoError, TransicaoInvalidaError } from "../../../compartilhado/errors/errors.js";
import { temPapel } from "../../../compartilhado/permissoes/pode-executar.js";
import { prisma } from "../../../compartilhado/prisma/cliente.js";
import { cicloVidaService } from "../../../compartilhado/registro/ciclo-vida.service.js";
import { ESTADOS_EDITAVEIS } from "../../../compartilhado/registro/estados-editaveis.js";
import { registroRepository } from "../../../compartilhado/registro/registro.repository.js";
import { acaoCorretivaRepository } from "../acao-corretiva/acao-corretiva.repository.js";
import { verificacaoRepository } from "./verificacao.repository.js";
import { type VerificacaoRascunhoInput, verificacaoConclusaoSchema } from "./verificacao.schema.js";

export const verificacaoService = {
    async atualizarVerificacao(registroId: string, ator: Ator, dados: VerificacaoRascunhoInput) {
        return prisma.$transaction(async (tx) => {
            const registro = await registroRepository.buscarPorId(tx, registroId);
            if (registro === null) throw new NaoEncontradoError("Item não encontrado.");
            if (!ESTADOS_EDITAVEIS.includes(registro.estado)) {
                throw new TransicaoInvalidaError("Este item não pode mais ser editado neste estado.");
            }

            const papel = temPapel(ator, "CONCLUIR_VERIFICACAO");
            const atribuicao = await atribuicaoRepository.ehColaborador(tx, registroId, ator.id);
            if (!papel || !atribuicao) {
                throw new SemPermissaoError("Você não tem permissões suficientes para atualizar este item.");
            }

            const antes = await verificacaoRepository.buscarPorId(tx, registroId);
            const atualizada = await verificacaoRepository.atualizar(tx, registroId, dados);

            await auditoriaRepository.registrar(tx, {
                entidade: EntidadeAuditada[registro.tipo],
                entidadeId: registro.id,
                acao: "SALVAR_RASCUNHO",
                usuarioId: ator.id,
                antes,
                depois: atualizada,
            });

            return atualizada;
        });
    },

    // Sem portao (VERIFICACAO: [] no catalogo) — conclui direto, exige
    // colaborador com papel APROVADOR (analogo a RN-20, o Effectiveness
    // Check do ETQ Reliance exigia QA).
    //
    // Depois de concluir, o resultado decide o que acontece a seguir:
    // - EFICAZ: nada mais acontece.
    // - PARCIALMENTE_EFICAZ: a causa raiz estava certa, mas a acao tomada
    //   nao foi suficiente — nasce uma NOVA AcaoCorretiva (rascunho),
    //   apontando para a MESMA investigacaoId da acao original (nunca
    //   edita a antiga, so cria uma continuacao).
    // - NAO_EFICAZ: a causa raiz identificada estava errada — reabre a
    //   Investigacao (que ja estava FECHADA) e a NC correspondente,
    //   ambas com o mesmo motivo automatico citando o codigo da
    //   Verificacao. Uma nova Investigacao teria que ser criada depois,
    //   manualmente, pelo colaborador — isso nao acontece aqui.
    async concluirVerificacao(registroId: string, ator: Ator) {
        return prisma.$transaction(async (tx) => {
            const verificacao = await verificacaoRepository.buscarPorId(tx, registroId);
            if (verificacao === null) throw new NaoEncontradoError("Item não encontrado.");

            const registroConcluido = await cicloVidaService.concluir(tx, registroId, ator, verificacao, (d) =>
                verificacaoConclusaoSchema.parse(d),
            );

            const acaoCorretiva = await acaoCorretivaRepository.buscarPorId(tx, verificacao.acaoCorretivaId);
            if (acaoCorretiva === null) {
                throw new NaoEncontradoError("Ação Corretiva relacionada não foi encontrada.");
            }

            const registroAcaoCorretiva = await registroRepository.buscarPorId(tx, verificacao.acaoCorretivaId);
            if (registroAcaoCorretiva === null) {
                throw new NaoEncontradoError("Ação Corretiva relacionada não foi encontrada.");
            }

            if (verificacao.resultado === "PARCIALMENTE_EFICAZ") {
                const novoRegistro = await cicloVidaService.criarRascunho(tx, {
                    tipo: "ACAO_CORRETIVA",
                    criadoPorId: registroAcaoCorretiva.criadoPorId,
                });
                await acaoCorretivaRepository.criar(tx, {
                    id: novoRegistro.id,
                    naoConformidadeId: acaoCorretiva.naoConformidadeId,
                    investigacaoId: acaoCorretiva.investigacaoId ?? undefined,
                });
                await atribuicaoRepository.inserirAtribuicao(
                    tx,
                    novoRegistro.id,
                    registroAcaoCorretiva.criadoPorId,
                    ator.id,
                    "COLABORADOR",
                );
            }

            if (verificacao.resultado === "NAO_EFICAZ") {
                const motivoAutomatico = `Verificação ${registroConcluido.codigo} foi concluída com resultado Não Eficaz.`;

                if (acaoCorretiva.investigacaoId === null) {
                    throw new TransicaoInvalidaError(
                        "Esta Ação Corretiva não está vinculada a uma Investigação — não é possível reabrir automaticamente.",
                    );
                }

                await cicloVidaService.reabrir(tx, acaoCorretiva.investigacaoId, ator, motivoAutomatico);
                await cicloVidaService.reabrir(tx, acaoCorretiva.naoConformidadeId, ator, motivoAutomatico);
            }

            return { ...registroConcluido, ...verificacao };
        });
    },

    async excluirRascunhoVerificacao(registroId: string, ator: Ator) {
        return prisma.$transaction(async (tx) => {
            return cicloVidaService.excluirRascunho(tx, registroId, ator);
        });
    },

    async cancelarVerificacao(registroId: string, ator: Ator, motivo: string) {
        return prisma.$transaction(async (tx) => {
            const registroCancelado = await cicloVidaService.cancelar(tx, registroId, ator, motivo);
            const verificacao = await verificacaoRepository.buscarPorId(tx, registroId);
            return { ...registroCancelado, ...verificacao };
        });
    },

    async buscarPorIdVerificacao(registroId: string, ator: Ator) {
        const registro = await registroRepository.buscarPorId(prisma, registroId);
        if (registro === null) throw new NaoEncontradoError("Item não encontrado.");

        const papel = temPapel(ator, "VISUALIZAR");
        if (!papel) throw new SemPermissaoError("Você não tem permissões suficientes para visualizar.");

        const verificacao = await verificacaoRepository.buscarPorId(prisma, registroId);
        return { ...registro, ...verificacao };
    },

    async listarVerificacoes(ator: Ator, filtros: { acaoCorretivaId?: string; estado?: EstadoRegistro }) {
        const papel = temPapel(ator, "VISUALIZAR");
        if (!papel) throw new SemPermissaoError("Você não tem permissões suficientes para visualizar.");

        const registros = await verificacaoRepository.listar(prisma, filtros);
        return registros.map((item) => {
            const { registro, ...resto } = item;
            return { ...registro, ...resto };
        });
    },
};
