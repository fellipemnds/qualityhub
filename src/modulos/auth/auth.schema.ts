import { z } from "zod";
import { TelaInicial } from "../../compartilhado/entidades/tela-inicial.js";

// Schema usado para definir a senha
export const definirSenhaSchema = z.object({
    token: z.string().min(32),
    senha: z.string().min(12),
});

// Schema usado para definir os inputs do Login
export const loginSchema = z.object({
    email: z.email(),
    senha: z.string().min(1),
    manterConectado: z.boolean().default(false),
});

// null volta para o padrão do papel
export const alterarEuSchema = z.object({
    telaInicial: z.enum(TelaInicial).nullable(),
});

export type DefinirSenhaInput = z.infer<typeof definirSenhaSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type AlterarEuInput = z.infer<typeof alterarEuSchema>;
