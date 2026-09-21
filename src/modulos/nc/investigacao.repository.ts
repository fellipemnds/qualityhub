import { EstadoRegistro } from "../../compartilhado/entidades/estados.js";
import { ClientePrisma } from "../../compartilhado/prisma/tipos.js";
import { Prisma } from "../../generated/prisma/client.js";
import { InvestigacaoRascunhoInput } from "./investigacao.schema.js";

export const investigacaoRepository = {
    async criar(tx: ClientePrisma, dados: InvestigacaoRascunhoInput & { id: string, naoConformidadeId: string }) {
        const conteudo = dados.conteudo === null ? Prisma.JsonNull : dados.conteudo;
        return tx.investigacao.create({
            data: {
                ...dados,
                conteudo
            }
        });
    },

    async atualizar(tx: ClientePrisma, id: string, dados: InvestigacaoRascunhoInput) {
        const conteudo = dados.conteudo === null ? Prisma.JsonNull : dados.conteudo;
        return tx.investigacao.update({
            where: { id },
            data: {
                ...dados,
                conteudo
            }
        });
    },

    async buscaPorIdInvestigacao(tx: ClientePrisma, id: string) {
        return tx.investigacao.findUnique({
            where: { id }
        });
    },

    async listarInvestigacoes(tx: ClientePrisma, filtros: {
        naoConformidadeId?: string,
        estado?: EstadoRegistro
    }) {
        return tx.investigacao.findMany({
            where: {
                naoConformidadeId: filtros.naoConformidadeId,
                registro: {
                    estado: filtros.estado
                }
            },
            include: { registro: true }
        });
    }
}