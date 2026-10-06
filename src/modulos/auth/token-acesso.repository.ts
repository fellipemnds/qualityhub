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

    async buscarPorHash(tx: ClientePrisma, tokenHash: string) {
        return tx.tokenAcesso.findUnique({
            where: { tokenHash },
        });
    },

    // Marca só se o token ainda não foi usado (B19): dois usos ao mesmo tempo leem o token sem uso, mas o UPDATE do
    // segundo espera o do primeiro e, com o WHERE reavaliado, não acha mais nada para marcar
    async marcarComoUsado(tx: ClientePrisma, id: string) {
        const { count } = await tx.tokenAcesso.updateMany({
            where: { id, usadoEm: null },
            data: {
                usadoEm: new Date(),
            },
        });

        if (count === 0) {
            throw new ValidacaoError("Este token já foi utilizado");
        }
    },
};
