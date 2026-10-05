import type { EstadoRegistro } from "../entidades/estados.js";
import type { TipoRegistro } from "../entidades/tipos-registro.js";
import { TransicaoInvalidaError } from "../errors/errors.js";
import type { ClientePrisma } from "../prisma/tipos.js";

export const registroRepository = {
    async criar(
        tx: ClientePrisma,
        dados: {
            tipo: TipoRegistro;
            criadoPorId: string;
        },
    ) {
        return tx.registro.create({
            data: {
                tipo: dados.tipo,
                criadoPorId: dados.criadoPorId,
            },
        });
    },

    async buscarPorId(tx: ClientePrisma, id: string) {
        return tx.registro.findUnique({
            where: { id },
        });
    },

    // Grava só se o item ainda estiver no estado em que foi lido (B19). Duas transições ao mesmo tempo leem o mesmo
    // estado; o UPDATE da segunda espera o da primeira e, quando ela termina, o PostgreSQL reavalia o WHERE com a
    // linha já gravada: o estado mudou, nada é atualizado, e a segunda recebe 409 (a transação desfaz o resto)
    async atualizar(
        tx: ClientePrisma,
        id: string,
        estadoEsperado: EstadoRegistro,
        dados: {
            estado?: EstadoRegistro;
            codigo?: string;
            portaoAtual?: number;
        },
    ) {
        const [registro] = await tx.registro.updateManyAndReturn({
            where: { id, estado: estadoEsperado },
            data: dados,
        });

        if (registro === undefined) {
            throw new TransicaoInvalidaError(
                "O item mudou enquanto a ação era feita. Atualize a página e tente de novo.",
            );
        }

        return registro;
    },

    async excluir(tx: ClientePrisma, id: string) {
        return tx.registro.delete({
            where: { id },
        });
    },

    async listar(tx: ClientePrisma, filtros: { tipo: TipoRegistro }) {
        return tx.registro.findMany({
            where: filtros,
            include: { naoConformidade: true },
        });
    },
};
