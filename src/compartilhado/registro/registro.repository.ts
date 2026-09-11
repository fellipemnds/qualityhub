import { EstadoRegistro } from "../entidades/estados.js";
import { TipoRegistro } from "../entidades/tipos-registro.js";
import { ClientePrisma } from "../prisma/tipos.js";

export const registroRepository = {
    async criar(tx: ClientePrisma, dados: {
        tipo: TipoRegistro, criadoPorId: string
    }) {
        return tx.registro.create({
            data: {
                tipo: dados.tipo,
                criadoPorId: dados.criadoPorId
            }
        })
    },

    async buscarPorId(tx: ClientePrisma, id: string) {
        return tx.registro.findUnique({
            where: { id }
        });
    },

    async atualizar(tx: ClientePrisma, id: string, dados: {
        estado?: EstadoRegistro,
        codigo?: string,
        portaoAtual?: number
    }) {
        return tx.registro.update({
            where: { id },
            data: dados
        });
    },

    async excluir(tx: ClientePrisma, id: string) {
        return tx.registro.delete({
            where: { id }
        })
    }
}