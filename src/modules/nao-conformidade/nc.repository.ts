import { prisma } from "../../lib/prisma.js";
import { Prisma } from "../../generated/prisma/client.js";

export const ncRepository = {
    async listar() {
        return prisma.naoConformidade.findMany({
            include: { setor: true },
            orderBy: { dataRegistro: "desc" },
        });
    },

    async buscarPorId(id: number) {
        return prisma.naoConformidade.findUnique({
            where: { id },
            include: { setor: true },
        });
    }, 

    async criar(dados: Prisma.NaoConformidadeCreateInput){
        return prisma.naoConformidade.create({ data: dados });
    },

    async contarNoAno(ano: number) {
        return prisma.naoConformidade.count({
            where: {
                dataRegistro: {
                    gte: new Date(`${ano}-01-01`),
                    lt: new Date(`${ano + 1}-01-01`),
                },
            },
        });
    },
};