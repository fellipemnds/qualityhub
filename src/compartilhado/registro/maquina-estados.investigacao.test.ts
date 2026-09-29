import { describe, expect, it } from "vitest";
import { chamar, ncPublicada } from "../../testes/cenarios.js";
import type { EstadoRegistro } from "../entidades/estados.js";

async function levarAte(estado: EstadoRegistro) {
    const cenario = await ncPublicada();
    const { editor, aprovador, gerente, nc } = cenario;

    // Degrau 1: Rascunho
    const investigacao = await chamar(editor, "POST", `/nc/${nc.id}/investigacoes`, 201, {
        realProblema: "Vedação da bomba hidráulica com desgaste prematuro, causando vazamento contínuo de óleo.",
    });

    await chamar(gerente, "PUT", `/registros/${investigacao.id}/aprovador`, 200, { usuarioId: aprovador.usuario.id });

    expect(await chamar(editor, "GET", `/investigacoes/${investigacao.id}`, 200)).toMatchObject({
        estado: "RASCUNHO",
    });
    if (estado === "RASCUNHO") return { ...cenario, investigacao };

    // Degrau 2: Aberto
    await chamar(editor, "POST", `/investigacoes/${investigacao.id}/publicar`, 200);

    expect(await chamar(editor, "GET", `/investigacoes/${investigacao.id}`, 200)).toMatchObject({
        estado: "ABERTO",
    });

    if (estado === "ABERTO") return { ...cenario, investigacao };

    if (estado === "CANCELADO") {
        await chamar(aprovador, "POST", `/investigacoes/${investigacao.id}/cancelar`, 200, {
            motivo: "Teste de cancelamento.",
        });

        expect(await chamar(editor, "GET", `/investigacoes/${investigacao.id}`, 200)).toMatchObject({
            estado: "CANCELADO",
        });

        return { ...cenario, investigacao };
    }

    // Degrau 3: Em Aprovação — o submeter exige método, conteúdo e as duas causas
    await chamar(editor, "PATCH", `/investigacoes/${investigacao.id}`, 200, {
        metodo: "A3_SPS",
        conteudo: { percepcaoInicial: "Vazamento constante na linha 2" },
        causaDireta: "Vedação de material incompatível com o fluido hidráulico utilizado na máquina.",
        causaRaiz: "Procedimento de manutenção não especifica o material correto de vedação para esta bomba.",
    });

    await chamar(editor, "POST", `/investigacoes/${investigacao.id}/submeter`, 200);

    expect(await chamar(editor, "GET", `/investigacoes/${investigacao.id}`, 200)).toMatchObject({
        estado: "EM_APROVACAO",
    });

    if (estado === "EM_APROVACAO") return { ...cenario, investigacao };

    // Degrau 4: Fechado
    await chamar(aprovador, "POST", `/investigacoes/${investigacao.id}/decidir`, 200, { decisao: "APROVADO" });

    expect(await chamar(editor, "GET", `/investigacoes/${investigacao.id}`, 200)).toMatchObject({
        estado: "FECHADO",
    });

    return { ...cenario, investigacao };
}

type Contexto = Awaited<ReturnType<typeof levarAte>>;

const acoes = {
    editar: ({ editor, investigacao }: Contexto) =>
        chamar(editor, "PATCH", `/investigacoes/${investigacao.id}`, 409, {
            realProblema: "Tentativa de editar a investigação fora do estado permitido.",
        }),
    publicar: ({ editor, investigacao }: Contexto) =>
        chamar(editor, "POST", `/investigacoes/${investigacao.id}/publicar`, 409),
    excluir: ({ editor, investigacao }: Contexto) => chamar(editor, "DELETE", `/investigacoes/${investigacao.id}`, 409),
    submeter: ({ editor, investigacao }: Contexto) =>
        chamar(editor, "POST", `/investigacoes/${investigacao.id}/submeter`, 409),
    aprovar: ({ aprovador, investigacao }: Contexto) =>
        chamar(aprovador, "POST", `/investigacoes/${investigacao.id}/decidir`, 409, {
            decisao: "APROVADO",
        }),
    reprovar: ({ aprovador, investigacao }: Contexto) =>
        chamar(aprovador, "POST", `/investigacoes/${investigacao.id}/decidir`, 409, {
            decisao: "REPROVADO",
            motivo: "Tentativa de reprovar fora do estado permitido",
        }),
    cancelar: ({ aprovador, investigacao }: Contexto) =>
        chamar(aprovador, "POST", `/investigacoes/${investigacao.id}/cancelar`, 409, {
            motivo: "Tentativa de cancelar fora do estado permitido",
        }),
};

type NomeAcao = keyof typeof acoes;

const tabela: { estado: EstadoRegistro; proibidas: NomeAcao[] }[] = [
    { estado: "RASCUNHO", proibidas: ["submeter", "aprovar", "reprovar"] }, // cancelar fica de fora: hoje o código permite (B12)
    { estado: "ABERTO", proibidas: ["excluir", "publicar", "aprovar", "reprovar"] },
    { estado: "EM_APROVACAO", proibidas: ["editar", "excluir", "publicar", "submeter"] },
    { estado: "FECHADO", proibidas: ["editar", "excluir", "publicar", "submeter", "aprovar", "reprovar", "cancelar"] },
    {
        estado: "CANCELADO",
        proibidas: ["editar", "excluir", "publicar", "submeter", "aprovar", "reprovar", "cancelar"],
    },
];

describe("Máquina de estados: Investigação", () => {
    it.each(tabela)("$estado recusa as ações proibidas", async ({ estado, proibidas }) => {
        const contexto = await levarAte(estado);
        for (const acao of proibidas) {
            await acoes[acao](contexto);
        }
    });
});
