import { z } from "zod";
import { diaDeCalendario } from "../../../compartilhado/datas/dia-de-calendario.js";
import { Disposicao } from "../../../compartilhado/entidades/disposicao.js";

// A base é a forma guardada no banco (datas já como Date); o rascunho é a entrada da API, com os dias em "AAAA-MM-DD"
export const contencaoBaseSchema = z.object({
    descricao: z.string().min(20),
    executadaEm: z.date().nullish(),
    disposicao: z.enum(Disposicao).nullish(),
});
export const contencaoRascunhoSchema = contencaoBaseSchema
    .partial()
    .extend({ executadaEm: diaDeCalendario().nullish() });
export const contencaoPublicacaoSchema = contencaoBaseSchema;
export const contencaoFechamentoSchema = contencaoBaseSchema.extend({
    // Validado no banco, onde a data já é Date: z.date() sem coerce, para o null ser recusado (B14)
    executadaEm: z.date(),
    disposicao: z.enum(Disposicao),
});

export type ContencaoBaseInput = z.infer<typeof contencaoBaseSchema>;
export type ContencaoRascunhoInput = z.infer<typeof contencaoRascunhoSchema>;
export type ContencaoPublicacaoInput = z.infer<typeof contencaoPublicacaoSchema>;
export type ContencaoFechamentoInput = z.infer<typeof contencaoFechamentoSchema>;
