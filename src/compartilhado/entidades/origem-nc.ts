export const OrigemNC = {
    AUDITORIA_INTERNA: "AUDITORIA_INTERNA",
    AUDITORIA_EXTERNA: "AUDITORIA_EXTERNA",
    OPERACAO: "OPERACAO",
    RECLAMACAO_CLIENTE: "RECLAMACAO_CLIENTE"
} as const;

export type OrigemNC = typeof OrigemNC[keyof typeof OrigemNC];