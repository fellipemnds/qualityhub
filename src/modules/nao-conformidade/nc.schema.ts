import { z } from "zod";

export const criarNCSchema = z.object({
    titulo: z.string().min(1),
    descricao: z.string().min(1),
    requisitoViolado: z.string().min(1),
    dataOcorrencia: z.coerce.date(),
    origem: z.enum(["AUDITORIA_INTERNA", "AUDITORIA_EXTERNA", "OPERACAO", "RECLAMACAO_CLIENTE"]),
    cliente: z.string().optional(),
    setorId: z.number().int().positive()
})

export type CriarNCInput = z.infer<typeof criarNCSchema>;