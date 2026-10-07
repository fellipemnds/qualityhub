import { z } from "zod";
import { Papel } from "../../compartilhado/entidades/papeis.js";
import { TEXTO_CURTO } from "../../compartilhado/validacao/tetos.js";

export const criarUsuarioSchema = z.object({
    nome: z.string().min(1).max(TEXTO_CURTO),
    email: z.email(),
    papeis: z.array(z.enum(Papel)).min(1).max(Object.keys(Papel).length),
    setorId: z.number().int().positive(),
});

export const buscarUsuarioIdSchema = z.object({
    id: z.uuid(),
});

// O que sai ao criar: o id e o convite, nada do usuário gravado. O token do convite é uma credencial (quem o tiver
// define a senha): sai só aqui, uma vez, para o ADMIN mandar o link; no banco fica só o hash dele
export const usuarioCriadoRespostaSchema = z.object({
    id: z.uuid(),
    tokenConvite: z.string(),
});

export type CriarUsuarioInput = z.infer<typeof criarUsuarioSchema>;
