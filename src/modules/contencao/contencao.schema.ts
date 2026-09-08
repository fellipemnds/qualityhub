import { z } from "zod";

export const criarContencaoSchema = z.object({
    responsavelId: z.coerce.number().int().positive().optional(),
    descricao: z.string().min(1),
    prazo: z.coerce.date()
});

export type CriarContencaoInput = z.infer<typeof criarContencaoSchema>;