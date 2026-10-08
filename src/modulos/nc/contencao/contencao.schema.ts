import { z } from "zod";
import { diaDeCalendario } from "../../../compartilhado/datas/dia-de-calendario.js";
import { Disposicao } from "../../../compartilhado/entidades/disposicao.js";
import { EstadoRegistro } from "../../../compartilhado/entidades/estados.js";
import { TipoRegistro } from "../../../compartilhado/entidades/tipos-registro.js";
import { paginacaoCursorSchema } from "../../../compartilhado/registro/paginacao-cursor.js";
import { TEXTO_LONGO } from "../../../compartilhado/validacao/tetos.js";

// A base é a forma guardada no banco (datas já como Date); o rascunho é a entrada da API, com os dias em "AAAA-MM-DD"
export const contencaoBaseSchema = z.object({
    descricao: z.string().min(20).max(TEXTO_LONGO),
    executadaEm: z.date().nullish(),
    disposicao: z.enum(Disposicao).nullish(),
});
export const contencaoRascunhoSchema = contencaoBaseSchema
    .partial()
    .extend({ executadaEm: diaDeCalendario().nullish() })
    .strict();
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

// O formato de saída, o mesmo em criar, detalhe, lista, edição e transições (D1): os campos do Registro, sem o
// portaoAtual (D2), e os da contenção, nulos onde o rascunho permite
export const contencaoRespostaSchema = z.object({
    id: z.uuid(),
    criadoPorId: z.uuid(),
    tipo: z.enum(TipoRegistro),
    estado: z.enum(EstadoRegistro),
    codigo: z.string().nullable(),
    criadoEm: z.date(),
    atualizadoEm: z.date(),
    naoConformidadeId: z.uuid(),
    descricao: z.string().nullable(),
    executadaEm: diaDeCalendario().nullable(),
    disposicao: z.enum(Disposicao).nullable(),
});

// O detalhe traz também o motivo da última reprovação (L7, D5)
export const contencaoDetalheRespostaSchema = contencaoRespostaSchema.extend({
    ultimoMotivoReprovacao: z.string().nullable(),
});

// Os filtros da lista, com a paginação por cursor (L4): a mesma da lista de NCs
export const contencaoFiltrosListagemSchema = z
    .object({
        naoConformidadeId: z.uuid().optional(),
        estado: z.enum(EstadoRegistro).optional(),
    })
    .extend(paginacaoCursorSchema.shape);

export type ContencaoFiltrosListagemInput = z.infer<typeof contencaoFiltrosListagemSchema>;
