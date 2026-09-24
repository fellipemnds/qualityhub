import type { ClientePrisma } from "../prisma/tipos.js";

export const cancelamentoRepository = {
    async criar(
        tx: ClientePrisma,
        dados: {
            registroId: string;
            canceladoPorId: string;
            motivo: string;
        },
    ) {
        return tx.cancelamento.create({ data: dados });
    },
};
