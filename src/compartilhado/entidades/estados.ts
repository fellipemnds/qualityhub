export const EstadoRegistro = {
    RASCUNHO: "RASCUNHO",
    ABERTO: "ABERTO",
    EM_APROVACAO: "EM_APROVACAO",
    FECHADO: "FECHADO",
    CANCELADO: "CANCELADO"
} as const;

export type EstadoRegistro = typeof EstadoRegistro[keyof typeof EstadoRegistro];