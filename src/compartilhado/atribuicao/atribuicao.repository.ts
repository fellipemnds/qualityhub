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
    }
}