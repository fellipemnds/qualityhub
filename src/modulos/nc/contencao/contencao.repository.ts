import type { EstadoRegistro } from "../../../compartilhado/entidades/estados.js";
import type { ClientePrisma } from "../../../compartilhado/prisma/tipos.js";
import type { ContencaoRascunhoInput } from "./contencao.schema.js";

export const contencaoRepository = {
    async criar(tx: ClientePrisma, dados: ContencaoRascunhoInput & { id: string; naoConformidadeId: string }) {
        return tx.contencao.create({ data: dados });
    },

    async buscarPorId(tx: ClientePrisma, id: string) {
        return tx.contencao.findUnique({
            where: { id },
        });
    },

    async atualizar(tx: ClientePrisma, id: string, dados: ContencaoRascunhoInput) {
        return tx.contencao.update({
            where: { id },
            data: dados,
        });
    },

    async listarContencoes(
        tx: ClientePrisma,
        filtros: {
            naoConformidadeId?: string;
            estado?: EstadoRegistro;
        },
    ) {
        return tx.contencao.findMany({
            where: {
                naoConformidadeId: filtros.naoConformidadeId,
                registro: {
                    estado: filtros.estado,
                },
            },
            include: { registro: true },
        });
    },
};
