import type { Prisma } from "../../generated/prisma/client.js";
import { ClientePrisma } from "../prisma/tipos.js";

export const auditoriaRepository = {
    async registrar(tx: ClientePrisma, dados: {
        entidade: string,
        entidadeId: string,
        acao: string,
        usuarioId: string,
        antes?: unknown,
        depois?: unknown
    }) {
        return tx.auditoria.create({
            data: {
                entidade: dados.entidade,
                entidadeId: dados.entidadeId,
                acao: dados.acao,
                usuarioId: dados.usuarioId,
                antes: dados.antes as Prisma.InputJsonValue | undefined, 
                depois: dados.depois as Prisma.InputJsonValue | undefined
            }
        })
    },

    async listarPorEntidade(tx: ClientePrisma, entidadeId: string) {
        return tx.auditoria.findMany({
            where: { entidadeId },
            orderBy: {registradoEm: "desc"}
        })
    }
}