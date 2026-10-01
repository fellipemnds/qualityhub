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
    // Retirar da aprovação (RN-48): só sai de EM_APROVACAO
    retirar: ({ editor, nc }: Contexto) => chamar(editor, "POST", `/nc/${nc.id}/retirar`, 409),
};

type NomeAcao = keyof typeof acoes;

const tabela: { estado: EstadoRegistro; proibidas: NomeAcao[] }[] = [
    // Rascunho só se exclui, não se cancela (B12, RN-06). O submeter entra desde a 8d: a guarda RN-21 roda depois da
    // checagem de estado, e o 409 vem pelo motivo certo
    { estado: "RASCUNHO", proibidas: ["submeter", "aprovar", "reprovar", "reabrir", "cancelar", "retirar"] },
    { estado: "ABERTO", proibidas: ["excluir", "publicar", "aprovar", "reprovar", "reabrir", "retirar"] },
    { estado: "EM_APROVACAO", proibidas: ["editar", "excluir", "publicar", "submeter", "reabrir"] },
    {
        estado: "FECHADO",
        proibidas: ["editar", "excluir", "publicar", "submeter", "aprovar", "reprovar", "cancelar", "retirar"],
    },
    {
        estado: "CANCELADO",
        proibidas: [
            "editar",
            "excluir",
            "publicar",
            "submeter",
            "aprovar",
            "reprovar",
            "cancelar",
            "reabrir",
            "retirar",
        ],
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
