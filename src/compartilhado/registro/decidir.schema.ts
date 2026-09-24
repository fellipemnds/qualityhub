import z from "zod";
import { Decisao } from "../entidades/decisao.js";

export const decisaoSchema = z.object({
    decisao: z.enum(Decisao),
    motivo: z.string().optional(),
});

export type DecisaoInput = z.infer<typeof decisaoSchema>;
