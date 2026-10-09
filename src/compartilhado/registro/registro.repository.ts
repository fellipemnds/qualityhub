import type { EstadoRegistro } from "../entidades/estados.js";
import type { TipoRegistro } from "../entidades/tipos-registro.js";
import { TransicaoInvalidaError } from "../errors/errors.js";

const ITEM_MUDOU = "O item mudou enquanto a ação era feita. Atualize a página e tente de novo.";

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

    // Trava a linha do item até o fim da transação e devolve o estado, lido já com a trava (A7). Para as regras que
    // conferem outras linhas (os filhos da NC, as ações da investigação): os dois lados da corrida travam a mesma linha
    // antes de ler, e quem chega depois espera e lê o que o primeiro gravou. A trava do B19 não basta aqui: ela só age
    // no UPDATE, depois da conferência. FOR NO KEY UPDATE, e não FOR UPDATE: é a mesma trava do UPDATE, que não segura
    // quem só aponta para esta linha (a chave estrangeira de um filho ou de uma atribuição sendo gravada)
    async travar(tx: ClientePrisma, id: string) {
        const [linha] = await tx.$queryRaw<{ estado: EstadoRegistro }[]>`
            SELECT "estado" FROM "Registro" WHERE "id" = ${id} FOR NO KEY UPDATE`;
        return linha?.estado ?? null;
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
        // O atualizadoEm vai explícito: o @updatedAt do Prisma não é preenchido com os dados vazios, e a edição grava assim,
        // só para tocar o Registro (B24)
        const [registro] = await tx.registro.updateManyAndReturn({
            where: { id, estado: estadoEsperado },
            data: { ...dados, atualizadoEm: new Date() },
        });

        if (registro === undefined) {
            throw new TransicaoInvalidaError(ITEM_MUDOU);
        }

        return registro;
    },

    // Apaga só se o item ainda estiver no estado em que foi lido, pelo mesmo motivo do atualizar (B19)
    async excluir(tx: ClientePrisma, id: string, estadoEsperado: EstadoRegistro) {
        const { count } = await tx.registro.deleteMany({
            where: { id, estado: estadoEsperado },
        });

        if (count === 0) {
            throw new TransicaoInvalidaError(ITEM_MUDOU);
        }
    },

    async listar(tx: ClientePrisma, filtros: { tipo: TipoRegistro }) {
        return tx.registro.findMany({
            where: filtros,
            include: { naoConformidade: true },
        });
    },
};
