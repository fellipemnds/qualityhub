import z from "zod";
import { diaDeCalendario } from "../../../compartilhado/datas/dia-de-calendario.js";

// A base é a forma guardada no banco (datas já como Date); o rascunho é a entrada da API, com os dias em "AAAA-MM-DD"
export const acaoCorretivaBaseSchema = z.object({
    // A investigação que a Verificação NAO_EFICAZ reabre e que confere o plano (B10, RN-24): a ação nasce com ela e
    // o vínculo não se apaga (RN-49)
    investigacaoId: z.uuid(),
    descricao: z.string().min(20).nullish(),
    prazo: z.date().nullish(),
    executadoEm: z.date().nullish(),
    evidencia: z.string().min(1).nullish(),
    instrucoesVerificacao: z.string().min(1).nullish(),
});

export const acaoCorretivaRascunhoSchema = acaoCorretivaBaseSchema.partial().extend({
    prazo: diaDeCalendario().nullish(),
    executadoEm: diaDeCalendario().nullish(),
});
// Criar exige a investigação; editar pode omiti-la (o partial já recusa o null: não se apaga)
export const acaoCorretivaCriacaoSchema = acaoCorretivaRascunhoSchema.required({ investigacaoId: true });
export const acaoCorretivaPublicacaoSchema = acaoCorretivaBaseSchema;

// O que o QA aprova no portão PLANO: depois da aprovação, esses campos não mudam mais (B2)
export const CAMPOS_DO_PLANO = ["investigacaoId", "descricao", "prazo", "instrucoesVerificacao"] as const;

export const acaoCorretivaPlanoSchema = acaoCorretivaBaseSchema.extend({
    descricao: z.string().min(20),
    // Validado no banco, onde a data já é Date: z.date() sem coerce, para o null ser recusado (B14)
    prazo: z.date(),
    instrucoesVerificacao: z.string().min(1),
});

export const acaoCorretivaExecucaoSchema = acaoCorretivaPlanoSchema.extend({
    executadoEm: z.date(),
    evidencia: z.string().min(1),
});

export const finalizarExecucaoSchema = z.object({
    diasParaVerificar: z.number().int().positive(),
});

export type AcaoCorretivaBaseInput = z.infer<typeof acaoCorretivaBaseSchema>;
export type AcaoCorretivaRascunhoInput = z.infer<typeof acaoCorretivaRascunhoSchema>;
export type AcaoCorretivaCriacaoInput = z.infer<typeof acaoCorretivaCriacaoSchema>;
export type AcaoCorretivaPublicacaoInput = z.infer<typeof acaoCorretivaPublicacaoSchema>;
export type FinalizarExecucaoInput = z.infer<typeof finalizarExecucaoSchema>;
