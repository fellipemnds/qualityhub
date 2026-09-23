import { ClientePrisma } from "../../compartilhado/prisma/tipos.js";
import { HipoteseRascunhoInput } from "./hipotese.schema.js";

export const hipoteseRepository = {
    async criar(tx: ClientePrisma, investigacaoId: string, dados: HipoteseRascunhoInput) {
        return tx.hipotese.create({ data: { ...dados, investigacaoId } });
    },

    async buscarPorId(tx: ClientePrisma, id: string) {
        return tx.hipotese.findUnique({ where: { id } });
    },

    async atualizar(tx: ClientePrisma, id: string, dados: HipoteseRascunhoInput) {
        return tx.hipotese.update({ where: { id }, data: dados });
    },

    async listarPorInvestigacao(tx: ClientePrisma, investigacaoId: string) {
        return tx.hipotese.findMany({ where: { investigacaoId } });
    },

    async excluir(tx: ClientePrisma, id: string) {
        return tx.hipotese.delete({ where: { id } });
    }
}