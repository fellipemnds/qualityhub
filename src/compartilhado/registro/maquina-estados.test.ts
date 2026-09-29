import { describe, expect, it } from "vitest";
import { chamar, daquiA, ncPublicada } from "../../testes/cenarios.js";
import type { EstadoRegistro } from "../entidades/estados.js";

async function levarAte(estado: EstadoRegistro) {
    const cenario = await ncPublicada();
    const { editor, aprovador, gerente, nc } = cenario;

    // Degrau 1: Rascunho
    const contencao = await chamar(editor, "POST", `/nc/${nc.id}/contencoes`, 201, {
        descricao: "Retrabalho realizado na peça com defeito, substituindo a vedação danificada.",
    });

    await chamar(gerente, "PUT", `/registros/${contencao.id}/aprovador`, 200, { usuarioId: aprovador.usuario.id });

    expect(await chamar(editor, "GET", `/contencoes/${contencao.id}`, 200)).toMatchObject({ estado: "RASCUNHO" });
    if (estado === "RASCUNHO") return { ...cenario, contencao };

    // Degrau 2: Aberto
    await chamar(editor, "POST", `/contencoes/${contencao.id}/publicar`, 200);

    expect(await chamar(editor, "GET", `/contencoes/${contencao.id}`, 200)).toMatchObject({
        estado: "ABERTO",
    });

    if (estado === "ABERTO") return { ...cenario, contencao };

    if (estado === "CANCELADO") {
        await chamar(aprovador, "POST", `/contencoes/${contencao.id}/cancelar`, 200, {
            motivo: "Teste de cancelamento.",
        });

        expect(await chamar(editor, "GET", `/contencoes/${contencao.id}`, 200)).toMatchObject({
            estado: "CANCELADO",
        });

        return { ...cenario, contencao };
    }

    // Degrau 3: Em Aprovação
    await chamar(editor, "PATCH", `/contencoes/${contencao.id}`, 200, {
        executadaEm: daquiA(-1),
        disposicao: "CORRIGIDO",
    });

    await chamar(editor, "POST", `/contencoes/${contencao.id}/submeter`, 200);

    expect(await chamar(editor, "GET", `/contencoes/${contencao.id}`, 200)).toMatchObject({
        estado: "EM_APROVACAO",
    });

    if (estado === "EM_APROVACAO") return { ...cenario, contencao };

    // Degrau 4: Fechado
    await chamar(aprovador, "POST", `/contencoes/${contencao.id}/decidir`, 200, { decisao: "APROVADO" });

    expect(await chamar(editor, "GET", `/contencoes/${contencao.id}`, 200)).toMatchObject({
        estado: "FECHADO",
    });

    return { ...cenario, contencao };
}

type Contexto = Awaited<ReturnType<typeof levarAte>>;

const acoes = {
    editar: ({ editor, contencao }: Contexto) =>
        chamar(editor, "PATCH", `/contencoes/${contencao.id}`, 409, {
            descricao: "Tentativa de editar a contenção fora do estado permitido.",
        }),
    publicar: ({ editor, contencao }: Contexto) => chamar(editor, "POST", `/contencoes/${contencao.id}/publicar`, 409),
    excluir: ({ editor, contencao }: Contexto) => chamar(editor, "DELETE", `/contencoes/${contencao.id}`, 409),
    submeter: ({ editor, contencao }: Contexto) => chamar(editor, "POST", `/contencoes/${contencao.id}/submeter`, 409),
    aprovar: ({ aprovador, contencao }: Contexto) =>
        chamar(aprovador, "POST", `/contencoes/${contencao.id}/decidir`, 409, {
            decisao: "APROVADO",
        }),
    reprovar: ({ aprovador, contencao }: Contexto) =>
        chamar(aprovador, "POST", `/contencoes/${contencao.id}/decidir`, 409, {
            decisao: "REPROVADO",
            motivo: "Tentativa de reprovar fora do estado permitido",
        }),
    cancelar: ({ aprovador, contencao }: Contexto) =>
        chamar(aprovador, "POST", `/contencoes/${contencao.id}/cancelar`, 409, {
            motivo: "Tentativa de cancelar fora do estado permitido",
        }),
};

type NomeAcao = keyof typeof acoes;

const tabela: { estado: EstadoRegistro; proibidas: NomeAcao[] }[] = [
    { estado: "RASCUNHO", proibidas: ["submeter", "aprovar", "reprovar"] }, // CANCELAR está fora de propósito: hoje o código permite (B12)
    { estado: "ABERTO", proibidas: ["excluir", "publicar", "aprovar", "reprovar"] },
    { estado: "EM_APROVACAO", proibidas: ["editar", "excluir", "publicar", "submeter"] },
    { estado: "FECHADO", proibidas: ["editar", "excluir", "publicar", "submeter", "aprovar", "reprovar", "cancelar"] },
    {
        estado: "CANCELADO",
        proibidas: ["editar", "excluir", "publicar", "submeter", "aprovar", "reprovar", "cancelar"],
    },
];

describe("Máquina de estados: Contenção", () => {
    it.each(tabela)("$estado recusa as ações proibidas", async ({ estado, proibidas }) => {
        const contexto = await levarAte(estado);
        for (const acao of proibidas) {
            await acoes[acao](contexto);
        }
    });
});
