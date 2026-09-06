export const AcoesAuditoria = {
    NC_CRIADA: "NC_CRIADA",
    NC_CLASSIFICADA: "NC_CLASSIFICADA",
} as const;

export type AcaoAuditoria = typeof AcoesAuditoria[keyof typeof AcoesAuditoria];