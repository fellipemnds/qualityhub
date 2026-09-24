export const TipoRegistro = {
    NAO_CONFORMIDADE: "NAO_CONFORMIDADE",
    CLASSIFICACAO: "CLASSIFICACAO",
    CONTENCAO: "CONTENCAO",
    INVESTIGACAO: "INVESTIGACAO",
    ACAO_CORRETIVA: "ACAO_CORRETIVA",
    VERIFICACAO: "VERIFICACAO",
} as const;

export type TipoRegistro = (typeof TipoRegistro)[keyof typeof TipoRegistro];
