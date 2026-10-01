import { describe, it } from "vitest";
import { chamar } from "../../testes/cenarios.js";
import { levarContencaoAte } from "../../testes/levar-ate/contencao.js";
import type { EstadoRegistro } from "../entidades/estados.js";

type Contexto = Awaited<ReturnType<typeof levarContencaoAte>>;

const acoes = {
    editar: ({ editor, contencao }: Contexto) =>
        chamar(editor, "PATCH", `/contencoes/${contencao.id}`, 409, {
            descricao: "Tentativa de editar a contenção fora do estado permitido.",
        }),
    publicar: ({ editor, contencao }: Contexto) => chamar(editor, "POST", `/contencoes/${contencao.id}/publicar`, 409),
    excluir: ({ editor, contencao }: Contexto) => chamar(editor, "DELETE", `/contencoes/${contencao.id}`, 409),
    submeter: ({ editor, contencao }: Contexto) => chamar(editor, "POST", `/contencoes/${contencao.id}/submeter`, 409),
    aprovar: ({ aprovador, contencao }: Contexto) =>
        chamar(aprovador, "POST", `/contencoes/${contencao.id}/decidir`, 409, {
            decisao: "APROVADO",
        }),
    reprovar: ({ aprovador, contencao }: Contexto) =>
        chamar(aprovador, "POST", `/contencoes/${contencao.id}/decidir`, 409, {
            decisao: "REPROVADO",
            motivo: "Tentativa de reprovar fora do estado permitido",
        }),
    cancelar: ({ aprovador, contencao }: Contexto) =>
        chamar(aprovador, "POST", `/contencoes/${contencao.id}/cancelar`, 409, {
            motivo: "Tentativa de cancelar fora do estado permitido",
        }),
    // Retirar da aprovação (RN-48): só sai de EM_APROVACAO
    retirar: ({ editor, contencao }: Contexto) => chamar(editor, "POST", `/contencoes/${contencao.id}/retirar`, 409),
};

type NomeAcao = keyof typeof acoes;

const tabela: { estado: EstadoRegistro; proibidas: NomeAcao[] }[] = [
    // Rascunho só se exclui, não se cancela (B12, RN-06)
    { estado: "RASCUNHO", proibidas: ["submeter", "aprovar", "reprovar", "cancelar", "retirar"] },
    { estado: "ABERTO", proibidas: ["excluir", "publicar", "aprovar", "reprovar", "retirar"] },
    { estado: "EM_APROVACAO", proibidas: ["editar", "excluir", "publicar", "submeter"] },
    {
        estado: "FECHADO",
        proibidas: ["editar", "excluir", "publicar", "submeter", "aprovar", "reprovar", "cancelar", "retirar"],
    },
    {
        estado: "CANCELADO",
        proibidas: ["editar", "excluir", "publicar", "submeter", "aprovar", "reprovar", "cancelar", "retirar"],
    },
];

describe("Máquina de estados: Contenção", () => {
    it.each(tabela)("$estado recusa as ações proibidas", async ({ estado, proibidas }) => {
        const contexto = await levarContencaoAte(estado);
        for (const acao of proibidas) {
            await acoes[acao](contexto);
        }
    });
});
