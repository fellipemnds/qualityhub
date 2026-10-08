import type { TelaInicial } from "../../compartilhado/entidades/tela-inicial.js";
import type { ClientePrisma } from "../../compartilhado/prisma/tipos.js";
import type { Prisma } from "../../generated/prisma/client.js";

// O que o ADMIN vê de cada usuário (lista e detalhe): sem a senha nem as datas internas da sessão
const camposParaAdmin = {
    id: true,
    nome: true,
    email: true,
    criadoEm: true,
    desativadoEm: true,
    setor: { select: { id: true, nome: true } },
    papeisRecebidos: { select: { papel: true }, orderBy: { papel: "asc" } },
} satisfies Prisma.UsuarioSelect;

const desativadoEmPorSituacao = { ATIVO: null, INATIVO: { not: null } } as const;

export const usuarioRepository = {
    // Uma página com um item a mais, para o paginar() saber se há próxima
    async listar(
        tx: ClientePrisma,
        filtros: { busca?: string; situacao?: "ATIVO" | "INATIVO"; cursor?: string; limit: number },
    ) {
        const contem = { contains: filtros.busca, mode: "insensitive" } as const;

        return tx.usuario.findMany({
            where: {
                OR: filtros.busca === undefined ? undefined : [{ nome: contem }, { email: contem }],
                desativadoEm: filtros.situacao && desativadoEmPorSituacao[filtros.situacao],
                id: { gt: filtros.cursor },
            },
            select: camposParaAdmin,
            orderBy: { id: "asc" },
            take: filtros.limit + 1,
        });
    },

    async buscarParaAdmin(tx: ClientePrisma, id: string) {
        return tx.usuario.findUnique({ where: { id }, select: camposParaAdmin });
    },

    async buscarPorEmail(tx: ClientePrisma, email: string) {
        return tx.usuario.findUnique({
            where: { email },
            include: { papeisRecebidos: true },
        });
    },

    async buscarPorId(tx: ClientePrisma, id: string) {
        return tx.usuario.findUnique({
            where: { id },
            include: { papeisRecebidos: true },
        });
    },

    async criar(tx: ClientePrisma, dados: { nome: string; email: string; setorId: number }) {
        return tx.usuario.create({ data: dados });
    },

    // Só o que a pessoa pode ver de si mesma: sem a senha, sem as datas internas
    async buscarPerfil(tx: ClientePrisma, id: string) {
        return tx.usuario.findUnique({
            where: { id },
            select: {
                id: true,
                nome: true,
                email: true,
                telaInicial: true,
                setor: { select: { id: true, nome: true } },
                papeisRecebidos: { select: { papel: true } },
            },
        });
    },

    async alterarTelaInicial(tx: ClientePrisma, id: string, telaInicial: TelaInicial | null) {
        return tx.usuario.update({
            where: { id },
            data: { telaInicial },
        });
    },

    async encerrarSessoes(tx: ClientePrisma, id: string) {
        return tx.usuario.update({
            where: { id },
            data: { sessaoValidaDesde: new Date() },
        });
    },

    async definirSenha(tx: ClientePrisma, id: string, senhaHash: string) {
        return tx.usuario.update({
            where: { id },
            data: { senhaHash },
        });
    },
};
