export const ResultadoVerificacao = {
    EFICAZ: "EFICAZ",
    PARCIALMENTE_EFICAZ: "PARCIALMENTE_EFICAZ",
    NAO_EFICAZ: "NAO_EFICAZ",
} as const;

export type ResultadoVerificacao = (typeof ResultadoVerificacao)[keyof typeof ResultadoVerificacao];
