import { expect } from "vitest";
import type { EstadoRegistro } from "../../compartilhado/entidades/estados.js";
import { chamar, daquiA, ncPublicada } from "../cenarios.js";

export async function levarContencaoAte(estado: EstadoRegistro) {
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
