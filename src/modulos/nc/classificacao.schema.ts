import z from "zod";
import { ClassificacaoNC } from "../../compartilhado/entidades/classificacao-nc.js";

export const classificacaoBaseSchema = z.object({
    valor: z.enum(ClassificacaoNC).nullish(),
    justificativa: z.string().min(20).nullish()
});

export const classificacaoRascunhoSchema = classificacaoBaseSchema.partial();
export const classificacaoPublicacaoSchema = classificacaoBaseSchema;

export type ClassificacaoBaseInput = z.infer<typeof classificacaoBaseSchema>;
export type ClassificacaoRascunhoInput = z.infer<typeof classificacaoRascunhoSchema>;
export type ClassificacaoPublicacaoInput = z.infer<typeof classificacaoPublicacaoSchema>;