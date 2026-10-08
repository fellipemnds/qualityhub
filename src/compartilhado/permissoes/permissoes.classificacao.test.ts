import { describe, it } from "vitest";
import { chamar, perfisDeFora } from "../../testes/cenarios.js";
import { type EstadoAlcancavel, levarClassificacaoAte } from "../../testes/levar-ate/classificacao.js";

// Atribuições do levarClassificacaoAte: o aprovador criou (colaborador), o qa é o designado; editor e gerente
// não estão no item.
async function preparar(estado: EstadoAlcancavel) {
    return { ...(await levarClassificacaoAte(estado)), ...(await perfisDeFora()) };
}

type Contexto = Awaited<ReturnType<typeof preparar>>;
type Quem = "editor" | "aprovador" | "qa" | "gerente" | "admin" | "visualizador" | "semPapel";

const acoes = {
    ver: (contexto: Contexto, quem: Quem) =>
        chamar(contexto[quem], "GET", `/api/classificacoes/${contexto.classificacao.id}`, 403),
    criar: (contexto: Contexto, quem: Quem) =>
        chamar(contexto[quem], "POST", `/api/nc/${contexto.nc.id}/classificacoes`, 403, {
            valor: "MENOR",
            justificativa: "Tentativa de criar uma classificação sem permissão.",
        }),
    editar: (contexto: Contexto, quem: Quem) =>
        chamar(contexto[quem], "PATCH", `/api/classificacoes/${contexto.classificacao.id}`, 403, {
            justificativa: "Tentativa de editar a classificação sem permissão.",
        }),
    excluir: (contexto: Contexto, quem: Quem) =>
        chamar(contexto[quem], "DELETE", `/api/classificacoes/${contexto.classificacao.id}`, 403),
    publicar: (contexto: Contexto, quem: Quem) =>
        chamar(contexto[quem], "POST", `/api/classificacoes/${contexto.classificacao.id}/publicar`, 403),
    submeter: (contexto: Contexto, quem: Quem) =>
        chamar(contexto[quem], "POST", `/api/classificacoes/${contexto.classificacao.id}/submeter`, 403),
    decidir: (contexto: Contexto, quem: Quem) =>
        chamar(contexto[quem], "POST", `/api/classificacoes/${contexto.classificacao.id}/decidir`, 403, {
            decisao: "APROVADO",
        }),
    retirar: (contexto: Contexto, quem: Quem) =>
        chamar(contexto[quem], "POST", `/api/classificacoes/${contexto.classificacao.id}/retirar`, 403),
};

type NomeAcao = keyof typeof acoes;

// RN-20: o editor não classifica — é recusado em tudo, mesmo sendo EDITOR. O qa fica de fora de excluir,
// publicar e submeter: como aprovador designado, o podeExecutar aceita (colaborador ou aprovador).
const tabela: { estado: EstadoAlcancavel; recusas: [NomeAcao, Quem[]][] }[] = [
    {
        estado: "RASCUNHO",
        recusas: [
            ["ver", ["semPapel", "admin"]],
            ["criar", ["editor", "visualizador", "admin"]],
            ["editar", ["editor", "visualizador", "qa", "gerente"]],
            ["excluir", ["editor", "gerente"]],
            ["publicar", ["editor", "gerente"]],
        ],
    },
    {
        estado: "ABERTO",
        recusas: [["submeter", ["editor", "gerente"]]],
    },
    {
        estado: "EM_APROVACAO",
        recusas: [
            // Retirar (RN-48): quem não pode submeter também não pode retirar
            ["retirar", ["editor", "gerente"]],
            // O aprovador criou e tem o papel APROVADOR, mas o designado é o qa
            ["decidir", ["editor", "admin", "aprovador", "gerente"]],
        ],
    },
];

describe("Permissões: Classificação", () => {
    it.each(tabela)("$estado recusa quem não tem permissão", async ({ estado, recusas }) => {
        const contexto = await preparar(estado);
        for (const [acao, pessoas] of recusas) {
            for (const quem of pessoas) {
                await acoes[acao](contexto, quem);
            }
        }
    });
});
