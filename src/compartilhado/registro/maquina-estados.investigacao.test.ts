import { describe, it } from "vitest";
import { chamar } from "../../testes/cenarios.js";
import { levarInvestigacaoAte } from "../../testes/levar-ate/investigacao.js";
import type { EstadoRegistro } from "../entidades/estados.js";

type Contexto = Awaited<ReturnType<typeof levarInvestigacaoAte>>;

const acoes = {
    editar: ({ editor, investigacao }: Contexto) =>
        chamar(editor, "PATCH", `/investigacoes/${investigacao.id}`, 409, {
            realProblema: "Tentativa de editar a investigação fora do estado permitido.",
        }),
    publicar: ({ editor, investigacao }: Contexto) =>
        chamar(editor, "POST", `/investigacoes/${investigacao.id}/publicar`, 409),
    excluir: ({ editor, investigacao }: Contexto) => chamar(editor, "DELETE", `/investigacoes/${investigacao.id}`, 409),
    submeter: ({ editor, investigacao }: Contexto) =>
        chamar(editor, "POST", `/investigacoes/${investigacao.id}/submeter`, 409),
    aprovar: ({ aprovador, investigacao }: Contexto) =>
        chamar(aprovador, "POST", `/investigacoes/${investigacao.id}/decidir`, 409, {
            decisao: "APROVADO",
        }),
    reprovar: ({ aprovador, investigacao }: Contexto) =>
        chamar(aprovador, "POST", `/investigacoes/${investigacao.id}/decidir`, 409, {
            decisao: "REPROVADO",
            motivo: "Tentativa de reprovar fora do estado permitido",
        }),
    cancelar: ({ aprovador, investigacao }: Contexto) =>
        chamar(aprovador, "POST", `/investigacoes/${investigacao.id}/cancelar`, 409, {
            motivo: "Tentativa de cancelar fora do estado permitido",
        }),
};

type NomeAcao = keyof typeof acoes;

const tabela: { estado: EstadoRegistro; proibidas: NomeAcao[] }[] = [
    { estado: "RASCUNHO", proibidas: ["submeter", "aprovar", "reprovar"] }, // cancelar fica de fora: hoje o código permite (B12)
    { estado: "ABERTO", proibidas: ["excluir", "publicar", "aprovar", "reprovar"] },
    { estado: "EM_APROVACAO", proibidas: ["editar", "excluir", "publicar", "submeter"] },
    { estado: "FECHADO", proibidas: ["editar", "excluir", "publicar", "submeter", "aprovar", "reprovar", "cancelar"] },
    {
        estado: "CANCELADO",
        proibidas: ["editar", "excluir", "publicar", "submeter", "aprovar", "reprovar", "cancelar"],
    },
];

describe("Máquina de estados: Investigação", () => {
    it.each(tabela)("$estado recusa as ações proibidas", async ({ estado, proibidas }) => {
        const contexto = await levarInvestigacaoAte(estado);
        for (const acao of proibidas) {
            await acoes[acao](contexto);
        }
    });
});
