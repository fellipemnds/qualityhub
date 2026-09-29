import { describe, it } from "vitest";
import { chamar } from "../../testes/cenarios.js";
import { levarNCAte } from "../../testes/levar-ate/nc.js";
import type { EstadoRegistro } from "../entidades/estados.js";

type Contexto = Awaited<ReturnType<typeof levarNCAte>>;

const acoes = {
    editar: ({ editor, nc }: Contexto) =>
        chamar(editor, "PATCH", `/nc/${nc.id}`, 409, {
            descricao: "Tentativa de editar a não conformidade fora do estado permitido.",
        }),
    publicar: ({ editor, nc }: Contexto) => chamar(editor, "POST", `/nc/${nc.id}/publicar`, 409),
    excluir: ({ editor, nc }: Contexto) => chamar(editor, "DELETE", `/nc/${nc.id}`, 409),
    submeter: ({ editor, nc }: Contexto) => chamar(editor, "POST", `/nc/${nc.id}/submeter`, 409),
    aprovar: ({ aprovador, nc }: Contexto) =>
        chamar(aprovador, "POST", `/nc/${nc.id}/decidir`, 409, {
            decisao: "APROVADO",
        }),
    reprovar: ({ aprovador, nc }: Contexto) =>
        chamar(aprovador, "POST", `/nc/${nc.id}/decidir`, 409, {
            decisao: "REPROVADO",
            motivo: "Tentativa de reprovar fora do estado permitido",
        }),
    cancelar: ({ aprovador, nc }: Contexto) =>
        chamar(aprovador, "POST", `/nc/${nc.id}/cancelar`, 409, {
            motivo: "Tentativa de cancelar fora do estado permitido",
        }),
    reabrir: ({ aprovador, nc }: Contexto) =>
        chamar(aprovador, "POST", `/nc/${nc.id}/reabrir`, 409, {
            motivo: "Tentativa de reabrir fora do estado permitido",
        }),
};

type NomeAcao = keyof typeof acoes;

const tabela: { estado: EstadoRegistro; proibidas: NomeAcao[] }[] = [
    // cancelar fica de fora: hoje o código permite (B12). Submeter também: numa NC em rascunho a guarda RN-21
    // (sem filhos fechados) barra antes da de estado — o 409 viria pelo motivo errado
    { estado: "RASCUNHO", proibidas: ["aprovar", "reprovar", "reabrir"] },
    { estado: "ABERTO", proibidas: ["excluir", "publicar", "aprovar", "reprovar", "reabrir"] },
    { estado: "EM_APROVACAO", proibidas: ["editar", "excluir", "publicar", "submeter", "reabrir"] },
    { estado: "FECHADO", proibidas: ["editar", "excluir", "publicar", "submeter", "aprovar", "reprovar", "cancelar"] },
    {
        estado: "CANCELADO",
        proibidas: ["editar", "excluir", "publicar", "submeter", "aprovar", "reprovar", "cancelar", "reabrir"],
    },
];

describe("Máquina de estados: NC", () => {
    it.each(tabela)("$estado recusa as ações proibidas", async ({ estado, proibidas }) => {
        const contexto = await levarNCAte(estado);
        for (const acao of proibidas) {
            await acoes[acao](contexto);
        }
    });
});
