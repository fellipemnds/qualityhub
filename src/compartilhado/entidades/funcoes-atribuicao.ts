export const FuncaoAtribuicao = {
    COLABORADOR: "COLABORADOR",
    APROVADOR: "APROVADOR"
} as const;

export type FuncaoAtribuicao = typeof FuncaoAtribuicao[keyof typeof FuncaoAtribuicao];