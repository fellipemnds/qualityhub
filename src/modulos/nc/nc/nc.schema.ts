import { z } from "zod";
import { OrigemNC } from "../../../compartilhado/entidades/origem-nc.js"
import { EstadoRegistro } from "../../../compartilhado/entidades/estados.js";
import { ClassificacaoNC } from "../../../compartilhado/entidades/classificacao-nc.js";
import { paginacaoCursorSchema } from "../../../compartilhado/registro/paginacao-cursor.js";

export const ncBaseSchema = z.object({
    titulo: z.string().min(5).max(200),
    descricao: z.string().min(20),
    requisitoViolado: z.string().min(1),
    processoAfetado: z.string().min(1),
    setorId: z.coerce.number().int().positive(),
    detectadoEm: z.coerce.date().max(new Date(), "Data de detecção não pode ser no futuro"),
    origem: z.enum(OrigemNC),
    cliente: z.string().nullish(),
    riscosRevisados: z.string().min(1).nullish(),
    mudancasSGQ: z.string().min(1).nullish()
})

export const ncRascunhoSchema = ncBaseSchema.partial();
export const ncPublicacaoSchema = ncBaseSchema;
export const ncFechamentoSchema = ncBaseSchema.extend({
    riscosRevisados: z.string().min(1),
    mudancasSGQ: z.string().min(1)
})

export const ncFiltrosListagemSchema = z.object({
    estado: z.enum(EstadoRegistro).optional(),
    origem: z.enum(OrigemNC).optional(),
    de: z.coerce.date().optional(),
    ate: z.coerce.date().optional(),
    minhas: z.stringbool().optional(),
    classificacao: z.enum(ClassificacaoNC).optional()
}).extend(paginacaoCursorSchema.shape);

export type NCBaseInput = z.infer<typeof ncBaseSchema>;
export type NCRascunhoInput = z.infer<typeof ncRascunhoSchema>;
export type NCPublicacaoInput = z.infer<typeof ncPublicacaoSchema>;
export type NCFechamentoInput = z.infer<typeof ncFechamentoSchema>;
export type NCFiltrosListagemInput = z.infer<typeof ncFiltrosListagemSchema>;
