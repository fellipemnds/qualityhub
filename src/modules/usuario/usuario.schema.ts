import { z } from "zod";
import { PerfilUsuario } from "../../generated/prisma/enums.js";

export const criarUsuarioSchema = z.object({
    nome: z.string().min(1),
    email: z.string().email(),
    perfil: z.enum(PerfilUsuario),
    setorId: z.number().int().positive()
});

export const buscarUsuarioIdSchema = z.object({
    id: z.coerce.number().int().positive()
});

export type CriarUsuarioInput = z.infer<typeof criarUsuarioSchema>;