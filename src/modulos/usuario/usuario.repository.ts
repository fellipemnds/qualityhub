import type { Papel } from "../../compartilhado/entidades/papeis.js";
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

    // Só os ativos: quem saiu não aparece para ninguém escolher
    async listarPessoas(tx: ClientePrisma, filtros: { busca?: string; papel?: Papel; cursor?: string; limit: number }) {
        return tx.usuario.findMany({
            where: {
                desativadoEm: null,
                nome: filtros.busca === undefined ? undefined : { contains: filtros.busca, mode: "insensitive" },
                papeisRecebidos: filtros.papel === undefined ? undefined : { some: { papel: filtros.papel } },
                id: { gt: filtros.cursor },
            },
            select: { id: true, nome: true, setor: { select: { id: true, nome: true } } },
            orderBy: { id: "asc" },
            take: filtros.limit + 1,
        });
    },

    async buscarParaAdmin(tx: ClientePrisma, id: string) {
        return tx.usuario.findUnique({ where: { id }, select: camposParaAdmin });
    },

    async atualizar(tx: ClientePrisma, id: string, dados: { nome?: string; setorId?: number }) {
        return tx.usuario.update({ where: { id }, data: dados, select: camposParaAdmin });
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

    // Soma 1 à versão das sessões: todo token com a versão de antes deixa de valer (B27). O +1 é feito pelo banco, de uma
    // vez: duas derrubadas ao mesmo tempo somam 2, e nenhuma se perde
    async encerrarSessoes(tx: ClientePrisma, id: string) {
        return tx.usuario.update({
            where: { id },
            data: { versaoSessao: { increment: 1 } },
        });
    },

    // Grava a senha e derruba as sessões (soma 1 à versão), só se a pessoa estiver ativa: o UPDATE condicional é a trava
    // da linha do usuário, e vem antes da do convite (F5). Devolve se gravou
    async definirSenha(tx: ClientePrisma, id: string, senhaHash: string) {
        const { count } = await tx.usuario.updateMany({
            where: { id, desativadoEm: null },
            data: { senhaHash, versaoSessao: { increment: 1 } },
        });
        return count > 0;
    },

    // Trava a linha do usuário, só se ele estiver ativo: o UPDATE condicional é a trava (F5), e o count diz se pegou.
    // Sempre o usuário primeiro, e nunca SELECT ... FOR UPDATE (com ele, dois ADMINs agindo um no outro se travam)
    async travarAtivo(tx: ClientePrisma, id: string) {
        const { count } = await tx.usuario.updateMany({
            where: { id, desativadoEm: null },
            data: { atualizadoEm: new Date() },
        });
        return count > 0;
    },

    // Inativar também derruba as sessões abertas: o autenticar recusa o inativo, e a versão nova garante que um token
    // antigo não volte a valer se a pessoa for reativada. Só se ainda estiver ativo: o UPDATE condicional é a trava, e
    // dois inativar ao mesmo tempo gravam uma vez só (F5)
    async inativar(tx: ClientePrisma, id: string) {
        const { count } = await tx.usuario.updateMany({
            where: { id, desativadoEm: null },
            data: { desativadoEm: new Date(), versaoSessao: { increment: 1 } },
        });
        return count > 0;
    },

    async reativar(tx: ClientePrisma, id: string) {
        return tx.usuario.update({ where: { id }, data: { desativadoEm: null }, select: camposParaAdmin });
    },

    async contarOutrosAdminsAtivos(tx: ClientePrisma, usuarioId: string) {
        return tx.usuario.count({
            where: {
                id: { not: usuarioId },
                desativadoEm: null,
                papeisRecebidos: {
                    some: { papel: "ADMIN" },
                },
            },
        });
    },
};
