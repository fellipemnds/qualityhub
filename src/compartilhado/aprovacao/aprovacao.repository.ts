import { Decisao, PortaoAprovacao } from "../../generated/prisma/enums.js";
import { ClientePrisma } from "../prisma/tipos.js";

export const aprovacaoRepository = {
    async criar(tx: ClientePrisma, dados: {
        registroId: string
        portao: PortaoAprovacao
        decisao: Decisao
        motivo?: string
        aprovadorId: string
        autoAprovacao: boolean
    }) {
        return tx.aprovacao.create({ data: dados });
    }
}