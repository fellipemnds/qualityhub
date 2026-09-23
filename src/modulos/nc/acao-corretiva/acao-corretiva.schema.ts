import z from "zod";

export const acaoCorretivaBaseSchema = z.object({
    investigacaoId: z.uuid().nullish(),
    descricao: z.string().min(20).nullish(),
    prazo: z.coerce.date().nullish(),
    executadoEm: z.coerce.date().nullish(),
    evidencia: z.string().min(1).nullish(),
    instrucoesVerificacao: z.string().min(1).nullish()
});

export const acaoCorretivaRascunhoSchema = acaoCorretivaBaseSchema.partial();
export const acaoCorretivaPublicacaoSchema = acaoCorretivaBaseSchema;

export const acaoCorretivaPlanoSchema = acaoCorretivaBaseSchema.extend({
    descricao: z.string().min(20),
    prazo: z.coerce.date(),
    instrucoesVerificacao: z.string().min(1)
});

export const acaoCorretivaExecucaoSchema = acaoCorretivaPlanoSchema.extend({
    executadoEm: z.coerce.date(),
    evidencia: z.string().min(1)
});

export const finalizarExecucaoSchema = z.object({
    diasParaVerificar: z.number().int().positive()
});

export type AcaoCorretivaBaseInput = z.infer<typeof acaoCorretivaBaseSchema>;
export type AcaoCorretivaRascunhoInput = z.infer<typeof acaoCorretivaRascunhoSchema>;
export type AcaoCorretivaPublicacaoInput = z.infer<typeof acaoCorretivaPublicacaoSchema>;
export type FinalizarExecucaoInput = z.infer<typeof finalizarExecucaoSchema>;