import { describe, expect, it } from "vitest";
import { chamar, daquiA, ncProntaParaFechar } from "../../testes/cenarios.js";
import type { EstadoRegistro } from "../entidades/estados.js";

// Só um portão (PLANO): aprovar o plano volta a ação para ABERTO, e o FECHADO vem do finalizar-execucao. O ABERTO
// depois do plano aprovado fica de fora — o que ele permite hoje está errado (B1, B2).
async function levarAte(estado: EstadoRegistro) {
    // A ação corretiva aponta para uma investigação: o cenário precisa de uma
    const cenario = await ncProntaParaFechar();
    const { editor, aprovador, gerente, nc, investigacao } = cenario;

    // Degrau 1: Rascunho
    const acao = await chamar(editor, "POST", `/nc/${nc.id}/acoes-corretivas`, 201, {
        investigacaoId: investigacao.id,
    });

    await chamar(gerente, "PUT", `/registros/${acao.id}/aprovador`, 200, { usuarioId: aprovador.usuario.id });

    expect(await chamar(editor, "GET", `/acoes-corretivas/${acao.id}`, 200)).toMatchObject({ estado: "RASCUNHO" });
    if (estado === "RASCUNHO") return { ...cenario, acao };

    // Degrau 2: Aberto (plano ainda não aprovado)
    await chamar(editor, "POST", `/acoes-corretivas/${acao.id}/publicar`, 200);

    expect(await chamar(editor, "GET", `/acoes-corretivas/${acao.id}`, 200)).toMatchObject({ estado: "ABERTO" });

    if (estado === "ABERTO") return { ...cenario, acao };

    if (estado === "CANCELADO") {
        await chamar(aprovador, "POST", `/acoes-corretivas/${acao.id}/cancelar`, 200, {
            motivo: "Teste de cancelamento.",
        });

        expect(await chamar(editor, "GET", `/acoes-corretivas/${acao.id}`, 200)).toMatchObject({
            estado: "CANCELADO",
        });

        return { ...cenario, acao };
    }

    // Degrau 3: Em Aprovação — o submeter exige o plano preenchido
    await chamar(editor, "PATCH", `/acoes-corretivas/${acao.id}`, 200, {
        descricao: "Atualizar o procedimento de manutenção para especificar o material correto de vedação.",
        prazo: daquiA(15),
        instrucoesVerificacao: "Após 30 dias de uso, inspecionar a vedação e confirmar ausência de vazamento.",
    });

    await chamar(editor, "POST", `/acoes-corretivas/${acao.id}/submeter`, 200);

    expect(await chamar(editor, "GET", `/acoes-corretivas/${acao.id}`, 200)).toMatchObject({
        estado: "EM_APROVACAO",
    });

    if (estado === "EM_APROVACAO") return { ...cenario, acao };

    // Degrau 4: Fechado — plano aprovado (volta a ABERTO), execução registrada e finalizada
    await chamar(aprovador, "POST", `/acoes-corretivas/${acao.id}/decidir`, 200, { decisao: "APROVADO" });

    expect(await chamar(editor, "GET", `/acoes-corretivas/${acao.id}`, 200)).toMatchObject({ estado: "ABERTO" });

    await chamar(editor, "PATCH", `/acoes-corretivas/${acao.id}`, 200, {
        executadoEm: daquiA(-1),
        evidencia: "Procedimento PO-07 revisado e publicado na intranet, versão 3.0, com o material correto.",
    });

    await chamar(editor, "POST", `/acoes-corretivas/${acao.id}/finalizar-execucao`, 200, { diasParaVerificar: 30 });

    expect(await chamar(editor, "GET", `/acoes-corretivas/${acao.id}`, 200)).toMatchObject({ estado: "FECHADO" });

    return { ...cenario, acao };
}

type Contexto = Awaited<ReturnType<typeof levarAte>>;

const acoes = {
    editar: ({ editor, acao }: Contexto) =>
        chamar(editor, "PATCH", `/acoes-corretivas/${acao.id}`, 409, {
            descricao: "Tentativa de editar a ação corretiva fora do estado permitido.",
        }),
    publicar: ({ editor, acao }: Contexto) => chamar(editor, "POST", `/acoes-corretivas/${acao.id}/publicar`, 409),
    excluir: ({ editor, acao }: Contexto) => chamar(editor, "DELETE", `/acoes-corretivas/${acao.id}`, 409),
    submeter: ({ editor, acao }: Contexto) => chamar(editor, "POST", `/acoes-corretivas/${acao.id}/submeter`, 409),
    aprovar: ({ aprovador, acao }: Contexto) =>
        chamar(aprovador, "POST", `/acoes-corretivas/${acao.id}/decidir`, 409, {
            decisao: "APROVADO",
        }),
    reprovar: ({ aprovador, acao }: Contexto) =>
        chamar(aprovador, "POST", `/acoes-corretivas/${acao.id}/decidir`, 409, {
            decisao: "REPROVADO",
            motivo: "Tentativa de reprovar fora do estado permitido",
        }),
    cancelar: ({ aprovador, acao }: Contexto) =>
        chamar(aprovador, "POST", `/acoes-corretivas/${acao.id}/cancelar`, 409, {
            motivo: "Tentativa de cancelar fora do estado permitido",
        }),
    finalizar: ({ editor, acao }: Contexto) =>
        chamar(editor, "POST", `/acoes-corretivas/${acao.id}/finalizar-execucao`, 409, {
            diasParaVerificar: 30,
        }),
};

type NomeAcao = keyof typeof acoes;

const tabela: { estado: EstadoRegistro; proibidas: NomeAcao[] }[] = [
    { estado: "RASCUNHO", proibidas: ["submeter", "aprovar", "reprovar", "finalizar"] }, // cancelar fica de fora: hoje o código permite (B12)
    { estado: "ABERTO", proibidas: ["excluir", "publicar", "aprovar", "reprovar"] }, // finalizar fica de fora: hoje passa sem plano aprovado (B1)
    { estado: "EM_APROVACAO", proibidas: ["editar", "excluir", "publicar", "submeter", "finalizar"] },
    {
        estado: "FECHADO",
        proibidas: ["editar", "excluir", "publicar", "submeter", "aprovar", "reprovar", "cancelar", "finalizar"],
    },
    {
        estado: "CANCELADO",
        proibidas: ["editar", "excluir", "publicar", "submeter", "aprovar", "reprovar", "cancelar", "finalizar"],
    },
];

describe("Máquina de estados: Ação corretiva", () => {
    it.each(tabela)("$estado recusa as ações proibidas", async ({ estado, proibidas }) => {
        const contexto = await levarAte(estado);
        for (const acao of proibidas) {
            await acoes[acao](contexto);
        }
    });
});
