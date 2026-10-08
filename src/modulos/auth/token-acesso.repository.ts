import type { TipoTokenAcesso } from "../../compartilhado/entidades/tipo-token-acesso.js";
import { ValidacaoError } from "../../compartilhado/errors/errors.js";
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

    // Marca só se o token ainda não foi usado nem revogado (B19, F5): dois usos ao mesmo tempo leem o token sem uso, mas o UPDATE do
    // segundo espera o do primeiro e, com o WHERE reavaliado, não acha mais nada para marcar
    async marcarComoUsado(tx: ClientePrisma, id: string) {
        const { count } = await tx.tokenAcesso.updateMany({
            where: { id, usadoEm: null, revogadoEm: null },
            data: {
                usadoEm: new Date(),
            },
        });

        if (count === 0) {
            throw new ValidacaoError("Este token já foi utilizado");
        }
    },
};
