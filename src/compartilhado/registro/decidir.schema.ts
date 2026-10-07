import z from "zod";
import { Decisao } from "../entidades/decisao.js";
import { TEXTO_LONGO } from "../validacao/tetos.js";

export const decisaoSchema = z
    .object({
        decisao: z.enum(Decisao),
        motivo: z.string().max(TEXTO_LONGO).optional(),
    })
    .strict();

export type DecisaoInput = z.infer<typeof decisaoSchema>;
