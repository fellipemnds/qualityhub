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

    // As pessoas ativas do setor: desativar exige nenhuma (RN-44). As inativas ficam: é histórico
    async listarPessoasAtivas(tx: ClientePrisma, id: number) {
        return tx.usuario.findMany({
            where: { setorId: id, desativadoEm: null },
            select: { id: true, nome: true },
            orderBy: { nome: "asc" },
        });
    },

    // Só se ainda estiver ativo: o UPDATE condicional é a trava, e dois desativar ao mesmo tempo gravam uma vez
    async desativar(tx: ClientePrisma, id: number) {
        const { count } = await tx.setor.updateMany({
            where: { id, desativadoEm: null },
            data: { desativadoEm: new Date() },
        });
        return count > 0;
    },

    async reativar(tx: ClientePrisma, id: number) {
        const { count } = await tx.setor.updateMany({
            where: { id, desativadoEm: { not: null } },
            data: { desativadoEm: null },
        });
        return count > 0;
    },

    async renomear(tx: ClientePrisma, id: number, nome: string) {
        return tx.setor.update({ where: { id }, data: { nome }, select: camposDoSetor });
    },
};
