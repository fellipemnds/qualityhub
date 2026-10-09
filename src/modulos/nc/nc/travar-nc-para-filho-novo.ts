import { TransicaoInvalidaError } from "../../../compartilhado/errors/errors.js";
import type { ClientePrisma } from "../../../compartilhado/prisma/tipos.js";
import { registroRepository } from "../../../compartilhado/registro/registro.repository.js";

// Filho novo só nasce com a NC aberta (RN-51, B29): em rascunho, a NC pode nem chegar a existir (Matthew, 2026-10-09);
// em aprovação, retira-se o envio; fechada, reabre-se. A linha da NC fica travada até o fim da transação: o envio da NC,
// que também a trava antes de ler os filhos, espera a criação terminar (e vê o filho novo), ou a criação espera o envio
// (e vê a NC já em aprovação)
export async function travarNCParaFilhoNovo(tx: ClientePrisma, naoConformidadeId: string) {
    if ((await registroRepository.travar(tx, naoConformidadeId)) !== "ABERTO") {
        throw new TransicaoInvalidaError(
            "Só uma NC aberta recebe itens novos: publique, retire o envio ou reabra a NC.",
        );
    }
}
