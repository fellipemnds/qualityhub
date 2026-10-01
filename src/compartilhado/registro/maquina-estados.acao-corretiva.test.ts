import { describe, it } from "vitest";
import { chamar } from "../../testes/cenarios.js";
import { type DegrauAcaoCorretiva, levarAcaoCorretivaAte } from "../../testes/levar-ate/acao-corretiva.js";

type Contexto = Awaited<ReturnType<typeof levarAcaoCorretivaAte>>;

const acoes = {
    editar: ({ editor, acao }: Contexto) =>
        chamar(editor, "PATCH", `/acoes-corretivas/${acao.id}`, 409, {
            descricao: "Tentativa de editar a ação corretiva fora do estado permitido.",
        }),
    publicar: ({ editor, acao }: Contexto) => chamar(editor, "POST", `/acoes-corretivas/${acao.id}/publicar`, 409),
    excluir: ({ editor, acao }: Contexto) => chamar(editor, "DELETE", `/acoes-corretivas/${acao.id}`, 409),
    submeter: ({ editor, acao }: Contexto) => chamar(editor, "POST", `/acoes-corretivas/${acao.id}/submeter`, 409),
    aprovar: ({ aprovador, acao }: Contexto) =>
        chamar(aprovador, "POST", `/acoes-corretivas/${acao.id}/decidir`, 409, {
            decisao: "APROVADO",
        }),
    reprovar: ({ aprovador, acao }: Contexto) =>
        chamar(aprovador, "POST", `/acoes-corretivas/${acao.id}/decidir`, 409, {
            decisao: "REPROVADO",
            motivo: "Tentativa de reprovar fora do estado permitido",
        }),
    cancelar: ({ aprovador, acao }: Contexto) =>
        chamar(aprovador, "POST", `/acoes-corretivas/${acao.id}/cancelar`, 409, {
            motivo: "Tentativa de cancelar fora do estado permitido",
        }),
    finalizar: ({ editor, acao }: Contexto) =>
        chamar(editor, "POST", `/acoes-corretivas/${acao.id}/finalizar-execucao`, 409, {
            diasParaVerificar: 30,
        }),
    // Retirar da aprovação (RN-48): só sai de EM_APROVACAO
    retirar: ({ editor, acao }: Contexto) => chamar(editor, "POST", `/acoes-corretivas/${acao.id}/retirar`, 409),
};

type NomeAcao = keyof typeof acoes;

const tabela: { estado: DegrauAcaoCorretiva; proibidas: NomeAcao[] }[] = [
    // Rascunho só se exclui, não se cancela (B12, RN-06)
    { estado: "RASCUNHO", proibidas: ["submeter", "aprovar", "reprovar", "finalizar", "cancelar", "retirar"] },
    // O ABERTO do levarAcaoCorretivaAte é o de plano nunca submetido: finalizar exige plano aprovado (B1)
    { estado: "ABERTO", proibidas: ["excluir", "publicar", "aprovar", "reprovar", "finalizar", "retirar"] },
    { estado: "EM_APROVACAO", proibidas: ["editar", "excluir", "publicar", "submeter", "finalizar"] },
    // ABERTO com o plano aprovado: o plano travado (o "editar" muda a descrição) e nada mais a submeter (B2)
    {
        estado: "PLANO_APROVADO",
        proibidas: ["editar", "excluir", "publicar", "submeter", "aprovar", "reprovar", "retirar"],
    },
    {
        estado: "FECHADO",
        proibidas: [
            "editar",
            "excluir",
            "publicar",
            "submeter",
            "aprovar",
            "reprovar",
            "cancelar",
            "finalizar",
            "retirar",
        ],
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
            "finalizar",
            "retirar",
        ],
    },
];

describe("Máquina de estados: Ação corretiva", () => {
    it.each(tabela)("$estado recusa as ações proibidas", async ({ estado, proibidas }) => {
        const contexto = await levarAcaoCorretivaAte(estado);
        for (const acao of proibidas) {
            await acoes[acao](contexto);
        }
    });
});
