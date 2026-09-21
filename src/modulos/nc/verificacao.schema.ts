import z from "zod";

export const verificacaoBaseSchema = z.object({
    prazo: z.coerce.date().nullish(),
    eficaz: z.boolean().nullish(),
    evidencia: z.string().min(1).nullish(),
    verificadoEm: z.coerce.date().nullish()
});

export const verificacaoRascunhoSchema = verificacaoBaseSchema.partial();

export const verificacaoConclusaoSchema = verificacaoBaseSchema.extend({
    eficaz: z.boolean(),
    evidencia: z.string().min(1),
    verificadoEm: z.coerce.date()
});

export type VerificacaoBaseInput = z.infer<typeof verificacaoBaseSchema>;
export type VerificacaoRascunhoInput = z.infer<typeof verificacaoRascunhoSchema>;
export type VerificacaoConclusaoInput = z.infer<typeof verificacaoConclusaoSchema>;