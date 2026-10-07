import z from "zod";
import { ClassificacaoNC } from "../../../compartilhado/entidades/classificacao-nc.js";
import { EstadoRegistro } from "../../../compartilhado/entidades/estados.js";
import { TipoRegistro } from "../../../compartilhado/entidades/tipos-registro.js";
import { TEXTO_LONGO } from "../../../compartilhado/validacao/tetos.js";

export const classificacaoBaseSchema = z.object({
    valor: z.enum(ClassificacaoNC).nullish(),
    justificativa: z.string().min(20).max(TEXTO_LONGO).nullish(),
});

export const classificacaoRascunhoSchema = classificacaoBaseSchema.partial().strict();
export const classificacaoPublicacaoSchema = classificacaoBaseSchema;
export const classificacaoFechamentoSchema = classificacaoBaseSchema.extend({
    valor: z.enum(ClassificacaoNC),
    justificativa: z.string().min(20).max(TEXTO_LONGO),
});

export type ClassificacaoBaseInput = z.infer<typeof classificacaoBaseSchema>;
export type ClassificacaoRascunhoInput = z.infer<typeof classificacaoRascunhoSchema>;
export type ClassificacaoPublicacaoInput = z.infer<typeof classificacaoPublicacaoSchema>;
export type ClassificacaoFechamentoInput = z.infer<typeof classificacaoFechamentoSchema>;

// O formato de saída, o mesmo em criar, detalhe, lista, edição e transições (D1): os campos do Registro, sem o
// portaoAtual (D2), e os da classificação, nulos onde o rascunho permite
export const classificacaoRespostaSchema = z.object({
    id: z.uuid(),
    criadoPorId: z.uuid(),
    tipo: z.enum(TipoRegistro),
    estado: z.enum(EstadoRegistro),
    codigo: z.string().nullable(),
    criadoEm: z.date(),
    atualizadoEm: z.date(),
    naoConformidadeId: z.uuid(),
    valor: z.enum(ClassificacaoNC).nullable(),
    justificativa: z.string().nullable(),
});

// O detalhe traz também o motivo da última reprovação (L7, D5)
export const classificacaoDetalheRespostaSchema = classificacaoRespostaSchema.extend({
    ultimoMotivoReprovacao: z.string().nullable(),
});
