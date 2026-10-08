import type { Decisao, PortaoAprovacao } from "../../generated/prisma/enums.js";
import type { ClientePrisma } from "../prisma/tipos.js";

export const aprovacaoRepository = {
    async criar(
        tx: ClientePrisma,
        dados: {
            registroId: string;
            portao: PortaoAprovacao;
            decisao: Decisao;
            motivo?: string;
            aprovadorId: string;
            autoAprovacao: boolean;
        },
    ) {
        return tx.aprovacao.create({ data: dados });
    },

    // O motivo da última decisão, se ela foi uma reprovação (L7, esquema §4.5): é o que o colaborador tem de corrigir.
    // Aprovado depois, a última decisão é a aprovação, e não há o que mostrar
    async ultimoMotivoReprovacao(cliente: ClientePrisma, registroId: string) {
        const ultima = await cliente.aprovacao.findFirst({
            where: { registroId },
            orderBy: [{ decididoEm: "desc" }, { id: "desc" }],
        });

        return ultima?.decisao === "REPROVADO" ? (ultima.motivo ?? null) : null;
    },
};
