import { aprovacaoRepository } from "../../../compartilhado/aprovacao/aprovacao.repository.js";
import { atribuicaoRepository } from "../../../compartilhado/atribuicao/atribuicao.repository.js";
import { herdarAprovadorDaNC } from "../../../compartilhado/atribuicao/herdar-aprovador.js";
import { auditoriaRepository } from "../../../compartilhado/auditoria/auditoria.repository.js";
import { EntidadeAuditada } from "../../../compartilhado/auditoria/entidades-auditadas.js";
import { meiaNoiteUtc } from "../../../compartilhado/datas/dia-de-calendario.js";
import { hojeEmSaoPaulo } from "../../../compartilhado/datas/hoje-em-sao-paulo.js";
import type { Ator } from "../../../compartilhado/entidades/ator.js";
import {
    NaoEncontradoError,
    SemPermissaoError,
    TransicaoInvalidaError,
    ValidacaoError,
} from "../../../compartilhado/errors/errors.js";
import { temPapel } from "../../../compartilhado/permissoes/pode-executar.js";
import { prisma } from "../../../compartilhado/prisma/cliente.js";
import type { ClientePrisma } from "../../../compartilhado/prisma/tipos.js";
import { buscarRegistroDoTipoOuFalhar } from "../../../compartilhado/registro/buscar-registro-do-tipo.js";
import { cicloVidaService } from "../../../compartilhado/registro/ciclo-vida.service.js";
import type { DecisaoInput } from "../../../compartilhado/registro/decidir.schema.js";
import { ESTADOS_EDITAVEIS } from "../../../compartilhado/registro/estados-editaveis.js";
import { LIMITE_PADRAO_PAGINACAO, paginar } from "../../../compartilhado/registro/paginacao-cursor.js";
import { prefixoPorTipo } from "../../../compartilhado/registro/prefixos.js";
import { registroRepository } from "../../../compartilhado/registro/registro.repository.js";
import { sequenciaService } from "../../../compartilhado/sequencia/sequencia.service.js";
import { investigacaoRepository } from "../investigacao/investigacao.repository.js";
import { ncRepository } from "../nc/nc.repository.js";
import { verificacaoRepository } from "../verificacao/verificacao.repository.js";
import { acaoCorretivaRepository } from "./acao-corretiva.repository.js";
import type { AcaoCorretivaFiltrosListagemInput } from "./acao-corretiva.schema.js";
import {
    type AcaoCorretivaCriacaoInput,
    type AcaoCorretivaRascunhoInput,
    acaoCorretivaExecucaoSchema,
    acaoCorretivaPlanoSchema,
    acaoCorretivaPublicacaoSchema,
    CAMPOS_DO_PLANO,
} from "./acao-corretiva.schema.js";

// A investigação apontada pela ação é a que a Verificação NAO_EFICAZ reabre: tem de existir e ser da mesma NC
// (B10). E é ela que confere o plano antes do envio (RN-24): só recebe ação enquanto está aberta — nem em rascunho,
// que ainda não existe formalmente, nem depois do envio (RN-49)
async function conferirInvestigacao(tx: ClientePrisma, naoConformidadeId: string, investigacaoId: string) {
    const investigacao = await investigacaoRepository.buscarPorId(tx, investigacaoId);
    if (investigacao === null || investigacao.naoConformidadeId !== naoConformidadeId) {
        throw new ValidacaoError("A investigação não existe ou não é desta Não Conformidade.");
    }

    // Trava a investigação antes de conferir o estado: o envio e o cancelamento dela também a travam antes de ler as
    // ações, e quem chega depois espera (B30, B31)
    if ((await registroRepository.travar(tx, investigacaoId)) !== "ABERTO") {
        throw new ValidacaoError("A investigação precisa estar aberta para receber ações corretivas.");
    }
}

// A Verificação que nasce da execução finalizada, na mesma transação. Nasce já ABERTA, com código (nunca passa por
// rascunho: o sistema garante as instruções e o prazo), com as instruções do plano, prazo = hoje +
// diasParaVerificar, e o aprovador da ação como colaborador e aprovador dela
async function gerarVerificacao(
    tx: ClientePrisma,
    acaoCorretiva: { id: string; instrucoesVerificacao: string | null },
    aprovadorId: string,
    ator: Ator,
    diasParaVerificar: number,
) {
    // Um "hoje" só, para o prazo e o ano do código nunca discordarem. O prazo é um dia de calendário: meia-noite UTC
    // do dia (TRD §6, B11)
    const hoje = hojeEmSaoPaulo();
    const prazo = meiaNoiteUtc(hoje);
    prazo.setUTCDate(prazo.getUTCDate() + diasParaVerificar);

    const rascunho = await cicloVidaService.criarRascunho(tx, { tipo: "VERIFICACAO", criadoPorId: ator.id });
    const codigo = await sequenciaService.proximoCodigo(tx, prefixoPorTipo.VERIFICACAO, Number(hoje.slice(0, 4)));
    const registro = await registroRepository.atualizar(tx, rascunho.id, "RASCUNHO", { estado: "ABERTO", codigo });

    const verificacao = await verificacaoRepository.criar(tx, {
        id: rascunho.id,
        acaoCorretivaId: acaoCorretiva.id,
        instrucoesVerificacao: acaoCorretiva.instrucoesVerificacao,
        prazo,
    });
    await atribuicaoRepository.inserirAtribuicao(tx, rascunho.id, aprovadorId, ator.id, "COLABORADOR");
    await atribuicaoRepository.inserirAtribuicao(tx, rascunho.id, aprovadorId, ator.id, "APROVADOR");

    const verificacaoGerada = { ...registro, ...verificacao };

    await auditoriaRepository.registrar(tx, {
        entidade: EntidadeAuditada.VERIFICACAO,
        entidadeId: rascunho.id,
        acao: "GERAR_VERIFICACAO",
        usuarioId: ator.id,
        antes: undefined,
        depois: verificacaoGerada,
    });

    return verificacaoGerada;
}

export const acaoCorretivaService = {
    async criarRascunhoAcaoCorretiva(ator: Ator, naoConformidadeId: string, dados: AcaoCorretivaCriacaoInput) {
        return prisma.$transaction(async (tx) => {
            const papel = temPapel(ator, "GERENCIAR_RASCUNHO");
            if (!papel) throw new SemPermissaoError("Você não tem permissões suficientes para criar um novo rascunho.");

            const nc = await ncRepository.buscarPorId(tx, naoConformidadeId);
            if (nc === null) throw new NaoEncontradoError("A Não Conformidade não existe ou não foi encontrada");

            await conferirInvestigacao(tx, naoConformidadeId, dados.investigacaoId);

            const registro = await cicloVidaService.criarRascunho(tx, { tipo: "ACAO_CORRETIVA", criadoPorId: ator.id });
            const acaoCorretiva = await acaoCorretivaRepository.criar(tx, {
                id: registro.id,
                naoConformidadeId,
                ...dados,
            });

            await atribuicaoRepository.inserirAtribuicao(tx, registro.id, ator.id, ator.id, "COLABORADOR");
            await herdarAprovadorDaNC(tx, naoConformidadeId, registro.id, ator.id);

            // Recém-criada, a ação não tem decisão nenhuma: o plano não foi aprovado
            return { ...registro, ...acaoCorretiva, planoAprovado: false };
        });
    },

    async atualizarAcaoCorretiva(registroId: string, ator: Ator, dados: AcaoCorretivaRascunhoInput) {
        return prisma.$transaction(async (tx) => {
            const registro = await buscarRegistroDoTipoOuFalhar(tx, registroId, "ACAO_CORRETIVA");
            if (!ESTADOS_EDITAVEIS.includes(registro.estado)) {
                throw new TransicaoInvalidaError("Este item não pode mais ser editado neste estado.");
            }

            const papel = temPapel(ator, "GERENCIAR_RASCUNHO");
            const atribuicao = await atribuicaoRepository.ehColaborador(tx, registroId, ator.id);
            if (!papel || !atribuicao)
                throw new SemPermissaoError("Você não tem permissões suficientes para atualizar este item.");

            // Com o plano aprovado, só a execução muda: o que o QA aprovou fica como foi aprovado (B2). Recusa se o campo
            // vier, mesmo com o mesmo valor
            const camposDoPlano = CAMPOS_DO_PLANO.filter((campo) => dados[campo] !== undefined);
            if (camposDoPlano.length > 0 && (await acaoCorretivaRepository.planoAprovado(tx, registroId))) {
                throw new TransicaoInvalidaError(
                    `O plano já foi aprovado e não pode mais ser alterado: ${camposDoPlano.join(", ")}.`,
                );
            }

            const antes = await acaoCorretivaRepository.buscarPorId(tx, registroId);
            if (antes === null) throw new NaoEncontradoError("Item não encontrado.");

            // Só confere quando o vínculo muda: a ação do PARCIALMENTE_EFICAZ aponta para uma investigação já fechada, e
            // mandar o mesmo vínculo ao editar o plano não é ligar de novo (RN-49)
            if (dados.investigacaoId !== undefined && dados.investigacaoId !== antes.investigacaoId) {
                await conferirInvestigacao(tx, antes.naoConformidadeId, dados.investigacaoId);
            }

            const atualizada = await acaoCorretivaRepository.atualizar(tx, registroId, dados);

            // A edição também é gravação no Registro: o atualizadoEm muda (B24), e a trava do B19 recusa editar um item
            // que mudou de estado no meio
            const registroTocado = await registroRepository.atualizar(tx, registroId, registro.estado, {});

            await auditoriaRepository.registrar(tx, {
                entidade: EntidadeAuditada[registro.tipo],
                entidadeId: registro.id,
                acao: "EDITAR",
                usuarioId: ator.id,
                antes,
                depois: atualizada,
            });

            const planoAprovado = await acaoCorretivaRepository.planoAprovado(tx, registroId);
            return { ...registroTocado, ...atualizada, planoAprovado };
        });
    },

    async excluirRascunhoAcaoCorretiva(registroId: string, ator: Ator) {
        return prisma.$transaction(async (tx) => {
            return cicloVidaService.excluirRascunho(tx, registroId, "ACAO_CORRETIVA", ator);
        });
    },

    async publicarAcaoCorretiva(registroId: string, ator: Ator) {
        return prisma.$transaction(async (tx) => {
            const acaoCorretiva = await acaoCorretivaRepository.buscarPorId(tx, registroId);
            if (acaoCorretiva === null) throw new NaoEncontradoError("Item não encontrado.");

            const registroPublicado = await cicloVidaService.publicar(tx, registroId, "ACAO_CORRETIVA", ator, () =>
                acaoCorretivaPublicacaoSchema.parse(acaoCorretiva),
            );
            const planoAprovado = await acaoCorretivaRepository.planoAprovado(tx, registroId);
            return { ...registroPublicado, ...acaoCorretiva, planoAprovado };
        });
    },

    // O único envio da ação é o do plano (portão PLANO). A execução não passa por aprovação: o
    // finalizarExecucaoAcaoCorretiva fecha a ação direto
    async submeterAcaoCorretiva(registroId: string, ator: Ator) {
        return prisma.$transaction(async (tx) => {
            const acaoCorretiva = await acaoCorretivaRepository.buscarPorId(tx, registroId);
            if (acaoCorretiva === null) throw new NaoEncontradoError("Item não encontrado.");

            // O único portão da ação é o plano: aprovado, não há mais nada a submeter (B2)
            if (await acaoCorretivaRepository.planoAprovado(tx, registroId)) {
                throw new TransicaoInvalidaError("O plano já foi aprovado: não há mais nada a submeter.");
            }

            const registroSubmetido = await cicloVidaService.submeter(tx, registroId, "ACAO_CORRETIVA", ator, () =>
                acaoCorretivaPlanoSchema.parse(acaoCorretiva),
            );
            const planoAprovado = await acaoCorretivaRepository.planoAprovado(tx, registroId);
            return { ...registroSubmetido, ...acaoCorretiva, planoAprovado };
        });
    },

    // O colaborador desiste do envio: volta a ABERTO, sem decisão registrada (RN-48)
    async retirarAcaoCorretiva(registroId: string, ator: Ator) {
        return prisma.$transaction(async (tx) => {
            const registroRetirado = await cicloVidaService.retirar(tx, registroId, "ACAO_CORRETIVA", ator);
            const acaoCorretiva = await acaoCorretivaRepository.buscarPorId(tx, registroId);

            const planoAprovado = await acaoCorretivaRepository.planoAprovado(tx, registroId);
            return { ...registroRetirado, ...acaoCorretiva, planoAprovado };
        });
    },

    // Aprovar o plano não fecha a ação: ela volta a ABERTO, autorizando a execução
    async decidirAcaoCorretiva(registroId: string, ator: Ator, dados: DecisaoInput) {
        return prisma.$transaction(async (tx) => {
            const registroDecidido = await cicloVidaService.decidir(tx, registroId, "ACAO_CORRETIVA", ator, dados, {
                fecharAoAprovar: false,
            });
            const acaoCorretiva = await acaoCorretivaRepository.buscarPorId(tx, registroId);
            const planoAprovado = await acaoCorretivaRepository.planoAprovado(tx, registroId);
            return { ...registroDecidido, ...acaoCorretiva, planoAprovado };
        });
    },

    // Fecha a ação de ABERTO (com o plano aprovado, B1) direto para FECHADO, sem aprovação: feito por um colaborador,
    // com a execução registrada (RN-25). Na mesma transação nasce a Verificação (gerarVerificacao)
    async finalizarExecucaoAcaoCorretiva(registroId: string, ator: Ator, diasParaVerificar: number) {
        return prisma.$transaction(async (tx) => {
            const registro = await buscarRegistroDoTipoOuFalhar(tx, registroId, "ACAO_CORRETIVA");

            // O portaoAtual continua 0 antes e depois da aprovação: quem diz se o plano foi aprovado é o histórico (B1)
            const planoAprovado = await acaoCorretivaRepository.planoAprovado(tx, registroId);

            if (registro.estado !== "ABERTO" || !planoAprovado) {
                throw new TransicaoInvalidaError("O plano precisa estar aprovado antes de finalizar a execução.");
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

            const aprovador = await atribuicaoRepository.buscarAprovador(tx, registroId);
            if (aprovador === null) {
                throw new TransicaoInvalidaError(
                    "Este item não possui um aprovador definido, não é possível gerar a verificação.",
                );
            }

            const registroAtualizado = await registroRepository.atualizar(tx, registroId, "ABERTO", {
                estado: "FECHADO",
            });

            await auditoriaRepository.registrar(tx, {
                entidade: EntidadeAuditada[registro.tipo],
                entidadeId: registro.id,
                acao: "FINALIZAR_EXECUCAO",
                usuarioId: ator.id,
                antes: registro,
                depois: registroAtualizado,
            });

            const verificacaoGerada = await gerarVerificacao(
                tx,
                acaoCorretiva,
                aprovador.usuarioId,
                ator,
                diasParaVerificar,
            );

            // A guarda do começo exige o plano aprovado: chegando aqui, ele está
            return { ...registroAtualizado, ...acaoCorretiva, planoAprovado: true, verificacaoGerada };
        });
    },

    async cancelarAcaoCorretiva(registroId: string, ator: Ator, motivo: string) {
        return prisma.$transaction(async (tx) => {
            const registroCancelado = await cicloVidaService.cancelar(tx, registroId, "ACAO_CORRETIVA", ator, motivo);
            const acaoCorretiva = await acaoCorretivaRepository.buscarPorId(tx, registroId);
            const planoAprovado = await acaoCorretivaRepository.planoAprovado(tx, registroId);
            return { ...registroCancelado, ...acaoCorretiva, planoAprovado };
        });
    },

    async buscarPorIdAcaoCorretiva(registroId: string, ator: Ator) {
        const registro = await buscarRegistroDoTipoOuFalhar(prisma, registroId, "ACAO_CORRETIVA");

        const papel = temPapel(ator, "VISUALIZAR");
        if (!papel) throw new SemPermissaoError("Você não tem permissões suficientes para visualizar.");

        const acaoCorretiva = await acaoCorretivaRepository.buscarPorId(prisma, registroId);
        const planoAprovado = await acaoCorretivaRepository.planoAprovado(prisma, registroId);
        const ultimoMotivoReprovacao = await aprovacaoRepository.ultimoMotivoReprovacao(prisma, registroId);
        return { ...registro, ...acaoCorretiva, planoAprovado, ultimoMotivoReprovacao };
    },

    async listarAcoesCorretivas(ator: Ator, filtros: AcaoCorretivaFiltrosListagemInput) {
        const papel = temPapel(ator, "VISUALIZAR");
        if (!papel) throw new SemPermissaoError("Você não tem permissões suficientes para visualizar.");

        // O limit vai sempre explícito: sem ele, o repositório traz todas
        const limit = filtros.limit ?? LIMITE_PADRAO_PAGINACAO;

        const registros = await acaoCorretivaRepository.listar(prisma, { ...filtros, limit });
        const itens = registros.map((item) => {
            const {
                registro: { aprovacoes, ...registro },
                ...resto
            } = item;
            return { ...registro, ...resto, planoAprovado: aprovacoes.length > 0 };
        });
        return paginar(itens, limit);
    },
};
