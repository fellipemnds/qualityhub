import { Papel } from "../../compartilhado/entidades/papeis.js";
import { ClientePrisma } from "../../compartilhado/prisma/tipos.js";

export const usuarioPapelRepository = {
    async concederPapel(tx: ClientePrisma, dados: {
        usuarioId: string,
        papel: Papel,
        concedidoPorId: string
    }) {
        return tx.usuarioPapel.create({ data: dados });
    }
}