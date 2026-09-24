export const Decisao = {
    APROVADO: "APROVADO",
    REPROVADO: "REPROVADO",
} as const;

export type Decisao = (typeof Decisao)[keyof typeof Decisao];
