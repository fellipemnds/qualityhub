import type { FuncaoAtribuicao } from "../entidades/funcoes-atribuicao.js";
import type { ClientePrisma } from "../prisma/tipos.js";

export const atribuicaoRepository = {
    async ehColaborador(cliente: ClientePrisma, registroId: string, usuarioId: string) {
        const atribuicao = await cliente.atribuicao.findFirst({
            where: {
                registroId,
                usuarioId,
                funcao: "COLABORADOR",
            },
        });
        return atribuicao !== null;
    },

    async ehAprovador(cliente: ClientePrisma, registroId: string, usuarioId: string) {
        const atribuicao = await cliente.atribuicao.findFirst({
            where: {
                registroId,
                usuarioId,
                funcao: "APROVADOR",
            },
        });
        return atribuicao !== null;
    },

    async existeAprovador(cliente: ClientePrisma, registroId: string) {
        const atribuicao = await cliente.atribuicao.findFirst({
            where: {
                registroId,
                funcao: "APROVADOR",
            },
        });

        return atribuicao !== null;
    },

    async inserirAtribuicao(
        tx: ClientePrisma,
        registroId: string,
        usuarioId: string,
        atribuidoPorId: string,
        funcao: FuncaoAtribuicao,
    ) {
        const atribuicao = await tx.atribuicao.create({
            data: {
                registroId,
                atribuidoPorId,
                usuarioId,
                funcao,
            },
        });

        return atribuicao;
    },

    // Só os ativos: quem foi inativado não recebe atribuição nova, nem copiada de outro item (B28)
    async listarColaboradoresAtivos(cliente: ClientePrisma, registroId: string) {
        return cliente.atribuicao.findMany({
            where: { registroId, funcao: "COLABORADOR", usuario: { desativadoEm: null } },
        });
    },

    async contarColaboradores(cliente: ClientePrisma, registroId: string) {
        return cliente.atribuicao.count({
            where: { registroId, funcao: "COLABORADOR" },
        });
    },

    async removerAtribuicao(tx: ClientePrisma, registroId: string, usuarioId: string, funcao: FuncaoAtribuicao) {
        return tx.atribuicao.delete({
            where: {
                registroId_usuarioId_funcao: { registroId, usuarioId, funcao },
            },
        });
    },

    async buscarAprovador(cliente: ClientePrisma, registroId: string) {
        return cliente.atribuicao.findFirst({
            where: {
                registroId,
                funcao: "APROVADOR",
            },
        });
    },

    async listarItensAbertosDoAprovador(cliente: ClientePrisma, usuarioId: string) {
        return cliente.atribuicao.findMany({
            where: {
                usuarioId,
                funcao: "APROVADOR",
                registro: {
                    estado: { in: ["RASCUNHO", "ABERTO", "EM_APROVACAO"] },
                },
            },
            select: {
                registro: {
                    select: { id: true, codigo: true, tipo: true, estado: true },
                },
            },
        });
    },
};
