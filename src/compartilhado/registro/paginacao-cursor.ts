import z from "zod";

export const LIMITE_PADRAO_PAGINACAO = 20;

export const paginacaoCursorSchema = z.object({
    cursor: z.uuid().optional(),
    limit: z.coerce.number().int().positive().max(100).optional(),
});

export type PaginacaoCursorInput = z.infer<typeof paginacaoCursorSchema>;

export function paginar<T extends { id: string }>(itens: T[], limit: number) {
    const itensDaPagina = itens.slice(0, limit);
    const proximoCursor = itens.length > limit ? (itensDaPagina.at(-1)?.id ?? null) : null;

    return { itensDaPagina, proximoCursor };
}
