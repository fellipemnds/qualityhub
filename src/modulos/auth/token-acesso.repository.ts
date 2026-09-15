import { TipoTokenAcesso } from "../../compartilhado/entidades/tipo-token-acesso.js";
import { ClientePrisma } from "../../compartilhado/prisma/tipos.js";

export const tokenAcessoRepository = {
    async criar(tx: ClientePrisma, dados: {
        usuarioId: string,
        tipo: TipoTokenAcesso,
        tokenHash: string,
        expiraEm: Date
    }) {
        return tx.tokenAcesso.create({ data: dados })
    },

    async buscarPorHash(tx: ClientePrisma, tokenHash: string) {
        return tx.tokenAcesso.findUnique({
            where: { tokenHash }
        })
    },

    async marcarComoUsado(tx: ClientePrisma, id: string) {
        return tx.tokenAcesso.update({
            where: { id },
            data: {
                usadoEm: new Date()
            }
        })
    }
}