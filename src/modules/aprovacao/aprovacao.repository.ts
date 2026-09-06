import { prisma } from "../../lib/prisma.js";
import type { Prisma } from "../../generated/prisma/client.js";
import type { PortaoAprovacao } from "../../generated/prisma/client.js";

export const aprovacaoRepository = {
    // Cria um fluxo de aprovação
    async criar(dados: Prisma.AprovacaoCreateInput) {
        return prisma.aprovacao.create({ data: dados });
    },

    // Lista as aprovações de uma NC
    async listarPorNC(naoConformidadeId: number) {
        return prisma.aprovacao.findMany({
            where: { naoConformidadeId },
            orderBy: { criadoEm: "desc" }
        })
    },


    async buscarPorPortao(naoConformidadeId: number, portao: PortaoAprovacao) {
        return prisma.aprovacao.findFirst({
            where: { naoConformidadeId, portao },
            orderBy: { criadoEm: "desc" }
        })
    }
}