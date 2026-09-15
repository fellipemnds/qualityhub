import { z } from "zod";
import { Papel } from "../../compartilhado/entidades/papeis.js";

export const criarUsuarioSchema = z.object({
    nome: z.string().min(1),
    email: z.email(),
    papeis: z.array(z.enum(Papel)).min(1),
    setorId: z.number().int().positive()
});

export const buscarUsuarioIdSchema = z.object({
    id: z.uuid()
});

export type CriarUsuarioInput = z.infer<typeof criarUsuarioSchema>;