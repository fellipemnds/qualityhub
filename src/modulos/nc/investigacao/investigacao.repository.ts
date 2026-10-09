import type { EstadoRegistro } from "../../../compartilhado/entidades/estados.js";
import type { ClientePrisma } from "../../../compartilhado/prisma/tipos.js";
import { Prisma } from "../../../generated/prisma/client.js";
import type { InvestigacaoRascunhoInput } from "./investigacao.schema.js";

// O conteúdo chega do corpo JSON da requisição: todo valor dentro dele já é JSON. O schema o declara como objeto de valores
// unknown (o z.json() recursivo quebrava o OpenAPI, B37), e é aqui, na entrada do Prisma, que ele volta a ser JSON
function conteudoParaPrisma(conteudo: InvestigacaoRascunhoInput["conteudo"]) {
    return conteudo === null ? Prisma.JsonNull : (conteudo as Prisma.InputJsonObject | undefined);
}

export const investigacaoRepository = {
    async criar(tx: ClientePrisma, dados: InvestigacaoRascunhoInput & { id: string; naoConformidadeId: string }) {
        const conteudo = conteudoParaPrisma(dados.conteudo);
        return tx.investigacao.create({
            data: {
                ...dados,
                conteudo,
            },
        });
    },

    async atualizar(tx: ClientePrisma, id: string, dados: InvestigacaoRascunhoInput) {
        const conteudo = conteudoParaPrisma(dados.conteudo);
        return tx.investigacao.update({
            where: { id },
            data: {
                ...dados,
                conteudo,
            },
        });
    },

    async buscarPorId(tx: ClientePrisma, id: string) {
        return tx.investigacao.findUnique({
            where: { id },
        });
    },

    async listarInvestigacoes(
        tx: ClientePrisma,
        filtros: {
            naoConformidadeId?: string;
            estado?: EstadoRegistro;
            cursor?: string;
            limit?: number;
        },
    ) {
        return tx.investigacao.findMany({
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
