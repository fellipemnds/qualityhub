import { expect } from "vitest";
import type { EstadoRegistro } from "../../compartilhado/entidades/estados.js";
import { chamar, ncPublicada } from "../cenarios.js";

// A Classificação não tem rota de cancelar: CANCELADO não é alcançável
export type EstadoAlcancavel = Exclude<EstadoRegistro, "CANCELADO">;

// RN-20: quem cria, edita, publica e submete é o aprovador (ação CLASSIFICAR). Quem decide é o aprovador
// designado — o QA, não quem criou.
export async function levarClassificacaoAte(estado: EstadoAlcancavel) {
    const cenario = await ncPublicada();
    const { aprovador, gerente, qa, nc } = cenario;

    // Degrau 1: Rascunho
    const classificacao = await chamar(aprovador, "POST", `/nc/${nc.id}/classificacoes`, 201, {
        valor: "MAIOR",
        justificativa: "Vazamento afeta a segurança operacional e a qualidade do produto entregue ao cliente.",
    });

    await chamar(gerente, "PUT", `/registros/${classificacao.id}/aprovador`, 200, { usuarioId: qa.usuario.id });

    expect(await chamar(aprovador, "GET", `/classificacoes/${classificacao.id}`, 200)).toMatchObject({
        estado: "RASCUNHO",
    });
    if (estado === "RASCUNHO") return { ...cenario, classificacao };

    // Degrau 2: Aberto
    await chamar(aprovador, "POST", `/classificacoes/${classificacao.id}/publicar`, 200);

    expect(await chamar(aprovador, "GET", `/classificacoes/${classificacao.id}`, 200)).toMatchObject({
        estado: "ABERTO",
    });

    if (estado === "ABERTO") return { ...cenario, classificacao };

    // Degrau 3: Em Aprovação
    await chamar(aprovador, "POST", `/classificacoes/${classificacao.id}/submeter`, 200);

    expect(await chamar(aprovador, "GET", `/classificacoes/${classificacao.id}`, 200)).toMatchObject({
        estado: "EM_APROVACAO",
    });

    if (estado === "EM_APROVACAO") return { ...cenario, classificacao };

    // Degrau 4: Fechado
    await chamar(qa, "POST", `/classificacoes/${classificacao.id}/decidir`, 200, { decisao: "APROVADO" });

    expect(await chamar(aprovador, "GET", `/classificacoes/${classificacao.id}`, 200)).toMatchObject({
        estado: "FECHADO",
    });

    return { ...cenario, classificacao };
}
