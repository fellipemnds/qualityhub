import { Papel } from "../entidades/papeis.js";
import { Acao } from "../entidades/acoes.js";
import { catalogo } from "./catalogo.js";
import { atribuicaoRepository } from "../atribuicao/atribuicao.repository.js";
import { ClientePrisma } from "../prisma/tipos.js";

export function temPapel(ator: { id: string, papeis: Papel[] }, acao: Acao): boolean {
    return ator.papeis.some((papel) => catalogo[acao].includes(papel));
};

export async function podeExecutar(cliente: ClientePrisma, ator: { id: string, papeis: Papel[] }, acao: Acao, registroId: string): Promise<boolean> {
    if (!temPapel(ator, acao)) return false;

    const temAtribuicao =
        await atribuicaoRepository.ehColaborador(cliente, registroId, ator.id) ||
        await atribuicaoRepository.ehAprovador(cliente, registroId, ator.id);

    if (!temAtribuicao) return false;

    return true;
};