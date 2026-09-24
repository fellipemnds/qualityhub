import type { ClientePrisma } from "../prisma/tipos.js";

export const sequenciaRepository = {
    async buscarELocar(tx: ClientePrisma, prefixo: string, ano: number) {
        const linhas = await tx.$queryRaw<Array<{ ultimoNumero: number }>>`
            SELECT "ultimoNumero" FROM "ContadorSequencia"
            WHERE prefixo = ${prefixo} AND ano = ${ano}
            FOR UPDATE
        `;

        return linhas[0]?.ultimoNumero;
    },

    async criar(tx: ClientePrisma, prefixo: string, ano: number) {
        return tx.contadorSequencia.create({
            data: { prefixo, ano, ultimoNumero: 1 },
        });
    },

    async incrementar(tx: ClientePrisma, prefixo: string, ano: number) {
        return tx.contadorSequencia.update({
            where: {
                prefixo_ano: { prefixo, ano },
            },
            data: {
                ultimoNumero: {
                    increment: 1,
                },
            },
        });
    },
};
