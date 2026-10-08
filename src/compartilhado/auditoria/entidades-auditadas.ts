import { TipoRegistro } from "../entidades/tipos-registro.js";

export const EntidadeAuditada = {
    ...TipoRegistro,
    USUARIO: "USUARIO",
    SETOR: "SETOR",
    TOKEN_ACESSO: "TOKEN_ACESSO",
} as const;

export type EntidadeAuditada = (typeof EntidadeAuditada)[keyof typeof EntidadeAuditada];
