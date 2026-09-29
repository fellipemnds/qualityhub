import { describe, expect, it } from "vitest";
import { chamar, perfisDeFora } from "../../testes/cenarios.js";
import { levarContencaoAte } from "../../testes/levar-ate/contencao.js";
import type { EstadoRegistro } from "../entidades/estados.js";

// O espelho da máquina de estados: cada tentativa acontece no estado em que a ação é permitida, feita por quem
// não pode — e o 403 só sai das checagens de permissão.
// Atribuições do levarContencaoAte: o editor criou (colaborador), o aprovador é o designado; qa e gerente não
// estão no item.
async function preparar(estado: EstadoRegistro) {
    return { ...(await levarContencaoAte(estado)), ...(await perfisDeFora()) };
}

type Contexto = Awaited<ReturnType<typeof preparar>>;
type Quem = "editor" | "aprovador" | "qa" | "gerente" | "admin" | "visualizador" | "semPapel";

const acoes = {
    ver: (contexto: Contexto, quem: Quem) => chamar(contexto[quem], "GET", `/contencoes/${contexto.contencao.id}`, 403),
    criar: (contexto: Contexto, quem: Quem) =>
        chamar(contexto[quem], "POST", `/nc/${contexto.nc.id}/contencoes`, 403, {
            descricao: "Tentativa de criar uma contenção sem permissão.",
        }),
    editar: (contexto: Contexto, quem: Quem) =>
        chamar(contexto[quem], "PATCH", `/contencoes/${contexto.contencao.id}`, 403, {
            descricao: "Tentativa de editar a contenção sem permissão.",
        }),
    excluir: (contexto: Contexto, quem: Quem) =>
        chamar(contexto[quem], "DELETE", `/contencoes/${contexto.contencao.id}`, 403),
    publicar: (contexto: Contexto, quem: Quem) =>
        chamar(contexto[quem], "POST", `/contencoes/${contexto.contencao.id}/publicar`, 403),
    submeter: (contexto: Contexto, quem: Quem) =>
        chamar(contexto[quem], "POST", `/contencoes/${contexto.contencao.id}/submeter`, 403),
    decidir: (contexto: Contexto, quem: Quem) =>
        chamar(contexto[quem], "POST", `/contencoes/${contexto.contencao.id}/decidir`, 403, {
            decisao: "APROVADO",
        }),
    cancelar: (contexto: Contexto, quem: Quem) =>
        chamar(contexto[quem], "POST", `/contencoes/${contexto.contencao.id}/cancelar`, 403, {
            motivo: "Tentativa de cancelar sem permissão",
        }),
};

type NomeAcao = keyof typeof acoes;

// Cada recusa: a ação e quem tenta. Papel: sem o papel da ação. Atribuição: tem o papel, mas não está no item.
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

describe("Permissões: Contenção", () => {
    it.each(tabela)("$estado recusa quem não tem permissão", async ({ estado, recusas }) => {
        const contexto = await preparar(estado);
        for (const [acao, pessoas] of recusas) {
            for (const quem of pessoas) {
                await acoes[acao](contexto, quem);
            }
        }
    });

    it("o gerente cancela sem ser o aprovador designado", async () => {
        const { editor, gerente, contencao } = await preparar("ABERTO");

        await chamar(gerente, "POST", `/contencoes/${contencao.id}/cancelar`, 200, {
            motivo: "Teste de cancelamento.",
        });

        expect(await chamar(editor, "GET", `/contencoes/${contencao.id}`, 200)).toMatchObject({ estado: "CANCELADO" });
    });
});
