import { z } from "zod";
import { OrigemNC } from "../../compartilhado/entidades/origem-nc.js"

export const ncBaseSchema = z.object({
    titulo: z.string().min(5).max(200),
    descricao: z.string().min(20),
    requisitoViolado: z.string().min(1),
    processoAfetado: z.string().min(1),
    setorId: z.coerce.number().int().positive(),
    detectadoEm: z.coerce.date().max(new Date(), "Data de detecção não pode ser no futuro"),
    origem: z.enum(OrigemNC),
    cliente: z.string().optional()
})

export const ncRascunhoSchema = ncBaseSchema.partial();
export const ncPublicacaoSchema = ncBaseSchema;
export const ncFechamentoSchema = ncBaseSchema.extend({
    riscosRevisados: z.string().min(1),
    mudancasSGQ: z.string().min(1)
})

export type NCBaseInput = z.infer<typeof ncBaseSchema>;
export type NCRascunhoInput = z.infer<typeof ncRascunhoSchema>;
export type NCPublicacaoInput = z.infer<typeof ncPublicacaoSchema>;
export type NCFechamentoInput = z.infer<typeof ncFechamentoSchema>;