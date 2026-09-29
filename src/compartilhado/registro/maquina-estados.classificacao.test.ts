import { describe, expect, it } from "vitest";
import { chamar, ncPublicada } from "../../testes/cenarios.js";
import type { EstadoRegistro } from "../entidades/estados.js";

// A Classificação não tem rota de cancelar: CANCELADO não é alcançável
type EstadoAlcancavel = Exclude<EstadoRegistro, "CANCELADO">;

// RN-20: quem cria, edita, publica e submete é o aprovador (ação CLASSIFICAR). Quem decide é o aprovador
// designado — o QA, não quem criou.
async function levarAte(estado: EstadoAlcancavel) {
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

type Contexto = Awaited<ReturnType<typeof levarAte>>;

const acoes = {
    editar: ({ aprovador, classificacao }: Contexto) =>
        chamar(aprovador, "PATCH", `/classificacoes/${classificacao.id}`, 409, {
            justificativa: "Tentativa de editar a classificação fora do estado permitido.",
        }),
    publicar: ({ aprovador, classificacao }: Contexto) =>
        chamar(aprovador, "POST", `/classificacoes/${classificacao.id}/publicar`, 409),
    excluir: ({ aprovador, classificacao }: Contexto) =>
        chamar(aprovador, "DELETE", `/classificacoes/${classificacao.id}`, 409),
    submeter: ({ aprovador, classificacao }: Contexto) =>
        chamar(aprovador, "POST", `/classificacoes/${classificacao.id}/submeter`, 409),
    aprovar: ({ qa, classificacao }: Contexto) =>
        chamar(qa, "POST", `/classificacoes/${classificacao.id}/decidir`, 409, {
            decisao: "APROVADO",
        }),
    reprovar: ({ qa, classificacao }: Contexto) =>
        chamar(qa, "POST", `/classificacoes/${classificacao.id}/decidir`, 409, {
            decisao: "REPROVADO",
            motivo: "Tentativa de reprovar fora do estado permitido",
        }),
};

type NomeAcao = keyof typeof acoes;

const tabela: { estado: EstadoAlcancavel; proibidas: NomeAcao[] }[] = [
    { estado: "RASCUNHO", proibidas: ["submeter", "aprovar", "reprovar"] },
    { estado: "ABERTO", proibidas: ["excluir", "publicar", "aprovar", "reprovar"] },
    { estado: "EM_APROVACAO", proibidas: ["editar", "excluir", "publicar", "submeter"] },
    { estado: "FECHADO", proibidas: ["editar", "excluir", "publicar", "submeter", "aprovar", "reprovar"] },
];

describe("Máquina de estados: Classificação", () => {
    it.each(tabela)("$estado recusa as ações proibidas", async ({ estado, proibidas }) => {
        const contexto = await levarAte(estado);
        for (const acao of proibidas) {
            await acoes[acao](contexto);
        }
    });
});
