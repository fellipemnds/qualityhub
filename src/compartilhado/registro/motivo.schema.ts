import z from "zod";
import { TEXTO_LONGO } from "../validacao/tetos.js";

// O trim vem antes do min: só espaços é motivo em branco, um erro de campo (400), não de estado (B18)
export const motivoSchema = z.object({
    motivo: z.string().trim().min(1).max(TEXTO_LONGO),
});

export type MotivoInput = z.infer<typeof motivoSchema>;
