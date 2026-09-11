import { TipoRegistro } from "../entidades/tipos-registro.js";

export const EntidadeAuditada = {
    ...TipoRegistro,
    USUARIO: "USUARIO",
    TOKEN_ACESSO: "TOKEN_ACESSO"
} as const;

export type EntidadeAuditada = typeof EntidadeAuditada[keyof typeof EntidadeAuditada];