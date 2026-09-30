import { describe, it } from "vitest";
import { chamar, perfisDeFora } from "../../testes/cenarios.js";
import { levarInvestigacaoAte } from "../../testes/levar-ate/investigacao.js";
import type { EstadoRegistro } from "../entidades/estados.js";

// Atribuições do levarInvestigacaoAte: o editor criou (colaborador), o aprovador é o designado; qa e gerente não
// estão no item.
async function preparar(estado: EstadoRegistro) {
    return { ...(await levarInvestigacaoAte(estado)), ...(await perfisDeFora()) };
}

type Contexto = Awaited<ReturnType<typeof preparar>>;
type Quem = "editor" | "aprovador" | "qa" | "gerente" | "admin" | "visualizador" | "semPapel";

const acoes = {
    ver: (contexto: Contexto, quem: Quem) =>
        chamar(contexto[quem], "GET", `/investigacoes/${contexto.investigacao.id}`, 403),
    criar: (contexto: Contexto, quem: Quem) =>
        chamar(contexto[quem], "POST", `/nc/${contexto.nc.id}/investigacoes`, 403, {
            realProblema: "Tentativa de criar uma investigação sem permissão.",
        }),
    editar: (contexto: Contexto, quem: Quem) =>
        chamar(contexto[quem], "PATCH", `/investigacoes/${contexto.investigacao.id}`, 403, {
            realProblema: "Tentativa de editar a investigação sem permissão.",
        }),
    excluir: (contexto: Contexto, quem: Quem) =>
        chamar(contexto[quem], "DELETE", `/investigacoes/${contexto.investigacao.id}`, 403),
    publicar: (contexto: Contexto, quem: Quem) =>
        chamar(contexto[quem], "POST", `/investigacoes/${contexto.investigacao.id}/publicar`, 403),
    submeter: (contexto: Contexto, quem: Quem) =>
        chamar(contexto[quem], "POST", `/investigacoes/${contexto.investigacao.id}/submeter`, 403),
    decidir: (contexto: Contexto, quem: Quem) =>
        chamar(contexto[quem], "POST", `/investigacoes/${contexto.investigacao.id}/decidir`, 403, {
            decisao: "APROVADO",
        }),
    cancelar: (contexto: Contexto, quem: Quem) =>
        chamar(contexto[quem], "POST", `/investigacoes/${contexto.investigacao.id}/cancelar`, 403, {
            motivo: "Tentativa de cancelar sem permissão",
        }),
};

type NomeAcao = keyof typeof acoes;

const tabela: { estado: EstadoRegistro; recusas: [NomeAcao, Quem[]][] }[] = [
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
            // O qa e o gerente têm o papel APROVADOR, mas não são o aprovador designado
            ["decidir", ["editor", "admin", "qa", "gerente"]],
            ["cancelar", ["editor", "qa"]],
        ],
    },
];

describe("Permissões: Investigação", () => {
    it.each(tabela)("$estado recusa quem não tem permissão", async ({ estado, recusas }) => {
        const contexto = await preparar(estado);
        for (const [acao, pessoas] of recusas) {
            for (const quem of pessoas) {
                await acoes[acao](contexto, quem);
            }
        }
    });
});
