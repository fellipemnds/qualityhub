import z from "zod";
import { EstadoRegistro } from "../../../compartilhado/entidades/estados.js";
import { MetodoInvestigacao } from "../../../compartilhado/entidades/metodo-investigacao.js";
import { TipoRegistro } from "../../../compartilhado/entidades/tipos-registro.js";
import { paginacaoCursorSchema } from "../../../compartilhado/registro/paginacao-cursor.js";
import { TEXTO_LONGO } from "../../../compartilhado/validacao/tetos.js";

// O conteúdo do método (A3 SPS): um objeto de chaves livres (percepção inicial, descrição, ishikawa...). Não o z.json(): ele é
// recursivo, e a definição recursiva saía no OpenAPI como um $ref para o nada, que o Orval não segue (B37)
const conteudoA3 = z.record(z.string(), z.unknown());

export const investigacaoBaseSchema = z.object({
    realProblema: z.string().min(20).max(TEXTO_LONGO),
    metodo: z.enum(MetodoInvestigacao).nullish(),
    conteudo: conteudoA3.nullish(),
    causaDireta: z.string().min(20).max(TEXTO_LONGO).nullish(),
    causaRaiz: z.string().min(20).max(TEXTO_LONGO).nullish(),
});

export const investigacaoRascunhoSchema = investigacaoBaseSchema.partial().strict();
export const investigacaoPublicacaoSchema = investigacaoBaseSchema;
export const investigacaoFechamentoSchema = investigacaoBaseSchema.extend({
    metodo: z.enum(MetodoInvestigacao),
    conteudo: conteudoA3,
    causaDireta: z.string().min(20).max(TEXTO_LONGO),
    causaRaiz: z.string().min(20).max(TEXTO_LONGO),
});

export type InvestigacaoBaseInput = z.infer<typeof investigacaoBaseSchema>;
export type InvestigacaoRascunhoInput = z.infer<typeof investigacaoRascunhoSchema>;
export type InvestigacaoPublicacaoInput = z.infer<typeof investigacaoPublicacaoSchema>;
export type InvestigacaoFechamentoInput = z.infer<typeof investigacaoFechamentoSchema>;

// O formato de saída, o mesmo em criar, detalhe, lista, edição e transições (D1): os campos do Registro, sem o
// portaoAtual (D2), e os da investigação, nulos onde o rascunho permite. As hipóteses não saem aqui (L1, na C2)
export const investigacaoRespostaSchema = z.object({
    id: z.uuid(),
    criadoPorId: z.uuid(),
    tipo: z.enum(TipoRegistro),
    estado: z.enum(EstadoRegistro),
    codigo: z.string().nullable(),
    criadoEm: z.date(),
    atualizadoEm: z.date(),
    naoConformidadeId: z.uuid(),
    realProblema: z.string().nullable(),
    metodo: z.enum(MetodoInvestigacao).nullable(),
    conteudo: conteudoA3.nullable(),
    causaDireta: z.string().nullable(),
    causaRaiz: z.string().nullable(),
});

// O detalhe traz também o motivo da última reprovação (L7, D5)
export const investigacaoDetalheRespostaSchema = investigacaoRespostaSchema.extend({
    ultimoMotivoReprovacao: z.string().nullable(),
});

// Os filtros da lista, com a paginação por cursor (L4): a mesma da lista de NCs
export const investigacaoFiltrosListagemSchema = z
    .object({
        naoConformidadeId: z.uuid().optional(),
        estado: z.enum(EstadoRegistro).optional(),
    })
    .extend(paginacaoCursorSchema.shape);

export type InvestigacaoFiltrosListagemInput = z.infer<typeof investigacaoFiltrosListagemSchema>;
