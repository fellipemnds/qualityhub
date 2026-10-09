import type { EstadoRegistro } from "../../../compartilhado/entidades/estados.js";
import { TransicaoInvalidaError } from "../../../compartilhado/errors/errors.js";
import type { ClientePrisma } from "../../../compartilhado/prisma/tipos.js";
import { registroRepository } from "../../../compartilhado/registro/registro.repository.js";

// Em rascunho a NC já pode receber filhos (a contenção começa antes de a NC ser formalizada, e o rascunho excluído os
// leva junto); em aprovação, retira-se o envio, e fechada, reabre-se (RN-51, B29)
const RECEBEM_FILHO_NOVO: EstadoRegistro[] = ["RASCUNHO", "ABERTO"];

// Trava a linha da NC até o fim da transação e confere que ela recebe filho novo. O envio da NC, que também a trava
// antes de ler os filhos, espera a criação terminar (e vê o filho novo), ou a criação espera o envio (e vê a NC já em
// aprovação)
export async function travarNCParaFilhoNovo(tx: ClientePrisma, naoConformidadeId: string) {
    const estado = await registroRepository.travar(tx, naoConformidadeId);
    if (estado === null || !RECEBEM_FILHO_NOVO.includes(estado)) {
        throw new TransicaoInvalidaError(
            "Só uma NC em rascunho ou aberta recebe itens novos: retire o envio ou reabra a NC.",
        );
    }
}
