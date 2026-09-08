export const AcoesAuditoria = {
    NC_CRIADA: "NC_CRIADA",
    NC_CLASSIFICADA: "NC_CLASSIFICADA",
    CONTENCAO_CRIADA: "CONTENCAO_CRIADA",
    EM_CONTENCAO: "EM_CONTENCAO"
} as const;

export type AcaoAuditoria = typeof AcoesAuditoria[keyof typeof AcoesAuditoria];