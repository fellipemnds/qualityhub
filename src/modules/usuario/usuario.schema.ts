import { z } from "zod";

export const UsuarioSchema = z.object({
    nome: z.string().min(1),
    email: z.string().min(1),
    senhaHash: z.string().min(1),
    perfil: z.enum(["COLABORADOR", "QA", "DIRETORIA"]),
    setorId: z.number().int().positive()
});

export const buscarUsuarioIdSchema = z.object({
    id: z.number().int().positive()
});

export type CriarUsuarioInput = z.infer<typeof UsuarioSchema>;