import type { TipoTokenAcesso } from "../../compartilhado/entidades/tipo-token-acesso.js";
import type { ClientePrisma } from "../../compartilhado/prisma/tipos.js";

export const tokenAcessoRepository = {
    async criar(
        tx: ClientePrisma,
        dados: {
            usuarioId: string;
            tipo: TipoTokenAcesso;
            tokenHash: string;
            expiraEm: Date;
        },
    ) {
        return tx.tokenAcesso.create({ data: dados });
    },

    // Revoga os convites que ainda poderiam ser usados: um estado, e não uma expiração no passado, para não depender do
    // relógio (F5)
    async revogarPendentes(tx: ClientePrisma, usuarioId: string) {
        return tx.tokenAcesso.updateMany({
            where: { usuarioId, usadoEm: null, revogadoEm: null },
            data: { revogadoEm: new Date() },
        });
    },

    async buscarPorHash(tx: ClientePrisma, tokenHash: string) {
        return tx.tokenAcesso.findUnique({
            where: { tokenHash },
        });
    },

    // Marca só se o convite ainda vale, tudo no próprio UPDATE (B19, F5): dois usos ao mesmo tempo, ou um uso e uma
    // revogação, leem o convite valendo, mas o UPDATE do segundo espera o do primeiro e, com o WHERE reavaliado, não acha
    // mais nada. Devolve se marcou
    async marcarComoUsado(tx: ClientePrisma, id: string) {
        const agora = new Date();
        const { count } = await tx.tokenAcesso.updateMany({
            where: { id, usadoEm: null, revogadoEm: null, expiraEm: { gt: agora } },
            data: { usadoEm: agora },
        });
        return count > 0;
    },
};
