import type { ClientePrisma } from "../prisma/tipos.js";

export const sequenciaRepository = {
    // Cria o contador com 1 ou soma 1 ao existente, num comando só: o banco o executa de uma vez, sem intervalo entre
    // ler e escrever. O SELECT ... FOR UPDATE de antes só travava uma linha que já existisse — no primeiro código do
    // ano, as publicações simultâneas tentavam criar o mesmo contador e davam 500 (B15)
    async proximoNumero(tx: ClientePrisma, prefixo: string, ano: number) {
        const linhas = await tx.$queryRaw<Array<{ ultimoNumero: number }>>`
            INSERT INTO "ContadorSequencia" (prefixo, ano, "ultimoNumero")
            VALUES (${prefixo}, ${ano}, 1)
            ON CONFLICT (prefixo, ano)
            DO UPDATE SET "ultimoNumero" = "ContadorSequencia"."ultimoNumero" + 1
            RETURNING "ultimoNumero"
        `;

        // O RETURNING devolve sempre a linha criada ou atualizada; sem ela, algo saiu muito errado no banco
        const [linha] = linhas;
        if (linha === undefined) throw new Error(`Contador ${prefixo}-${ano} não foi criado nem incrementado.`);

        return linha.ultimoNumero;
    },
};
