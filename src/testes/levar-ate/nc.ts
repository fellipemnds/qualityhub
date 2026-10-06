import { expect } from "vitest";
import type { EstadoRegistro } from "../../compartilhado/entidades/estados.js";
import { chamar, ncProntaParaFechar, ncPublicada } from "../cenarios.js";

export async function levarNCAte(estado: EstadoRegistro) {
    // Degrau 1: Rascunho — uma NC nova, porque o ncPublicada entrega a dele já publicada
    if (estado === "RASCUNHO") {
        const cenario = await ncPublicada();
        const { editor, aprovador, gerente } = cenario;

        const nc = await chamar(editor, "POST", "/api/nc", 201, {
            titulo: "Peça fora de tolerância na linha 3",
            descricao: "Diâmetro externo medido acima da tolerância em lote inspecionado na linha 3.",
            requisitoViolado: "Desenho 1234, cota A",
            processoAfetado: "Linha de Produção 3",
            setorId: editor.usuario.setorId,
            detectadoEm: "2026-09-10",
            origem: "OPERACAO",
        });

        await chamar(gerente, "PUT", `/api/registros/${nc.id}/aprovador`, 200, { usuarioId: aprovador.usuario.id });

        expect(await chamar(editor, "GET", `/api/nc/${nc.id}`, 200)).toMatchObject({ estado: "RASCUNHO" });

        return { ...cenario, nc };
    }

    // Degrau 2: Aberto — com contenção, classificação e investigação FECHADAS: a guarda RN-21 do submeter roda
    // antes da de estado, e precisa passar para o 409 vir do estado
    const cenario = await ncProntaParaFechar();
    const { editor, aprovador, nc } = cenario;

    expect(await chamar(editor, "GET", `/api/nc/${nc.id}`, 200)).toMatchObject({ estado: "ABERTO" });

    if (estado === "ABERTO") return cenario;

    if (estado === "CANCELADO") {
        await chamar(aprovador, "POST", `/api/nc/${nc.id}/cancelar`, 200, {
            motivo: "Teste de cancelamento.",
        });

        expect(await chamar(editor, "GET", `/api/nc/${nc.id}`, 200)).toMatchObject({ estado: "CANCELADO" });

        return cenario;
    }

    // Degrau 3: Em Aprovação — o submeter exige os campos de fechamento
    await chamar(editor, "PATCH", `/api/nc/${nc.id}`, 200, {
        riscosRevisados: "Risco de contaminação reavaliado, mitigado pela troca do material de vedação.",
        mudancasSGQ: "Procedimento PO-07 será atualizado para especificar o material de vedação compatível.",
    });

    await chamar(editor, "POST", `/api/nc/${nc.id}/submeter`, 200);

    expect(await chamar(editor, "GET", `/api/nc/${nc.id}`, 200)).toMatchObject({ estado: "EM_APROVACAO" });

    if (estado === "EM_APROVACAO") return cenario;

    // Degrau 4: Fechado
    await chamar(aprovador, "POST", `/api/nc/${nc.id}/decidir`, 200, { decisao: "APROVADO" });

    expect(await chamar(editor, "GET", `/api/nc/${nc.id}`, 200)).toMatchObject({ estado: "FECHADO" });

    return cenario;
}
