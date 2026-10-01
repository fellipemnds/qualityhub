import type { EstadoRegistro } from "../../../compartilhado/entidades/estados.js";
import type { ItemChecklist } from "../../../compartilhado/registro/checklist.js";

export const RequisitoCancelamentoInvestigacao = {
    ACOES_RESOLVIDAS: "ACOES_RESOLVIDAS",
} as const;

export type RequisitoCancelamentoInvestigacao =
    (typeof RequisitoCancelamentoInvestigacao)[keyof typeof RequisitoCancelamentoInvestigacao];

export type ItemCancelamentoInvestigacao = ItemChecklist<RequisitoCancelamentoInvestigacao>;

export type DadosCancelamentoInvestigacao = {
    acoes: { id: string; codigo: string | null; estado: EstadoRegistro }[];
};

// Guarda do cancelamento da investigação (RN-50, PRD Q18): toda ação ligada precisa estar cancelada ou fechada. Sem
// isso, a ação ficaria solta, porque a NC ignora investigação cancelada. Função pura, como as outras guardas
export function avaliarCancelamentoInvestigacao(dados: DadosCancelamentoInvestigacao): ItemCancelamentoInvestigacao[] {
    const acoesPendentes = dados.acoes
        .filter((acao) => acao.estado !== "CANCELADO" && acao.estado !== "FECHADO")
        .map((acao) => ({ id: acao.id, codigo: acao.codigo }));
    const acoesResolvidas = acoesPendentes.length === 0;

    return [
        {
            requisito: RequisitoCancelamentoInvestigacao.ACOES_RESOLVIDAS,
            atendido: acoesResolvidas,
            mensagem: acoesResolvidas
                ? "Nenhuma ação corretiva pendente"
                : "Falta cancelar ou concluir as ações corretivas ligadas",
            pendentes: acoesPendentes,
        },
    ];
}
