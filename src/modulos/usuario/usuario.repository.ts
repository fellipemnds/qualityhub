import type { TelaInicial } from "../../compartilhado/entidades/tela-inicial.js";
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

    // Só o que a pessoa pode ver de si mesma: sem a senha, sem as datas internas
    async buscarPerfil(tx: ClientePrisma, id: string) {
        return tx.usuario.findUnique({
            where: { id },
            select: {
                id: true,
                nome: true,
                email: true,
                telaInicial: true,
                setor: { select: { id: true, nome: true } },
                papeisRecebidos: { select: { papel: true } },
            },
        });
    },

    async alterarTelaInicial(tx: ClientePrisma, id: string, telaInicial: TelaInicial | null) {
        return tx.usuario.update({
            where: { id },
            data: { telaInicial },
        });
    },

    async encerrarSessoes(tx: ClientePrisma, id: string) {
        return tx.usuario.update({
            where: { id },
            data: { sessaoValidaDesde: new Date() },
        });
    },

    async definirSenha(tx: ClientePrisma, id: string, senhaHash: string) {
        return tx.usuario.update({
            where: { id },
            data: { senhaHash },
        });
    },
};
