import z from "zod";
import { diaDeCalendario } from "../../../compartilhado/datas/dia-de-calendario.js";
import { ResultadoVerificacao } from "../../../compartilhado/entidades/resultado-verificacao.js";

// A base é a forma guardada no banco (datas já como Date); o rascunho é a entrada da API, com os dias em "AAAA-MM-DD"
export const verificacaoBaseSchema = z.object({
    instrucoesVerificacao: z.string().nullish(),
    prazo: z.date().nullish(),
    resultado: z.enum(ResultadoVerificacao).nullish(),
    conclusao: z.string().min(1).nullish(),
    verificadoEm: z.date().nullish(),
});

export const verificacaoRascunhoSchema = verificacaoBaseSchema.partial().extend({
    prazo: diaDeCalendario().nullish(),
    verificadoEm: diaDeCalendario().nullish(),
});

export const verificacaoConclusaoSchema = verificacaoBaseSchema.extend({
    resultado: z.enum(ResultadoVerificacao),
    conclusao: z.string().min(1),
    // Validado no banco, onde a data já é Date: z.date() sem coerce, para o null ser recusado (B14)
    verificadoEm: z.date(),
});

export type VerificacaoBaseInput = z.infer<typeof verificacaoBaseSchema>;
export type VerificacaoRascunhoInput = z.infer<typeof verificacaoRascunhoSchema>;
export type VerificacaoConclusaoInput = z.infer<typeof verificacaoConclusaoSchema>;
