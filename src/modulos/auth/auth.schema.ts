import { z } from "zod";

// Schema usado para definir a senha
export const definirSenhaSchema = z.object({
    token: z.string().min(32),
    senha: z.string().min(12),
});

// Schema usado para definir os inputs do Login
export const loginSchema = z.object({
    email: z.email(),
    senha: z.string().min(1),
});

export type DefinirSenhaInput = z.infer<typeof definirSenhaSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
