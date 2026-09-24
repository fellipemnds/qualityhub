import z from "zod";
import { ClassificacaoHipotese } from "../../../compartilhado/entidades/classificacao-hipotese.js";

export const hipoteseBaseSchema = z.object({
    descricao: z.string().min(1).nullish(),
    numeroIshikawa: z.number().int().positive().nullish(),
    classificacao: z.enum(ClassificacaoHipotese).nullish(),
});

export const hipoteseRascunhoSchema = hipoteseBaseSchema.partial();
export const hipoteseFechamentoSchema = hipoteseBaseSchema.extend({
    descricao: z.string().min(1),
    classificacao: z.enum(ClassificacaoHipotese),
});

export type HipoteseBaseInput = z.infer<typeof hipoteseBaseSchema>;
export type HipoteseRascunhoInput = z.infer<typeof hipoteseRascunhoSchema>;
export type HipoteseFechamentoInput = z.infer<typeof hipoteseFechamentoSchema>;
