import { text } from "node:stream/consumers";
import { ClientePrisma } from "../prisma/tipos.js";

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

    async adicionarColaboradores(cliente: ClientePrisma, registroId: string, usuarioIds: string[], atribuidoPorId: string) {
        for (const usuarioId of usuarioIds) {
            await cliente.atribuicao.create({
                data: {
                    registroId,
                    atribuidoPorId,
                    usuarioId,
                    funcao: "COLABORADOR"
                }
            })
        }
    }
}