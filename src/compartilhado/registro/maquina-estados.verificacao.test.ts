import { describe, it } from "vitest";
import { chamar } from "../../testes/cenarios.js";
import { type EstadoAlcancavel, levarVerificacaoAte } from "../../testes/levar-ate/verificacao.js";

type Contexto = Awaited<ReturnType<typeof levarVerificacaoAte>>;

// Excluir não entra: verificação nunca é rascunho, e a rota DELETE /verificacoes/:id não existe (B8)
const acoes = {
    editar: ({ aprovador, verificacao }: Contexto) =>
        chamar(aprovador, "PATCH", `/verificacoes/${verificacao.id}`, 409, {
            conclusao: "Tentativa de editar a verificação fora do estado permitido.",
        }),
    concluir: ({ aprovador, verificacao }: Contexto) =>
        chamar(aprovador, "POST", `/verificacoes/${verificacao.id}/concluir`, 409),
    cancelar: ({ aprovador, verificacao }: Contexto) =>
        chamar(aprovador, "POST", `/verificacoes/${verificacao.id}/cancelar`, 409, {
            motivo: "Tentativa de cancelar fora do estado permitido",
        }),
};

type NomeAcao = keyof typeof acoes;

// ABERTO não tem linha: ali as três ações são permitidas
const tabela: { estado: EstadoAlcancavel; proibidas: NomeAcao[] }[] = [
    { estado: "FECHADO", proibidas: ["editar", "concluir", "cancelar"] },
    { estado: "CANCELADO", proibidas: ["editar", "concluir", "cancelar"] },
];

describe("Máquina de estados: Verificação", () => {
    it.each(tabela)("$estado recusa as ações proibidas", async ({ estado, proibidas }) => {
        const contexto = await levarVerificacaoAte(estado);
        for (const acao of proibidas) {
            await acoes[acao](contexto);
        }
    });
});
