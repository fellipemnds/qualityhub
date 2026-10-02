import type { EstadoRegistro } from "../../../compartilhado/entidades/estados.js";
import type { ItemChecklist } from "../../../compartilhado/registro/checklist.js";

// O requisito da RN-24 que depende das ações: os campos do A3 e as hipóteses continuam no schema de fechamento
export const RequisitoSubmissaoInvestigacao = {
    PLANOS_APROVADOS: "PLANOS_APROVADOS",
} as const;

export type RequisitoSubmissaoInvestigacao =
    (typeof RequisitoSubmissaoInvestigacao)[keyof typeof RequisitoSubmissaoInvestigacao];

export type ItemSubmissaoInvestigacao = ItemChecklist<RequisitoSubmissaoInvestigacao>;

// Uma ação ligada à investigação como a guarda a vê; "plano aprovado" vem das decisões registradas (esquema §4.2)
export type AcaoNaGuarda = { id: string; codigo: string | null; estado: EstadoRegistro; planoAprovado: boolean };

// Tudo já carregado do banco: a função não consulta nada
export type DadosSubmissaoInvestigacao = {
    acoes: AcaoNaGuarda[];
};

// Guarda de submissão da investigação (RN-24, esquema §4.3): toda ação não cancelada ligada a ela precisa estar com o
// plano aprovado. Sem nenhuma ação, também pode ser submetida (PRD Q17). Função pura, como a avaliarFechamentoNC
export function avaliarSubmissaoInvestigacao(dados: DadosSubmissaoInvestigacao): ItemSubmissaoInvestigacao[] {
    const acoesPendentes = dados.acoes
        .filter((acao) => acao.estado !== "CANCELADO" && !acao.planoAprovado)
        .map((acao) => ({ id: acao.id, codigo: acao.codigo }));
    const planosAprovados = acoesPendentes.length === 0;

    return [
        {
            requisito: RequisitoSubmissaoInvestigacao.PLANOS_APROVADOS,
            atendido: planosAprovados,
            mensagem: planosAprovados
                ? "Planos das ações corretivas aprovados"
                : "Falta aprovar o plano das ações corretivas",
            pendentes: acoesPendentes,
        },
    ];
}
