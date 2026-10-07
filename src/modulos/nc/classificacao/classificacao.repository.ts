import type { EstadoRegistro } from "../../../compartilhado/entidades/estados.js";
import type { ClientePrisma } from "../../../compartilhado/prisma/tipos.js";
import type { ClassificacaoRascunhoInput } from "./classificacao.schema.js";

export const classificacaoRepository = {
    async criar(tx: ClientePrisma, dados: ClassificacaoRascunhoInput & { id: string; naoConformidadeId: string }) {
        return tx.classificacao.create({ data: dados });
    },

    async buscarPorId(tx: ClientePrisma, id: string) {
        return tx.classificacao.findUnique({
            where: { id },
        });
    },

    async atualizar(tx: ClientePrisma, id: string, dados: ClassificacaoRascunhoInput) {
        return tx.classificacao.update({
            where: { id },
            data: dados,
        });
    },

    async listarClassificacoes(
        tx: ClientePrisma,
        filtros: {
            naoConformidadeId?: string;
            estado?: EstadoRegistro;
            cursor?: string;
            limit?: number;
        },
    ) {
        return tx.classificacao.findMany({
            where: {
                naoConformidadeId: filtros.naoConformidadeId,
                registro: {
                    estado: filtros.estado,
                },
                id: { gt: filtros.cursor },
            },
            include: { registro: true },
            orderBy: { id: "asc" },
            // Sem limit, todas (a guarda de fechamento da NC usa assim); com limit, uma página com um item a mais
            take: filtros.limit === undefined ? undefined : filtros.limit + 1,
        });
    },
};
