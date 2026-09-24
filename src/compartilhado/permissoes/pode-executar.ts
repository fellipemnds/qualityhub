import { atribuicaoRepository } from "../atribuicao/atribuicao.repository.js";
import { Acao } from "../entidades/acoes.js";
import { Ator } from "../entidades/ator.js";
import { ClientePrisma } from "../prisma/tipos.js";
import { catalogo } from "./catalogo.js";

export function temPapel(ator: Ator, acao: Acao): boolean {
    return ator.papeis.some((papel) => catalogo[acao].includes(papel));
}

export async function podeExecutar(
    cliente: ClientePrisma,
    ator: Ator,
    acao: Acao,
    registroId: string,
): Promise<boolean> {
    if (!temPapel(ator, acao)) return false;

    const temAtribuicao =
        (await atribuicaoRepository.ehColaborador(cliente, registroId, ator.id)) ||
        (await atribuicaoRepository.ehAprovador(cliente, registroId, ator.id));

    if (!temAtribuicao) return false;

    return true;
}
