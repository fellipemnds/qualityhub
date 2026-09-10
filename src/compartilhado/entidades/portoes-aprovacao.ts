export const PortaoAprovacao = {
    FECHAMENTO: "FECHAMENTO",
    UNICA: "UNICA",
    PLANO: "PLANO",
    EXECUCAO: "EXECUCAO"
} as const;

export type PortaoAprovacao = typeof PortaoAprovacao[keyof typeof PortaoAprovacao];