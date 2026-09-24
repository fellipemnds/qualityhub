import type { EstadoRegistro } from "../../../compartilhado/entidades/estados.js";
import type { ClientePrisma } from "../../../compartilhado/prisma/tipos.js";
import type { AcaoCorretivaRascunhoInput } from "./acao-corretiva.schema.js";

export const acaoCorretivaRepository = {
    async criar(tx: ClientePrisma, dados: AcaoCorretivaRascunhoInput & { id: string; naoConformidadeId: string }) {
        return tx.acaoCorretiva.create({ data: dados });
    },

    async buscarPorId(tx: ClientePrisma, id: string) {
        return tx.acaoCorretiva.findUnique({ where: { id } });
    },

    async atualizar(tx: ClientePrisma, id: string, dados: AcaoCorretivaRascunhoInput) {
        return tx.acaoCorretiva.update({ where: { id }, data: dados });
    },

    async listar(tx: ClientePrisma, filtros: { naoConformidadeId?: string; estado?: EstadoRegistro }) {
        return tx.acaoCorretiva.findMany({
            where: {
                naoConformidadeId: filtros.naoConformidadeId,
                registro: { estado: filtros.estado },
            },
            include: { registro: true },
        });
    },
};
