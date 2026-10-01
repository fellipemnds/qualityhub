import z from "zod";

// O trim vem antes do min: só espaços é motivo em branco, um erro de campo (400), não de estado (B18)
export const motivoSchema = z.object({
    motivo: z.string().trim().min(1),
});

export type MotivoInput = z.infer<typeof motivoSchema>;
