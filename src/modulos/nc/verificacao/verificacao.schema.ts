import z from "zod";
import { diaDeCalendario } from "../../../compartilhado/datas/dia-de-calendario.js";
import { EstadoRegistro } from "../../../compartilhado/entidades/estados.js";
import { ResultadoVerificacao } from "../../../compartilhado/entidades/resultado-verificacao.js";
import { TipoRegistro } from "../../../compartilhado/entidades/tipos-registro.js";

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

// O formato de saída, o mesmo em detalhe, lista, edição e transições (D1): os campos do Registro, sem o portaoAtual
// (D2), e os da verificação, com os dias sem hora (B22). É também o da verificacaoGerada do finalizar-execucao
export const verificacaoRespostaSchema = z.object({
    id: z.uuid(),
    criadoPorId: z.uuid(),
    tipo: z.enum(TipoRegistro),
    estado: z.enum(EstadoRegistro),
    codigo: z.string().nullable(),
    criadoEm: z.date(),
    atualizadoEm: z.date(),
    acaoCorretivaId: z.uuid(),
    instrucoesVerificacao: z.string().nullable(),
    prazo: diaDeCalendario().nullable(),
    resultado: z.enum(ResultadoVerificacao).nullable(),
    conclusao: z.string().nullable(),
    verificadoEm: diaDeCalendario().nullable(),
});
