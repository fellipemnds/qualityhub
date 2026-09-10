import { z } from "zod";
import { ClassificacaoNC } from "../../generated/prisma/enums.js";

export const criarNCSchema = z.object({
    titulo: z.string().min(1),
    descricao: z.string().min(1),
    requisitoViolado: z.string().min(1),
    dataOcorrencia: z.coerce.date(),
    origem: z.enum(["AUDITORIA_INTERNA", "AUDITORIA_EXTERNA", "OPERACAO", "RECLAMACAO_CLIENTE"]),
    cliente: z.string().optional(),
    setorId: z.number().int().positive()
})

export const buscarIdNCSchema = z.object({
    id: z.coerce.number().int().positive()
})

export const classificarNCSchema = z.object({
    classificacao: z.enum(ClassificacaoNC)
})

export type CriarNCInput = z.infer<typeof criarNCSchema>;