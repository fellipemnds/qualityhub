import { ClientePrisma } from "../prisma/tipos.js";

export const reaberturaRepository = {
    async criar(
        tx: ClientePrisma,
        dados: {
            registroId: string;
            reabertoPorId: string;
            motivo: string;
        },
    ) {
        return tx.reabertura.create({ data: dados });
    },
};
