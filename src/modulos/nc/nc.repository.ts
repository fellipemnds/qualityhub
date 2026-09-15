import { ClientePrisma } from "../../compartilhado/prisma/tipos.js";
import { NCRascunhoInput } from "./nc.schema.js";

export const ncRepository = {
    async criar(tx: ClientePrisma, dados: NCRascunhoInput & { id: string }) {
        return tx.naoConformidade.create({ data: dados })
    },

    async buscarPorId(tx: ClientePrisma, id: string) {
        return tx.naoConformidade.findUnique({
            where: { id }
        })
    },

    async atualizar(tx: ClientePrisma, id: string, dados: NCRascunhoInput) {
        return tx.naoConformidade.update({
            where: { id },
            data: dados
        })
    }
};