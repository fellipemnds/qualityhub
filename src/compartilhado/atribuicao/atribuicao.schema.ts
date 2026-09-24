import z from "zod";

export const definirAprovadorSchema = z.object({
    usuarioId: z.uuid(),
});

export const colaboradoresSchema = z.object({
    colaboradores: z.array(z.uuid()).min(1),
});

export type AprovadorInput = z.infer<typeof definirAprovadorSchema>;
export type ColaboradoresInput = z.infer<typeof colaboradoresSchema>;
