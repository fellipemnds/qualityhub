import { z } from "zod";
import { TEXTO_CURTO } from "../../compartilhado/validacao/tetos.js";

export const criarSetorSchema = z.object({ nome: z.string().trim().min(1).max(TEXTO_CURTO) }).strict();

// Renomear: o nome é o único campo, e opcional como em todo PATCH (sem ele, nada muda)
export const editarSetorSchema = z.object({ nome: z.string().trim().min(1).max(TEXTO_CURTO).optional() }).strict();

// O id do setor é um número (autoincrement), e não um UUID como o dos outros itens
export const setorIdSchema = z.object({ id: z.coerce.number().int().positive() });

// Quem não é ADMIN só vê os ativos (as opções de escolha); o ADMIN pode pedir os desativados (RN-44)
export const setorFiltrosListagemSchema = z.object({
    situacao: z.enum(["ATIVO", "INATIVO", "TODOS"]).default("ATIVO"),
});

export const setorRespostaSchema = z.object({
    id: z.number().int(),
    nome: z.string(),
    desativadoEm: z.date().nullable(),
});

export type CriarSetorInput = z.infer<typeof criarSetorSchema>;
export type EditarSetorInput = z.infer<typeof editarSetorSchema>;
export type SetorFiltrosListagemInput = z.infer<typeof setorFiltrosListagemSchema>;
