export const TipoTokenAcesso = {
    CONVITE: "CONVITE",
    RECUPERACAO_SENHA: "RECUPERACAO_SENHA"
} as const;

export type TipoTokenAcesso = typeof TipoTokenAcesso[keyof typeof TipoTokenAcesso];