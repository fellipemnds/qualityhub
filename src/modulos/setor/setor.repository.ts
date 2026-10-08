import type { ClientePrisma } from "../../compartilhado/prisma/tipos.js";

const camposDoSetor = { id: true, nome: true, desativadoEm: true } as const;

const desativadoEmPorSituacao = { ATIVO: null, INATIVO: { not: null }, TODOS: undefined } as const;

export const setorRepository = {
    async buscarPorId(tx: ClientePrisma, id: number) {
        return tx.setor.findUnique({ where: { id } });
    },

    // Sem diferenciar maiúscula: "qualidade" e "Qualidade" seriam o mesmo setor para quem escolhe numa lista
    async buscarPorNome(tx: ClientePrisma, nome: string) {
        return tx.setor.findFirst({ where: { nome: { equals: nome, mode: "insensitive" } }, select: camposDoSetor });
    },

    // Lista curta e inteira (o seletor de setor da tela precisa de todos), por isso sem paginação
    async listar(tx: ClientePrisma, situacao: "ATIVO" | "INATIVO" | "TODOS") {
        return tx.setor.findMany({
            where: { desativadoEm: desativadoEmPorSituacao[situacao] },
            select: camposDoSetor,
            orderBy: { nome: "asc" },
        });
    },

    async criar(tx: ClientePrisma, nome: string) {
        return tx.setor.create({ data: { nome }, select: camposDoSetor });
    },

    async renomear(tx: ClientePrisma, id: number, nome: string) {
        return tx.setor.update({ where: { id }, data: { nome }, select: camposDoSetor });
    },
};
