export const ClassificacaoNC = {
    MAIOR: "MAIOR",
    MENOR: "MENOR",
} as const;

export type ClassificacaoNC = (typeof ClassificacaoNC)[keyof typeof ClassificacaoNC];
