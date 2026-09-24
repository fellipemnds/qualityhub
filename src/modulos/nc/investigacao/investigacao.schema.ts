import z from "zod";
import { MetodoInvestigacao } from "../../../compartilhado/entidades/metodo-investigacao.js";

export const investigacaoBaseSchema = z.object({
    realProblema: z.string().min(20),
    metodo: z.enum(MetodoInvestigacao).nullish(),
    conteudo: z.json().nullish(),
    causaDireta: z.string().min(20).nullish(),
    causaRaiz: z.string().min(20).nullish(),
});

export const investigacaoRascunhoSchema = investigacaoBaseSchema.partial();
export const investigacaoPublicacaoSchema = investigacaoBaseSchema;
export const investigacaoFechamentoSchema = investigacaoBaseSchema.extend({
    metodo: z.enum(MetodoInvestigacao),
    conteudo: z.json(),
    causaDireta: z.string().min(20),
    causaRaiz: z.string().min(20),
});

export type InvestigacaoBaseInput = z.infer<typeof investigacaoBaseSchema>;
export type InvestigacaoRascunhoInput = z.infer<typeof investigacaoRascunhoSchema>;
export type InvestigacaoPublicacaoInput = z.infer<typeof investigacaoPublicacaoSchema>;
export type InvestigacaoFechamentoInput = z.infer<typeof investigacaoFechamentoSchema>;
