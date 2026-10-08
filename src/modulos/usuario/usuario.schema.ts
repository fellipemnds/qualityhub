import { z } from "zod";
import { Papel } from "../../compartilhado/entidades/papeis.js";
import { paginacaoCursorSchema } from "../../compartilhado/registro/paginacao-cursor.js";
import { EMAIL, TEXTO_CURTO } from "../../compartilhado/validacao/tetos.js";

export const criarUsuarioSchema = z
    .object({
        nome: z.string().min(1).max(TEXTO_CURTO),
        email: z.email().max(EMAIL),
        papeis: z.array(z.enum(Papel)).min(1).max(Object.keys(Papel).length),
        setorId: z.number().int().positive(),
    })
    .strict();

export const buscarUsuarioIdSchema = z.object({
    id: z.uuid(),
});

// O que sai ao criar: o id e o convite, nada do usuário gravado. O token do convite é uma credencial (quem o tiver
// define a senha): sai só aqui, uma vez, para o ADMIN mandar o link; no banco fica só o hash dele
export const usuarioCriadoRespostaSchema = z.object({
    id: z.uuid(),
    tokenConvite: z.string(),
});

// A busca procura no nome e no e-mail, sem diferenciar maiúscula, e vazia acha todos (o campo da tela pode ir em branco);
// sem situação, vêm ativos e inativos
export const usuarioFiltrosListagemSchema = z
    .object({
        busca: z.string().trim().max(TEXTO_CURTO).optional(),
        situacao: z.enum(["ATIVO", "INATIVO"]).optional(),
    })
    .extend(paginacaoCursorSchema.shape);

// O que o ADMIN vê de cada usuário, na lista e no detalhe: a lista do que pode sair. Nunca a senha nem as datas da
// sessão, mesmo que a consulta passe a trazê-las
export const usuarioRespostaSchema = z.object({
    id: z.uuid(),
    nome: z.string(),
    email: z.string(),
    setor: z.object({ id: z.number().int(), nome: z.string() }),
    papeis: z.array(z.enum(Papel)),
    criadoEm: z.date(),
    desativadoEm: z.date().nullable(),
});

export type CriarUsuarioInput = z.infer<typeof criarUsuarioSchema>;
export type UsuarioFiltrosListagemInput = z.infer<typeof usuarioFiltrosListagemSchema>;
