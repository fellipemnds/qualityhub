import { prisma } from "../../lib/prisma.js";
import type { Prisma } from "../../generated/prisma/client.js";
import type { Entidade } from "../../lib/entidades.js";

export const auditoriaRepository = {
    async registrar(dados: Prisma.TrilhaAuditoriaCreateInput) {
        return prisma.trilhaAuditoria.create({ data: dados })
    },

    async listarPorEntidade(entidade: Entidade, entidadeId: number) {
        return prisma.trilhaAuditoria.findMany({
            where: { entidade, entidadeId },
            orderBy: { criadoEm: "desc" }
        })
    }
}