export const ClassificacaoHipotese = {
    CAUSA_DIRETA: "CAUSA_DIRETA",
    FATOR_CONTRIBUINTE: "FATOR_CONTRIBUINTE",
    SEM_RELACAO: "SEM_RELACAO",
} as const;

export type ClassificacaoHipotese = (typeof ClassificacaoHipotese)[keyof typeof ClassificacaoHipotese];
