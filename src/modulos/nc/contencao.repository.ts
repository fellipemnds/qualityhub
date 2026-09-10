import { prisma } from "../../lib/prisma.js";
import type { Prisma } from "../../generated/prisma/client.js";

const responsavelPublico = {
    select: { id: true, nome: true, email: true }
};

export const contencaoRepository = {
    async criar(dados: Prisma.ContencaoCreateInput) {
        return prisma.contencao.create({ data: dados });
    },

    async listarPorNC(naoConformidadeId: number) {
        return prisma.contencao.findMany({
            where: { naoConformidadeId },
            orderBy: { criadoEm: "desc" },
            include: { responsavel: responsavelPublico }
        })
    },

    async buscarPorId(id: number) {
        return prisma.contencao.findUnique({
            where: { id },
            include: { responsavel: responsavelPublico }
        })
    },

    async contarAbertas(naoConformidadeId: number) {
        return prisma.contencao.count({
            where: {
                naoConformidadeId,
                concluidaEm: null
            }
        })
    }
}