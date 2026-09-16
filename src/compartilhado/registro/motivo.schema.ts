import z from "zod";

export const motivoSchema = z.object({
    motivo: z.string().min(1)
});

export type MotivoInput = z.infer<typeof motivoSchema>;