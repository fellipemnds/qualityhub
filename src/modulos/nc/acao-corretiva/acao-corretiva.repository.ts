import type { EstadoRegistro } from "../../../compartilhado/entidades/estados.js";
import type { ClientePrisma } from "../../../compartilhado/prisma/tipos.js";
import type { AcaoCorretivaCriacaoInput, AcaoCorretivaRascunhoInput } from "./acao-corretiva.schema.js";

export const acaoCorretivaRepository = {
    async criar(tx: ClientePrisma, dados: AcaoCorretivaCriacaoInput & { id: string; naoConformidadeId: string }) {
        return tx.acaoCorretiva.create({ data: dados });
    },

    async buscarPorId(tx: ClientePrisma, id: string) {
        return tx.acaoCorretiva.findUnique({ where: { id } });
    },

    async atualizar(tx: ClientePrisma, id: string, dados: AcaoCorretivaRascunhoInput) {
        return tx.acaoCorretiva.update({ where: { id }, data: dados });
    },

    // Derivado das decisões registradas, não do portaoAtual (esquema §4.2): a ação nunca é reaberta (RN-42), então uma
    // aprovação do plano vale para sempre. Base do B1, do B2 e da guarda de fechamento da NC
    async planoAprovado(cliente: ClientePrisma, id: string) {
        const aprovacao = await cliente.aprovacao.findFirst({
            where: { registroId: id, portao: "PLANO", decisao: "APROVADO" },
        });

        return aprovacao !== null;
    },

    // As ações que nasceram da investigação (RN-49), com o registro: base das guardas da investigação
    async listarPorInvestigacao(cliente: ClientePrisma, investigacaoId: string) {
        return cliente.acaoCorretiva.findMany({ where: { investigacaoId }, include: { registro: true } });
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
