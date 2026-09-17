import { ClientePrisma } from "../prisma/tipos.js";
import { FuncaoAtribuicao } from "../entidades/funcoes-atribuicao.js";

export const atribuicaoRepository = {
    async ehColaborador(cliente: ClientePrisma, registroId: string, usuarioId: string) {
        const atribuicao = await cliente.atribuicao.findFirst({
            where: {
                registroId, usuarioId, funcao: "COLABORADOR"
            }
        });
        return atribuicao !== null;
    },

    async ehAprovador(cliente: ClientePrisma, registroId: string, usuarioId: string) {
        const atribuicao = await cliente.atribuicao.findFirst({
            where: {
                registroId, usuarioId, funcao: "APROVADOR"
            }
        });
        return atribuicao !== null;
    },

    async existeAprovador(cliente: ClientePrisma, registroId: string) {
        const atribuicao = await cliente.atribuicao.findFirst({
            where: {
                registroId, funcao: "APROVADOR"
            }
        })

        return atribuicao !== null;
    },

    async inserirAtribuicao(tx: ClientePrisma, registroId: string, usuarioId: string, atribuidoPorId: string, funcao: FuncaoAtribuicao) {
        const atribuicao = await tx.atribuicao.create({
            data: {
                registroId,
                atribuidoPorId,
                usuarioId,
                funcao
            }
        })

        return atribuicao;
    },

    async contarColaboradores(cliente: ClientePrisma, registroId: string) {
        return cliente.atribuicao.count({
            where: { registroId, funcao: "COLABORADOR" }
        })
    },

    async removerAtribuicao(tx: ClientePrisma, registroId: string, usuarioId: string, funcao: FuncaoAtribuicao) {
        return tx.atribuicao.delete({
            where: {
                registroId_usuarioId_funcao: { registroId, usuarioId, funcao }
            }
        })
    },

    async buscarAprovador(cliente: ClientePrisma, registroId: string) {
        return cliente.atribuicao.findFirst({
            where: {
                registroId,
                funcao: "APROVADOR"
            }
        })
    }
}