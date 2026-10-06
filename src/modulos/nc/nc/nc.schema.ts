import { z } from "zod";
import { diaDeCalendario } from "../../../compartilhado/datas/dia-de-calendario.js";
import { hojeEmSaoPaulo } from "../../../compartilhado/datas/hoje-em-sao-paulo.js";
import { ClassificacaoNC } from "../../../compartilhado/entidades/classificacao-nc.js";
import { EstadoRegistro } from "../../../compartilhado/entidades/estados.js";
import { OrigemNC } from "../../../compartilhado/entidades/origem-nc.js";
import { TipoRegistro } from "../../../compartilhado/entidades/tipos-registro.js";
import { paginacaoCursorSchema } from "../../../compartilhado/registro/paginacao-cursor.js";
import { GrupoFechamento, RequisitoFechamento } from "./avaliar-fechamento.js";

// Compara dias, não instantes (TRD §6, B11): o dia guardado é lido em UTC (meia-noite UTC do dia), e o "hoje" é o de São
// Paulo. Os dois no formato "AAAA-MM-DD", que ordena como texto
const naoNoFuturo = (data: Date) => data.toISOString().slice(0, 10) <= hojeEmSaoPaulo();
const MENSAGEM_FUTURO = "Data de detecção não pode ser no futuro";

// A base é a forma guardada no banco (datas já como Date); o rascunho é a entrada da API, com os dias em "AAAA-MM-DD"
export const ncBaseSchema = z.object({
    titulo: z.string().min(5).max(200),
    descricao: z.string().min(20),
    requisitoViolado: z.string().min(1),
    processoAfetado: z.string().min(1),
    setorId: z.coerce.number().int().positive(),
    detectadoEm: z.date().refine(naoNoFuturo, MENSAGEM_FUTURO).nullish(),
    origem: z.enum(OrigemNC),
    cliente: z.string().nullish(),
    riscosRevisados: z.string().min(1).nullish(),
    mudancasSGQ: z.string().min(1).nullish(),
});

export const ncRascunhoSchema = ncBaseSchema.partial().extend({
    detectadoEm: diaDeCalendario().refine(naoNoFuturo, MENSAGEM_FUTURO).nullish(),
});
// Na publicação e no fechamento a data é obrigatória: z.date() sem coerce recusa o null (B14)
export const ncPublicacaoSchema = ncBaseSchema.extend({
    detectadoEm: z.date().refine(naoNoFuturo, MENSAGEM_FUTURO),
});
export const ncFechamentoSchema = ncPublicacaoSchema.extend({
    riscosRevisados: z.string().min(1),
    mudancasSGQ: z.string().min(1),
});

export const ncFiltrosListagemSchema = z
    .object({
        estado: z.enum(EstadoRegistro).optional(),
        origem: z.enum(OrigemNC).optional(),
        de: diaDeCalendario().optional(),
        ate: diaDeCalendario().optional(),
        minhas: z.stringbool().optional(),
        classificacao: z.enum(ClassificacaoNC).optional(),
    })
    .extend(paginacaoCursorSchema.shape);

export type NCBaseInput = z.infer<typeof ncBaseSchema>;
export type NCRascunhoInput = z.infer<typeof ncRascunhoSchema>;
export type NCPublicacaoInput = z.infer<typeof ncPublicacaoSchema>;
export type NCFechamentoInput = z.infer<typeof ncFechamentoSchema>;
export type NCFiltrosListagemInput = z.infer<typeof ncFiltrosListagemSchema>;

export const ncRespostaSchema = z.object({
    id: z.uuid(),
    criadoPorId: z.uuid(),
    tipo: z.enum(TipoRegistro),
    estado: z.enum(EstadoRegistro),
    codigo: z.string().nullable(),
    criadoEm: z.date(),
    atualizadoEm: z.date(),
    titulo: z.string().nullable(),
    descricao: z.string().nullable(),
    requisitoViolado: z.string().nullable(),
    processoAfetado: z.string().nullable(),
    cliente: z.string().nullable(),
    riscosRevisados: z.string().nullable(),
    mudancasSGQ: z.string().nullable(),
    setorId: z.number().int().nullable(),
    origem: z.enum(OrigemNC).nullable(),
    detectadoEm: diaDeCalendario().nullable(),
});

// A lista da guarda de fechamento (RN-21), um item por requisito, atendido ou não, na ordem do avaliarFechamentoNC
export const checklistFechamentoRespostaSchema = z.array(
    z.object({
        requisito: z.enum(RequisitoFechamento),
        grupo: z.enum(GrupoFechamento),
        atendido: z.boolean(),
        mensagem: z.string(),
        pendentes: z.array(z.object({ id: z.uuid(), codigo: z.string().nullable() })),
    }),
);
