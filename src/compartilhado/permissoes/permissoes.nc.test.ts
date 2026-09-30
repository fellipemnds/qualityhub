import { describe, it } from "vitest";
import { chamar, perfisDeFora } from "../../testes/cenarios.js";
import { levarNCAte } from "../../testes/levar-ate/nc.js";
import type { EstadoRegistro } from "../entidades/estados.js";

// Atribuições do levarNCAte: o editor criou (colaborador), o aprovador é o designado; qa e gerente não estão na NC.
async function preparar(estado: EstadoRegistro) {
    return { ...(await levarNCAte(estado)), ...(await perfisDeFora()) };
}

type Contexto = Awaited<ReturnType<typeof preparar>>;
type Quem = "editor" | "aprovador" | "qa" | "gerente" | "admin" | "visualizador" | "semPapel";

const acoes = {
    ver: (contexto: Contexto, quem: Quem) => chamar(contexto[quem], "GET", `/nc/${contexto.nc.id}`, 403),
    criar: (contexto: Contexto, quem: Quem) =>
        chamar(contexto[quem], "POST", "/nc", 403, {
            titulo: "Tentativa de criar uma NC sem permissão",
        }),
    editar: (contexto: Contexto, quem: Quem) =>
        chamar(contexto[quem], "PATCH", `/nc/${contexto.nc.id}`, 403, {
            descricao: "Tentativa de editar a não conformidade sem permissão.",
        }),
    excluir: (contexto: Contexto, quem: Quem) => chamar(contexto[quem], "DELETE", `/nc/${contexto.nc.id}`, 403),
    publicar: (contexto: Contexto, quem: Quem) => chamar(contexto[quem], "POST", `/nc/${contexto.nc.id}/publicar`, 403),
    submeter: (contexto: Contexto, quem: Quem) => chamar(contexto[quem], "POST", `/nc/${contexto.nc.id}/submeter`, 403),
    decidir: (contexto: Contexto, quem: Quem) =>
        chamar(contexto[quem], "POST", `/nc/${contexto.nc.id}/decidir`, 403, {
            decisao: "APROVADO",
        }),
    cancelar: (contexto: Contexto, quem: Quem) =>
        chamar(contexto[quem], "POST", `/nc/${contexto.nc.id}/cancelar`, 403, {
            motivo: "Tentativa de cancelar sem permissão",
        }),
    reabrir: (contexto: Contexto, quem: Quem) =>
        chamar(contexto[quem], "POST", `/nc/${contexto.nc.id}/reabrir`, 403, {
            motivo: "Tentativa de reabrir sem permissão",
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
            // O qa e o gerente têm o papel APROVADOR, mas não são o aprovador designado. O admin não aprova NC
            ["decidir", ["editor", "admin", "qa", "gerente"]],
            ["cancelar", ["editor", "qa"]],
        ],
    },
    {
        estado: "FECHADO",
        // Reabrir exige só o papel, sem atribuição
        recusas: [["reabrir", ["editor", "visualizador", "admin"]]],
    },
];

describe("Permissões: NC", () => {
    it.each(tabela)("$estado recusa quem não tem permissão", async ({ estado, recusas }) => {
        const contexto = await preparar(estado);
        for (const [acao, pessoas] of recusas) {
            for (const quem of pessoas) {
                await acoes[acao](contexto, quem);
            }
        }
    });
});
