import type { ClientePrisma } from "../../compartilhado/prisma/tipos.js";

export const setorRepository = {
    async buscarPorId(tx: ClientePrisma, id: number) {
        return tx.setor.findUnique({ where: { id } });
    },
};
