import { describe, it } from "vitest";
import { chamar } from "../../testes/cenarios.js";
import { levarAcaoCorretivaAte } from "../../testes/levar-ate/acao-corretiva.js";
import type { EstadoRegistro } from "../entidades/estados.js";

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
};

type NomeAcao = keyof typeof acoes;

const tabela: { estado: EstadoRegistro; proibidas: NomeAcao[] }[] = [
    { estado: "RASCUNHO", proibidas: ["submeter", "aprovar", "reprovar", "finalizar"] }, // cancelar fica de fora: hoje o código permite (B12)
    { estado: "ABERTO", proibidas: ["excluir", "publicar", "aprovar", "reprovar"] }, // finalizar fica de fora: hoje passa sem plano aprovado (B1)
    { estado: "EM_APROVACAO", proibidas: ["editar", "excluir", "publicar", "submeter", "finalizar"] },
    {
        estado: "FECHADO",
        proibidas: ["editar", "excluir", "publicar", "submeter", "aprovar", "reprovar", "cancelar", "finalizar"],
    },
    {
        estado: "CANCELADO",
        proibidas: ["editar", "excluir", "publicar", "submeter", "aprovar", "reprovar", "cancelar", "finalizar"],
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
