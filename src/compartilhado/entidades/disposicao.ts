export const Disposicao = {
    ACEITO: "ACEITO",
    CORRIGIDO: "CORRIGIDO",
    ANULADO: "ANULADO",
    EM_ANALISE: "EM_ANALISE",
} as const;

export type Disposicao = (typeof Disposicao)[keyof typeof Disposicao];
