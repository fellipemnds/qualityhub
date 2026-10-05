import type { Papel } from "../../compartilhado/entidades/papeis.js";
import { TelaInicial } from "../../compartilhado/entidades/tela-inicial.js";

// Quem acessa cada tela (fluxo-app.md §2.1). A ordem é a do menu
const PAPEIS_POR_TELA: Record<TelaInicial, Papel[]> = {
    PENDENCIAS: ["EDITOR", "APROVADOR", "GERENTE"],
    NCS: ["EDITOR", "APROVADOR", "GERENTE", "VISUALIZADOR"],
    RELATORIOS: ["GERENTE"],
    USUARIOS: ["ADMIN"],
};

// O padrão é o do primeiro papel da lista que a pessoa tiver (fluxo-app.md §3)
const PADRAO_POR_PAPEL: [Papel[], TelaInicial][] = [
    [["EDITOR", "APROVADOR"], TelaInicial.PENDENCIAS],
    [["GERENTE"], TelaInicial.RELATORIOS],
    [["VISUALIZADOR"], TelaInicial.NCS],
    [["ADMIN"], TelaInicial.USUARIOS],
];

// A tela em que a pessoa começa e as que ela pode escolher. A preferência só vale enquanto os papéis a permitem: quem
// perde o papel da tela escolhida volta para o padrão. Pensado para o MVP de NCs; com outros módulos, rever
export function telaInicial(papeis: Papel[], preferencia: TelaInicial | null) {
    const tem = (lista: Papel[]) => lista.some((papel) => papeis.includes(papel));

    const telasIniciais = Object.values(TelaInicial).filter((tela) => tem(PAPEIS_POR_TELA[tela]));
    const padrao = PADRAO_POR_PAPEL.find(([lista]) => tem(lista))?.[1] ?? null;

    return {
        telaInicial: preferencia !== null && telasIniciais.includes(preferencia) ? preferencia : padrao,
        telasIniciais,
    };
}
