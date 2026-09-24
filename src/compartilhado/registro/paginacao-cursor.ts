import z from "zod";

export const LIMITE_PADRAO_PAGINACAO = 20;

export const paginacaoCursorSchema = z.object({
    cursor: z.uuid().optional(),
    limit: z.coerce.number().int().positive().max(100).optional(),
});

export type PaginacaoCursorInput = z.infer<typeof paginacaoCursorSchema>;

export function paginar<T extends { id: string }>(itens: T[], limit: number) {
    let itensDaPagina, proximoCursor;
    if (itens.length > limit) {
        itensDaPagina = itens.slice(0, limit);
        proximoCursor = itensDaPagina.at(-1)?.id ?? null;
    } else {
        itensDaPagina = itens;
        proximoCursor = null;
    }

    return { itensDaPagina, proximoCursor };
}
