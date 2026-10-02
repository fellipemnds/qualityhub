import { describe, it } from "vitest";
import { chamar, perfisDeFora } from "../../testes/cenarios.js";
import { type DegrauAcaoCorretiva, levarAcaoCorretivaAte } from "../../testes/levar-ate/acao-corretiva.js";

// Atribuições do levarAcaoCorretivaAte: o editor criou (colaborador), o aprovador é o designado; qa e gerente não
// estão na ação.
async function preparar(estado: DegrauAcaoCorretiva) {
    return { ...(await levarAcaoCorretivaAte(estado)), ...(await perfisDeFora()) };
}

type Contexto = Awaited<ReturnType<typeof preparar>>;
type Quem = "editor" | "aprovador" | "qa" | "gerente" | "admin" | "visualizador" | "semPapel";

const acoes = {
    ver: (contexto: Contexto, quem: Quem) =>
        chamar(contexto[quem], "GET", `/acoes-corretivas/${contexto.acao.id}`, 403),
    criar: (contexto: Contexto, quem: Quem) =>
        chamar(contexto[quem], "POST", `/nc/${contexto.nc.id}/acoes-corretivas`, 403, {
            investigacaoId: contexto.investigacao.id,
        }),
    editar: (contexto: Contexto, quem: Quem) =>
        chamar(contexto[quem], "PATCH", `/acoes-corretivas/${contexto.acao.id}`, 403, {
            descricao: "Tentativa de editar a ação corretiva sem permissão.",
        }),
    excluir: (contexto: Contexto, quem: Quem) =>
        chamar(contexto[quem], "DELETE", `/acoes-corretivas/${contexto.acao.id}`, 403),
    publicar: (contexto: Contexto, quem: Quem) =>
        chamar(contexto[quem], "POST", `/acoes-corretivas/${contexto.acao.id}/publicar`, 403),
    submeter: (contexto: Contexto, quem: Quem) =>
        chamar(contexto[quem], "POST", `/acoes-corretivas/${contexto.acao.id}/submeter`, 403),
    decidir: (contexto: Contexto, quem: Quem) =>
        chamar(contexto[quem], "POST", `/acoes-corretivas/${contexto.acao.id}/decidir`, 403, {
            decisao: "APROVADO",
        }),
    cancelar: (contexto: Contexto, quem: Quem) =>
        chamar(contexto[quem], "POST", `/acoes-corretivas/${contexto.acao.id}/cancelar`, 403, {
            motivo: "Tentativa de cancelar sem permissão",
        }),
    finalizar: (contexto: Contexto, quem: Quem) =>
        chamar(contexto[quem], "POST", `/acoes-corretivas/${contexto.acao.id}/finalizar-execucao`, 403, {
            diasParaVerificar: 30,
        }),
    retirar: (contexto: Contexto, quem: Quem) =>
        chamar(contexto[quem], "POST", `/acoes-corretivas/${contexto.acao.id}/retirar`, 403),
};

type NomeAcao = keyof typeof acoes;

const tabela: { estado: DegrauAcaoCorretiva; recusas: [NomeAcao, Quem[]][] }[] = [
    {
        estado: "RASCUNHO",
        recusas: [
            ["ver", ["semPapel", "admin"]],
            ["criar", ["aprovador", "visualizador", "admin"]],
            ["editar", ["aprovador", "visualizador", "qa", "gerente"]],
            ["excluir", ["aprovador", "qa", "gerente"]],
            ["publicar", ["aprovador", "qa", "gerente"]],
        ],
    },
    {
        estado: "ABERTO",
        recusas: [
            ["submeter", ["aprovador", "qa", "gerente"]],
            ["cancelar", ["editor", "qa"]],
        ],
    },
    {
        estado: "EM_APROVACAO",
        recusas: [
            // Retirar (RN-48): quem não pode submeter também não pode retirar
            ["retirar", ["aprovador", "qa", "gerente"]],
            // O qa e o gerente têm o papel APROVADOR, mas não são o aprovador designado
            ["decidir", ["editor", "admin", "qa", "gerente"]],
            ["cancelar", ["editor", "qa"]],
        ],
    },
    {
        estado: "PLANO_APROVADO",
        // Finalizar é do colaborador com papel EDITOR/GERENTE: o qa e o gerente têm o papel, mas não estão na ação
        recusas: [["finalizar", ["aprovador", "qa", "gerente", "admin", "visualizador"]]],
    },
];

describe("Permissões: Ação corretiva", () => {
    it.each(tabela)("$estado recusa quem não tem permissão", async ({ estado, recusas }) => {
        const contexto = await preparar(estado);
        for (const [acao, pessoas] of recusas) {
            for (const quem of pessoas) {
                await acoes[acao](contexto, quem);
            }
        }
    });
});
