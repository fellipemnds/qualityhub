import { describe, it } from "vitest";
import { chamar } from "../../testes/cenarios.js";
import { type EstadoAlcancavel, levarClassificacaoAte } from "../../testes/levar-ate/classificacao.js";

type Contexto = Awaited<ReturnType<typeof levarClassificacaoAte>>;

const acoes = {
    editar: ({ aprovador, classificacao }: Contexto) =>
        chamar(aprovador, "PATCH", `/classificacoes/${classificacao.id}`, 409, {
            justificativa: "Tentativa de editar a classificação fora do estado permitido.",
        }),
    publicar: ({ aprovador, classificacao }: Contexto) =>
        chamar(aprovador, "POST", `/classificacoes/${classificacao.id}/publicar`, 409),
    excluir: ({ aprovador, classificacao }: Contexto) =>
        chamar(aprovador, "DELETE", `/classificacoes/${classificacao.id}`, 409),
    submeter: ({ aprovador, classificacao }: Contexto) =>
        chamar(aprovador, "POST", `/classificacoes/${classificacao.id}/submeter`, 409),
    aprovar: ({ qa, classificacao }: Contexto) =>
        chamar(qa, "POST", `/classificacoes/${classificacao.id}/decidir`, 409, {
            decisao: "APROVADO",
        }),
    reprovar: ({ qa, classificacao }: Contexto) =>
        chamar(qa, "POST", `/classificacoes/${classificacao.id}/decidir`, 409, {
            decisao: "REPROVADO",
            motivo: "Tentativa de reprovar fora do estado permitido",
        }),
    // Retirar da aprovação (RN-48): só sai de EM_APROVACAO
    retirar: ({ aprovador, classificacao }: Contexto) =>
        chamar(aprovador, "POST", `/classificacoes/${classificacao.id}/retirar`, 409),
};

type NomeAcao = keyof typeof acoes;

const tabela: { estado: EstadoAlcancavel; proibidas: NomeAcao[] }[] = [
    { estado: "RASCUNHO", proibidas: ["submeter", "aprovar", "reprovar", "retirar"] },
    { estado: "ABERTO", proibidas: ["excluir", "publicar", "aprovar", "reprovar", "retirar"] },
    { estado: "EM_APROVACAO", proibidas: ["editar", "excluir", "publicar", "submeter"] },
    { estado: "FECHADO", proibidas: ["editar", "excluir", "publicar", "submeter", "aprovar", "reprovar", "retirar"] },
];

describe("Máquina de estados: Classificação", () => {
    it.each(tabela)("$estado recusa as ações proibidas", async ({ estado, proibidas }) => {
        const contexto = await levarClassificacaoAte(estado);
        for (const acao of proibidas) {
            await acoes[acao](contexto);
        }
    });
});
