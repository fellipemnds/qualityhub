import { expect } from "vitest";
import type { EstadoRegistro } from "../../compartilhado/entidades/estados.js";
import { chamar, ncPublicada } from "../cenarios.js";

export async function levarInvestigacaoAte(estado: EstadoRegistro) {
    const cenario = await ncPublicada();
    const { editor, aprovador, gerente, nc } = cenario;

    // Degrau 1: Rascunho
    const investigacao = await chamar(editor, "POST", `/api/nc/${nc.id}/investigacoes`, 201, {
        realProblema: "Vedação da bomba hidráulica com desgaste prematuro, causando vazamento contínuo de óleo.",
    });

    await chamar(gerente, "PUT", `/api/registros/${investigacao.id}/aprovador`, 200, {
        usuarioId: aprovador.usuario.id,
    });

    expect(await chamar(editor, "GET", `/api/investigacoes/${investigacao.id}`, 200)).toMatchObject({
        estado: "RASCUNHO",
    });
    if (estado === "RASCUNHO") return { ...cenario, investigacao };

    // Degrau 2: Aberto
    await chamar(editor, "POST", `/api/investigacoes/${investigacao.id}/publicar`, 200);

    expect(await chamar(editor, "GET", `/api/investigacoes/${investigacao.id}`, 200)).toMatchObject({
        estado: "ABERTO",
    });

    if (estado === "ABERTO") return { ...cenario, investigacao };

    if (estado === "CANCELADO") {
        await chamar(aprovador, "POST", `/api/investigacoes/${investigacao.id}/cancelar`, 200, {
            motivo: "Teste de cancelamento.",
        });

        expect(await chamar(editor, "GET", `/api/investigacoes/${investigacao.id}`, 200)).toMatchObject({
            estado: "CANCELADO",
        });

        return { ...cenario, investigacao };
    }

    // Degrau 3: Em Aprovação — o submeter exige método, conteúdo e as duas causas
    await chamar(editor, "PATCH", `/api/investigacoes/${investigacao.id}`, 200, {
        metodo: "A3_SPS",
        conteudo: { percepcaoInicial: "Vazamento constante na linha 2" },
        causaDireta: "Vedação de material incompatível com o fluido hidráulico utilizado na máquina.",
        causaRaiz: "Procedimento de manutenção não especifica o material correto de vedação para esta bomba.",
    });

    await chamar(editor, "POST", `/api/investigacoes/${investigacao.id}/submeter`, 200);

    expect(await chamar(editor, "GET", `/api/investigacoes/${investigacao.id}`, 200)).toMatchObject({
        estado: "EM_APROVACAO",
    });

    if (estado === "EM_APROVACAO") return { ...cenario, investigacao };

    // Degrau 4: Fechado
    await chamar(aprovador, "POST", `/api/investigacoes/${investigacao.id}/decidir`, 200, { decisao: "APROVADO" });

    expect(await chamar(editor, "GET", `/api/investigacoes/${investigacao.id}`, 200)).toMatchObject({
        estado: "FECHADO",
    });

    return { ...cenario, investigacao };
}
