import { z } from "zod";

// Schema usado para definir a senha
export const definirSenhaSchema = z.object({
    email: z.string().email(),
    senha: z.string().min(12)
});

export type DefinirSenhaInput = z.infer<typeof definirSenhaSchema>;

// Schema usado para definir os inputs do Login
export const loginSchema = z.object({
    email: z.string().email(),
    senha: z.string().min(1)
});

export type LoginInput = z.infer<typeof loginSchema>;