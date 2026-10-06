import { describe, it } from "vitest";
import { chamar, perfisDeFora } from "../../testes/cenarios.js";
import { type EstadoAlcancavel, levarVerificacaoAte } from "../../testes/levar-ate/verificacao.js";

// Atribuições do levarVerificacaoAte: o aprovador é o designado e colaborador; qa e gerente não estão na
// verificação. Editar e concluir exigem o papel CONCLUIR_VERIFICACAO (APROVADOR/GERENTE) e ser colaborador.
async function preparar(estado: EstadoAlcancavel) {
    return { ...(await levarVerificacaoAte(estado)), ...(await perfisDeFora()) };
}

type Contexto = Awaited<ReturnType<typeof preparar>>;
type Quem = "editor" | "aprovador" | "qa" | "gerente" | "admin" | "visualizador" | "semPapel";

const acoes = {
    ver: (contexto: Contexto, quem: Quem) =>
        chamar(contexto[quem], "GET", `/api/verificacoes/${contexto.verificacao.id}`, 403),
    editar: (contexto: Contexto, quem: Quem) =>
        chamar(contexto[quem], "PATCH", `/api/verificacoes/${contexto.verificacao.id}`, 403, {
            conclusao: "Tentativa de editar a verificação sem permissão.",
        }),
    concluir: (contexto: Contexto, quem: Quem) =>
        chamar(contexto[quem], "POST", `/api/verificacoes/${contexto.verificacao.id}/concluir`, 403),
    cancelar: (contexto: Contexto, quem: Quem) =>
        chamar(contexto[quem], "POST", `/api/verificacoes/${contexto.verificacao.id}/cancelar`, 403, {
            motivo: "Tentativa de cancelar sem permissão",
        }),
};

type NomeAcao = keyof typeof acoes;

// Tudo acontece em ABERTO, o único estado com ações permitidas
const tabela: { estado: EstadoAlcancavel; recusas: [NomeAcao, Quem[]][] }[] = [
    {
        estado: "ABERTO",
        recusas: [
            ["ver", ["semPapel", "admin"]],
            ["editar", ["editor", "visualizador", "qa", "gerente"]],
            ["concluir", ["editor", "qa", "gerente"]],
            ["cancelar", ["editor", "qa"]],
        ],
    },
];

describe("Permissões: Verificação", () => {
    it.each(tabela)("$estado recusa quem não tem permissão", async ({ estado, recusas }) => {
        const contexto = await preparar(estado);
        for (const [acao, pessoas] of recusas) {
            for (const quem of pessoas) {
                await acoes[acao](contexto, quem);
            }
        }
    });
});
