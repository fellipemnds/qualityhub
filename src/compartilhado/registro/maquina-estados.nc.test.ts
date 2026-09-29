import { describe, expect, it } from "vitest";
import { chamar, ncProntaParaFechar, ncPublicada } from "../../testes/cenarios.js";
import type { EstadoRegistro } from "../entidades/estados.js";

async function levarAte(estado: EstadoRegistro) {
    // Degrau 1: Rascunho — uma NC nova, porque o ncPublicada entrega a dele já publicada
    if (estado === "RASCUNHO") {
        const cenario = await ncPublicada();
        const { editor, aprovador, gerente } = cenario;

        const nc = await chamar(editor, "POST", "/nc", 201, {
            titulo: "Peça fora de tolerância na linha 3",
            descricao: "Diâmetro externo medido acima da tolerância em lote inspecionado na linha 3.",
            requisitoViolado: "Desenho 1234, cota A",
            processoAfetado: "Linha de Produção 3",
            setorId: editor.usuario.setorId,
            detectadoEm: "2026-09-10T10:00:00.000Z",
            origem: "OPERACAO",
        });

        await chamar(gerente, "PUT", `/registros/${nc.id}/aprovador`, 200, { usuarioId: aprovador.usuario.id });

        expect(await chamar(editor, "GET", `/nc/${nc.id}`, 200)).toMatchObject({ estado: "RASCUNHO" });

        return { ...cenario, nc };
    }

    // Degrau 2: Aberto — com contenção, classificação e investigação FECHADAS: a guarda RN-21 do submeter roda
    // antes da de estado, e precisa passar para o 409 vir do estado
    const cenario = await ncProntaParaFechar();
    const { editor, aprovador, nc } = cenario;

    expect(await chamar(editor, "GET", `/nc/${nc.id}`, 200)).toMatchObject({ estado: "ABERTO" });

    if (estado === "ABERTO") return cenario;

    if (estado === "CANCELADO") {
        await chamar(aprovador, "POST", `/nc/${nc.id}/cancelar`, 200, {
            motivo: "Teste de cancelamento.",
        });

        expect(await chamar(editor, "GET", `/nc/${nc.id}`, 200)).toMatchObject({ estado: "CANCELADO" });

        return cenario;
    }

    // Degrau 3: Em Aprovação — o submeter exige os campos de fechamento
    await chamar(editor, "PATCH", `/nc/${nc.id}`, 200, {
        riscosRevisados: "Risco de contaminação reavaliado, mitigado pela troca do material de vedação.",
        mudancasSGQ: "Procedimento PO-07 será atualizado para especificar o material de vedação compatível.",
    });

    await chamar(editor, "POST", `/nc/${nc.id}/submeter`, 200);

    expect(await chamar(editor, "GET", `/nc/${nc.id}`, 200)).toMatchObject({ estado: "EM_APROVACAO" });

    if (estado === "EM_APROVACAO") return cenario;

    // Degrau 4: Fechado
    await chamar(aprovador, "POST", `/nc/${nc.id}/decidir`, 200, { decisao: "APROVADO" });

    expect(await chamar(editor, "GET", `/nc/${nc.id}`, 200)).toMatchObject({ estado: "FECHADO" });

    return cenario;
}

type Contexto = Awaited<ReturnType<typeof levarAte>>;

const acoes = {
    editar: ({ editor, nc }: Contexto) =>
        chamar(editor, "PATCH", `/nc/${nc.id}`, 409, {
            descricao: "Tentativa de editar a não conformidade fora do estado permitido.",
        }),
    publicar: ({ editor, nc }: Contexto) => chamar(editor, "POST", `/nc/${nc.id}/publicar`, 409),
    excluir: ({ editor, nc }: Contexto) => chamar(editor, "DELETE", `/nc/${nc.id}`, 409),
    submeter: ({ editor, nc }: Contexto) => chamar(editor, "POST", `/nc/${nc.id}/submeter`, 409),
    aprovar: ({ aprovador, nc }: Contexto) =>
        chamar(aprovador, "POST", `/nc/${nc.id}/decidir`, 409, {
            decisao: "APROVADO",
        }),
    reprovar: ({ aprovador, nc }: Contexto) =>
        chamar(aprovador, "POST", `/nc/${nc.id}/decidir`, 409, {
            decisao: "REPROVADO",
            motivo: "Tentativa de reprovar fora do estado permitido",
        }),
    cancelar: ({ aprovador, nc }: Contexto) =>
        chamar(aprovador, "POST", `/nc/${nc.id}/cancelar`, 409, {
            motivo: "Tentativa de cancelar fora do estado permitido",
        }),
    reabrir: ({ aprovador, nc }: Contexto) =>
        chamar(aprovador, "POST", `/nc/${nc.id}/reabrir`, 409, {
            motivo: "Tentativa de reabrir fora do estado permitido",
        }),
};

type NomeAcao = keyof typeof acoes;

const tabela: { estado: EstadoRegistro; proibidas: NomeAcao[] }[] = [
    // cancelar fica de fora: hoje o código permite (B12). Submeter também: numa NC em rascunho a guarda RN-21
    // (sem filhos fechados) barra antes da de estado — o 409 viria pelo motivo errado
    { estado: "RASCUNHO", proibidas: ["aprovar", "reprovar", "reabrir"] },
    { estado: "ABERTO", proibidas: ["excluir", "publicar", "aprovar", "reprovar", "reabrir"] },
    { estado: "EM_APROVACAO", proibidas: ["editar", "excluir", "publicar", "submeter", "reabrir"] },
    { estado: "FECHADO", proibidas: ["editar", "excluir", "publicar", "submeter", "aprovar", "reprovar", "cancelar"] },
    {
        estado: "CANCELADO",
        proibidas: ["editar", "excluir", "publicar", "submeter", "aprovar", "reprovar", "cancelar", "reabrir"],
    },
];

describe("Máquina de estados: NC", () => {
    it.each(tabela)("$estado recusa as ações proibidas", async ({ estado, proibidas }) => {
        const contexto = await levarAte(estado);
        for (const acao of proibidas) {
            await acoes[acao](contexto);
        }
    });
});
