export const Papel = {
    VISUALIZADOR: "VISUALIZADOR",
    EDITOR: "EDITOR",
    APROVADOR: "APROVADOR",
    GERENTE: "GERENTE",
    ADMIN: "ADMIN",
} as const;

export type Papel = (typeof Papel)[keyof typeof Papel];
