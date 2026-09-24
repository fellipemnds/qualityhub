import type { EstadoRegistro } from "../../../compartilhado/entidades/estados.js";
import type { ClientePrisma } from "../../../compartilhado/prisma/tipos.js";
import type { VerificacaoRascunhoInput } from "./verificacao.schema.js";

export const verificacaoRepository = {
    async criar(tx: ClientePrisma, dados: VerificacaoRascunhoInput & { id: string; acaoCorretivaId: string }) {
        return tx.verificacao.create({ data: dados });
    },

    async buscarPorId(tx: ClientePrisma, id: string) {
        return tx.verificacao.findUnique({ where: { id } });
    },

    async atualizar(tx: ClientePrisma, id: string, dados: VerificacaoRascunhoInput) {
        return tx.verificacao.update({ where: { id }, data: dados });
    },

    async listar(tx: ClientePrisma, filtros: { acaoCorretivaId?: string; estado?: EstadoRegistro }) {
        return tx.verificacao.findMany({
            where: {
                acaoCorretivaId: filtros.acaoCorretivaId,
                registro: { estado: filtros.estado },
            },
            include: { registro: true },
        });
    },
};
