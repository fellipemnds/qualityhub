import z from "zod";
import { ResultadoVerificacao } from "../../../compartilhado/entidades/resultado-verificacao.js";

export const verificacaoBaseSchema = z.object({
    instrucoesVerificacao: z.string().nullish(),
    prazo: z.coerce.date().nullish(),
    resultado: z.enum(ResultadoVerificacao).nullish(),
    conclusao: z.string().min(1).nullish(),
    verificadoEm: z.coerce.date().nullish()
});

export const verificacaoRascunhoSchema = verificacaoBaseSchema.partial();

export const verificacaoConclusaoSchema = verificacaoBaseSchema.extend({
    resultado: z.enum(ResultadoVerificacao),
    conclusao: z.string().min(1),
    verificadoEm: z.coerce.date()
});

export type VerificacaoBaseInput = z.infer<typeof verificacaoBaseSchema>;
export type VerificacaoRascunhoInput = z.infer<typeof verificacaoRascunhoSchema>;
export type VerificacaoConclusaoInput = z.infer<typeof verificacaoConclusaoSchema>;