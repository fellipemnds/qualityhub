import { ClientePrisma } from "../../../compartilhado/prisma/tipos.js";
import { NCFiltrosListagemInput, NCRascunhoInput } from "./nc.schema.js";
import { LIMITE_PADRAO_PAGINACAO } from "../../../compartilhado/registro/paginacao-cursor.js";

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
    },

    async listar(tx: ClientePrisma, atorId: string, filtros: NCFiltrosListagemInput) {
        return tx.naoConformidade.findMany({
            where: {
                registro: {
                    estado: filtros.estado,
                    ...(filtros.minhas ? { atribuicoes: { some: { usuarioId: atorId } } } : {})
                },
                ...(filtros.classificacao ? { classificacoes: { some: { valor: filtros.classificacao, registro: { estado: "FECHADO" } } } } : {}),
                origem: filtros.origem,
                detectadoEm: { gte: filtros.de, lte: filtros.ate },
                id: { gt: filtros.cursor }
            },
            include: { registro: true },
            orderBy: { id: "asc" },
            take: (filtros.limit ?? LIMITE_PADRAO_PAGINACAO) + 1,
        });
    }
};