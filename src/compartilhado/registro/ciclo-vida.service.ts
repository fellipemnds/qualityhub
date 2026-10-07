import { aprovacaoRepository } from "../aprovacao/aprovacao.repository.js";
import { atribuicaoRepository } from "../atribuicao/atribuicao.repository.js";
import type { AcaoAuditada } from "../auditoria/acoes-auditadas.js";
import { auditoriaRepository } from "../auditoria/auditoria.repository.js";
import { EntidadeAuditada } from "../auditoria/entidades-auditadas.js";
import { cancelamentoRepository } from "../cancelamento/cancelamento.repository.js";
import { hojeEmSaoPaulo } from "../datas/hoje-em-sao-paulo.js";
import type { Acao } from "../entidades/acoes.js";
import type { Ator } from "../entidades/ator.js";
import type { Decisao } from "../entidades/decisao.js";
import type { EstadoRegistro } from "../entidades/estados.js";
import type { TipoRegistro } from "../entidades/tipos-registro.js";
import { SemPermissaoError, TransicaoInvalidaError, ValidacaoError } from "../errors/errors.js";
import { podeExecutar, temPapel } from "../permissoes/pode-executar.js";
import type { ClientePrisma } from "../prisma/tipos.js";
import { reaberturaRepository } from "../reabertura/reabertura.repository.js";
import { sequenciaService } from "../sequencia/sequencia.service.js";
import { buscarRegistroDoTipoOuFalhar } from "./buscar-registro-do-tipo.js";
import { estadoAposDecisao } from "./estado-apos-decisao.js";
import { portoesPorTipo } from "./portoes.js";
import { prefixoPorTipo } from "./prefixos.js";
import { registroRepository } from "./registro.repository.js";

type Registro = NonNullable<Awaited<ReturnType<typeof registroRepository.buscarPorId>>>;

// O fim de toda transição: grava a mudança no Registro e a auditoria com o antes e o depois, na mesma transação. Num
// lugar só, para a trava do B19 (o UPDATE condicionado ao estado esperado) entrar uma vez, valendo para todas
async function aplicarTransicao(
    tx: ClientePrisma,
    registro: Registro,
    mudanca: { estado: EstadoRegistro; codigo?: string; portaoAtual?: number },
    acao: AcaoAuditada,
    ator: Ator,
) {
    const registroAtualizado = await registroRepository.atualizar(tx, registro.id, registro.estado, mudanca);

    await auditoriaRepository.registrar(tx, {
        entidade: EntidadeAuditada[registroAtualizado.tipo],
        entidadeId: registroAtualizado.id,
        acao,
        usuarioId: ator.id,
        antes: registro,
        depois: registroAtualizado,
    });

    return registroAtualizado;
}

export const cicloVidaService = {
    async criarRascunho(tx: ClientePrisma, dados: { tipo: TipoRegistro; criadoPorId: string }) {
        const registro = await registroRepository.criar(tx, dados);

        await auditoriaRepository.registrar(tx, {
            entidade: EntidadeAuditada[registro.tipo],
            entidadeId: registro.id,
            acao: "CRIAR_RASCUNHO",
            usuarioId: registro.criadoPorId,
            antes: undefined,
            depois: registro,
        });

        return registro;
    },

    async publicar(
        tx: ClientePrisma,
        registroId: string,
        tipo: TipoRegistro,
        ator: Ator,
        validador: () => void,
        acao: Acao = "PUBLICAR",
    ) {
        const registro = await buscarRegistroDoTipoOuFalhar(tx, registroId, tipo);

        if (registro.estado !== "RASCUNHO") {
            throw new TransicaoInvalidaError("Apenas itens em rascunho podem ser publicados!");
        }

        const podeEditar = await podeExecutar(tx, ator, acao, registroId);

        if (!podeEditar) {
            throw new SemPermissaoError("Você não pode realizar esta ação pois você não está atribuido neste item.");
        }

        validador();

        const prefixo = prefixoPorTipo[registro.tipo];
        const anoAtual = Number(hojeEmSaoPaulo().slice(0, 4));

        const codigo = await sequenciaService.proximoCodigo(tx, prefixo, anoAtual);

        return aplicarTransicao(tx, registro, { estado: "ABERTO", codigo }, "PUBLICAR", ator);
    },

    async excluirRascunho(
        tx: ClientePrisma,
        registroId: string,
        tipo: TipoRegistro,
        ator: Ator,
        acao: Acao = "GERENCIAR_RASCUNHO",
    ) {
        const registro = await buscarRegistroDoTipoOuFalhar(tx, registroId, tipo);

        if (registro.estado !== "RASCUNHO") {
            throw new TransicaoInvalidaError("Apenas itens em rascunho podem ser deletados!");
        }

        const podeDeletar = await podeExecutar(tx, ator, acao, registroId);

        if (!podeDeletar) {
            throw new SemPermissaoError("Você não pode realizar esta ação pois você não está atribuido neste item.");
        }

        await registroRepository.excluir(tx, registroId, registro.estado);

        await auditoriaRepository.registrar(tx, {
            entidade: EntidadeAuditada[registro.tipo],
            entidadeId: registro.id,
            acao: "EXCLUIR_RASCUNHO",
            usuarioId: ator.id,
            antes: registro,
            depois: undefined,
        });

        return registro;
    },

    async submeter(
        tx: ClientePrisma,
        registroId: string,
        tipo: TipoRegistro,
        ator: Ator,
        validador: () => void,
        acao: Acao = "SUBMETER",
    ) {
        const registro = await buscarRegistroDoTipoOuFalhar(tx, registroId, tipo);

        if (registro.estado !== "ABERTO" || portoesPorTipo[registro.tipo].length <= 0) {
            throw new TransicaoInvalidaError();
        }

        const podeSubmeter = await podeExecutar(tx, ator, acao, registroId);

        if (!podeSubmeter) {
            throw new SemPermissaoError(
                "Você não pode realizar esta ação pois você não está atribuido neste item ou não possui as permissões necessárias.",
            );
        }

        const temAprovador = await atribuicaoRepository.existeAprovador(tx, registroId);

        if (!temAprovador) {
            throw new TransicaoInvalidaError("Este item deve possuir um aprovador delegado antes de ser submetido.");
        }

        validador();

        return aplicarTransicao(tx, registro, { estado: "EM_APROVACAO" }, "SUBMETER", ator);
    },

    // Retirar da aprovação (RN-48): o colaborador desiste do envio. Volta a ABERTO no mesmo portão, sem registro em
    // Aprovacao (não é reprovação), e fica na auditoria. Quem pode submeter pode retirar: a ação é a mesma do submeter
    async retirar(tx: ClientePrisma, registroId: string, tipo: TipoRegistro, ator: Ator, acao: Acao = "SUBMETER") {
        const registro = await buscarRegistroDoTipoOuFalhar(tx, registroId, tipo);

        if (registro.estado !== "EM_APROVACAO") {
            throw new TransicaoInvalidaError("Só um item em aprovação pode ser retirado da aprovação.");
        }

        const podeRetirar = await podeExecutar(tx, ator, acao, registroId);

        if (!podeRetirar) {
            throw new SemPermissaoError(
                "Você não pode realizar esta ação pois você não está atribuido neste item ou não possui as permissões necessárias.",
            );
        }

        return aplicarTransicao(tx, registro, { estado: "ABERTO" }, "RETIRAR_DA_APROVACAO", ator);
    },

    async decidir(
        tx: ClientePrisma,
        registroId: string,
        tipo: TipoRegistro,
        ator: Ator,
        dados: { decisao: Decisao; motivo?: string },
        opcoes: { fecharAoAprovar: boolean } = { fecharAoAprovar: true },
    ) {
        const registro = await buscarRegistroDoTipoOuFalhar(tx, registroId, tipo);

        if (registro.estado !== "EM_APROVACAO") {
            throw new TransicaoInvalidaError("O item não está em aprovação!");
        }

        const papel = temPapel(ator, "APROVAR");
        const atribuicao = await atribuicaoRepository.ehAprovador(tx, registroId, ator.id);

        if (!papel || !atribuicao) {
            throw new SemPermissaoError(
                "Você não pode realizar esta ação pois você não está atribuido neste item ou não possui as permissões necessárias.",
            );
        }

        if (dados.decisao === "REPROVADO" && (!dados.motivo || dados.motivo.trim() === "")) {
            throw new ValidacaoError("O motivo é obrigatório em caso de reprovação!");
        }

        const portaoDecidido = portoesPorTipo[registro.tipo][registro.portaoAtual];

        if (portaoDecidido === undefined) {
            throw new TransicaoInvalidaError("Estado de portao inconsistente.");
        }

        const autoAprovacao = ator.id === registro.criadoPorId;

        const aprovacao = await aprovacaoRepository.criar(tx, {
            registroId,
            portao: portaoDecidido,
            decisao: dados.decisao,
            motivo: dados.motivo,
            aprovadorId: ator.id,
            autoAprovacao,
        });

        const estado = estadoAposDecisao(aprovacao.decisao, opcoes);

        return aplicarTransicao(tx, registro, { estado }, aprovacao.decisao, ator);
    },

    async concluir(tx: ClientePrisma, registroId: string, tipo: TipoRegistro, ator: Ator, validador: () => void) {
        const registro = await buscarRegistroDoTipoOuFalhar(tx, registroId, tipo);

        if (registro.estado !== "ABERTO" || portoesPorTipo[registro.tipo].length !== 0) {
            throw new TransicaoInvalidaError(
                'O item não pode ser concluído pois não está no status "ABERTO" ou não está no portão correto!',
            );
        }

        const papel = temPapel(ator, "CONCLUIR_VERIFICACAO");

        const atribuicao = await atribuicaoRepository.ehColaborador(tx, registroId, ator.id);

        if (!papel || !atribuicao) {
            throw new SemPermissaoError(
                "Você não pode realizar esta ação pois você não está atribuido neste item ou não possui as permissões necessárias.",
            );
        }

        validador();

        return aplicarTransicao(tx, registro, { estado: "FECHADO" }, "CONCLUIR_VERIFICACAO", ator);
    },

    async reabrir(tx: ClientePrisma, registroId: string, tipo: TipoRegistro, ator: Ator, motivo: string) {
        const registro = await buscarRegistroDoTipoOuFalhar(tx, registroId, tipo);

        // O motivo em branco já é recusado no schema (400, B18): aqui, só o estado
        if (registro.estado !== "FECHADO") {
            throw new TransicaoInvalidaError("Só um item fechado pode ser reaberto.");
        }

        const papel = temPapel(ator, "REABRIR");

        if (!papel) {
            throw new SemPermissaoError(
                "Você não pode realizar esta ação pois você não possui as permissões necessárias.",
            );
        }

        await reaberturaRepository.criar(tx, { registroId, reabertoPorId: ator.id, motivo });

        return aplicarTransicao(tx, registro, { estado: "ABERTO", portaoAtual: 0 }, "REABRIR", ator);
    },

    // O validador roda depois das checagens de estado e permissão, como no submeter: a guarda própria do tipo (ex.:
    // RN-50 na investigação) não responde a quem não pode cancelar
    async cancelar(
        tx: ClientePrisma,
        registroId: string,
        tipo: TipoRegistro,
        ator: Ator,
        motivo: string,
        validador: () => void = () => {},
    ) {
        const registro = await buscarRegistroDoTipoOuFalhar(tx, registroId, tipo);

        // Rascunho só se exclui, não se cancela: cancelado, ele ficaria para sempre, sem código (B12, RN-06)
        if (registro.estado === "RASCUNHO") {
            throw new TransicaoInvalidaError("Rascunho não se cancela: se ele não serve mais, exclua-o.");
        }

        // O motivo em branco já é recusado no schema (400, B18): aqui, só o estado
        if (registro.estado === "FECHADO" || registro.estado === "CANCELADO") {
            throw new TransicaoInvalidaError("Um item fechado ou cancelado não pode ser cancelado.");
        }

        const gerente = ator.papeis.includes("GERENTE");

        const atribuicao = await atribuicaoRepository.ehAprovador(tx, registroId, ator.id);

        if (!gerente && !atribuicao) {
            throw new SemPermissaoError(
                "Você não pode realizar esta ação pois você não possui as permissões necessárias.",
            );
        }

        validador();

        await cancelamentoRepository.criar(tx, { registroId, canceladoPorId: ator.id, motivo });

        return aplicarTransicao(tx, registro, { estado: "CANCELADO" }, "CANCELAR", ator);
    },
};
