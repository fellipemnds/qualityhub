import type { Papel } from "../../compartilhado/entidades/papeis.js";
import type { ClientePrisma } from "../../compartilhado/prisma/tipos.js";

export const usuarioPapelRepository = {
    async concederPapel(
        tx: ClientePrisma,
        dados: {
            usuarioId: string;
            papel: Papel;
            concedidoPorId: string;
        },
    ) {
        return tx.usuarioPapel.create({ data: dados });
    },

    async revogarPapel(tx: ClientePrisma, usuarioId: string, papel: Papel) {
        return tx.usuarioPapel.delete({ where: { usuarioId_papel: { usuarioId, papel } } });
    },
};
