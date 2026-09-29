import { describe, it } from "vitest";
import { chamar, perfisDeFora } from "../../testes/cenarios.js";
import { levarAcaoCorretivaAte } from "../../testes/levar-ate/acao-corretiva.js";
import type { EstadoRegistro } from "../entidades/estados.js";

// Atribuições do levarAcaoCorretivaAte: o editor criou (colaborador), o aprovador é o designado; qa e gerente não
// estão na ação. O finalizar-execucao fica de fora: o estado em que ele é permitido (plano aprovado) depende do B1.
async function preparar(estado: EstadoRegistro) {
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
