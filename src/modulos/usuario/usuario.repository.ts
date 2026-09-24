import type { ClientePrisma } from "../../compartilhado/prisma/tipos.js";

export const usuarioRepository = {
    async buscarPorEmail(tx: ClientePrisma, email: string) {
        return tx.usuario.findUnique({
            where: { email },
            include: { papeisRecebidos: true },
        });
    },

    async buscarPorId(tx: ClientePrisma, id: string) {
        return tx.usuario.findUnique({
            where: { id },
            include: { papeisRecebidos: true },
        });
    },

    async criar(tx: ClientePrisma, dados: { nome: string; email: string; setorId: number }) {
        return tx.usuario.create({ data: dados });
    },

    async definirSenha(tx: ClientePrisma, id: string, senhaHash: string) {
        return tx.usuario.update({
            where: { id },
            data: { senhaHash },
        });
    },
};
