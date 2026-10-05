export const TelaInicial = {
    PENDENCIAS: "PENDENCIAS",
    NCS: "NCS",
    RELATORIOS: "RELATORIOS",
    USUARIOS: "USUARIOS",
} as const;

export type TelaInicial = (typeof TelaInicial)[keyof typeof TelaInicial];
