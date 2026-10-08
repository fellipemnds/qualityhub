import z from "zod";

export const LIMITE_PADRAO_PAGINACAO = 20;

export const paginacaoCursorSchema = z.object({
    cursor: z.uuid().optional(),
    limit: z.coerce.number().int().positive().max(100).optional(),
});

export type PaginacaoCursorInput = z.infer<typeof paginacaoCursorSchema>;

// O envelope que o paginar() monta, como schema de resposta: o mesmo em toda lista, muda só o schema do item
export const paginaSchema = <T extends z.ZodType>(itemSchema: T) =>
    z.object({
        itensDaPagina: z.array(itemSchema),
        proximoCursor: z.uuid().nullable(),
    });

export function paginar<T extends { id: string }>(itens: T[], limit: number) {
    const itensDaPagina = itens.slice(0, limit);
    const proximoCursor = itens.length > limit ? (itensDaPagina.at(-1)?.id ?? null) : null;

    return { itensDaPagina, proximoCursor };
}
