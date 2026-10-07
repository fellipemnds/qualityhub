import z from "zod";
import { diaDeCalendario } from "../../../compartilhado/datas/dia-de-calendario.js";
import { EstadoRegistro } from "../../../compartilhado/entidades/estados.js";
import { TipoRegistro } from "../../../compartilhado/entidades/tipos-registro.js";
import { paginacaoCursorSchema } from "../../../compartilhado/registro/paginacao-cursor.js";
import { TEXTO_LONGO } from "../../../compartilhado/validacao/tetos.js";
import { verificacaoRespostaSchema } from "../verificacao/verificacao.schema.js";

// A base é a forma guardada no banco (datas já como Date); o rascunho é a entrada da API, com os dias em "AAAA-MM-DD"
export const acaoCorretivaBaseSchema = z.object({
    // A investigação que a Verificação NAO_EFICAZ reabre e que confere o plano (B10, RN-24): a ação nasce com ela e
    // o vínculo não se apaga (RN-49)
    investigacaoId: z.uuid(),
    descricao: z.string().min(20).max(TEXTO_LONGO).nullish(),
    prazo: z.date().nullish(),
    executadoEm: z.date().nullish(),
    evidencia: z.string().min(1).max(TEXTO_LONGO).nullish(),
    instrucoesVerificacao: z.string().min(1).max(TEXTO_LONGO).nullish(),
});

export const acaoCorretivaRascunhoSchema = acaoCorretivaBaseSchema
    .partial()
    .extend({
        prazo: diaDeCalendario().nullish(),
        executadoEm: diaDeCalendario().nullish(),
    })
    .strict();
// Criar exige a investigação; editar pode omiti-la (o partial já recusa o null: não se apaga)
export const acaoCorretivaCriacaoSchema = acaoCorretivaRascunhoSchema.required({ investigacaoId: true });
export const acaoCorretivaPublicacaoSchema = acaoCorretivaBaseSchema;

// O que o QA aprova no portão PLANO: depois da aprovação, esses campos não mudam mais (B2)
export const CAMPOS_DO_PLANO = ["investigacaoId", "descricao", "prazo", "instrucoesVerificacao"] as const;

export const acaoCorretivaPlanoSchema = acaoCorretivaBaseSchema.extend({
    descricao: z.string().min(20).max(TEXTO_LONGO),
    // Validado no banco, onde a data já é Date: z.date() sem coerce, para o null ser recusado (B14)
    prazo: z.date(),
    instrucoesVerificacao: z.string().min(1).max(TEXTO_LONGO),
});

export const acaoCorretivaExecucaoSchema = acaoCorretivaPlanoSchema.extend({
    executadoEm: z.date(),
    evidencia: z.string().min(1).max(TEXTO_LONGO),
});

export const finalizarExecucaoSchema = z
    .object({
        diasParaVerificar: z.number().int().positive(),
    })
    .strict();

export type AcaoCorretivaBaseInput = z.infer<typeof acaoCorretivaBaseSchema>;
export type AcaoCorretivaRascunhoInput = z.infer<typeof acaoCorretivaRascunhoSchema>;
export type AcaoCorretivaCriacaoInput = z.infer<typeof acaoCorretivaCriacaoSchema>;
export type AcaoCorretivaPublicacaoInput = z.infer<typeof acaoCorretivaPublicacaoSchema>;
export type FinalizarExecucaoInput = z.infer<typeof finalizarExecucaoSchema>;

// O formato de saída, o mesmo em criar, detalhe, lista, edição e transições (D1): os campos do Registro, sem o
// portaoAtual (D2), os da ação, com os dias sem hora (B22), e o planoAprovado em todas as rotas (Matthew, 2026-10-07):
// depois de aprovar, a própria resposta já diz que a execução está liberada, sem outro GET
export const acaoCorretivaRespostaSchema = z.object({
    id: z.uuid(),
    criadoPorId: z.uuid(),
    tipo: z.enum(TipoRegistro),
    estado: z.enum(EstadoRegistro),
    codigo: z.string().nullable(),
    criadoEm: z.date(),
    atualizadoEm: z.date(),
    naoConformidadeId: z.uuid(),
    investigacaoId: z.uuid(),
    descricao: z.string().nullable(),
    prazo: diaDeCalendario().nullable(),
    executadoEm: diaDeCalendario().nullable(),
    evidencia: z.string().nullable(),
    instrucoesVerificacao: z.string().nullable(),
    planoAprovado: z.boolean(),
});

// O finalizar-execucao devolve também a verificação que ele gerou
export const finalizarExecucaoRespostaSchema = acaoCorretivaRespostaSchema.extend({
    verificacaoGerada: verificacaoRespostaSchema,
});

// O detalhe traz também o motivo da última reprovação (L7, D5)
export const acaoCorretivaDetalheRespostaSchema = acaoCorretivaRespostaSchema.extend({
    ultimoMotivoReprovacao: z.string().nullable(),
});

// Os filtros da lista, com a paginação por cursor (L4): a mesma da lista de NCs
export const acaoCorretivaFiltrosListagemSchema = z
    .object({
        naoConformidadeId: z.uuid().optional(),
        estado: z.enum(EstadoRegistro).optional(),
    })
    .extend(paginacaoCursorSchema.shape);

export type AcaoCorretivaFiltrosListagemInput = z.infer<typeof acaoCorretivaFiltrosListagemSchema>;
