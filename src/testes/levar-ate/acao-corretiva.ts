import { expect } from "vitest";
import type { EstadoRegistro } from "../../compartilhado/entidades/estados.js";
import { chamar, diaDaquiA, investigacaoAberta } from "../cenarios.js";

// Só um portão (PLANO): aprovar o plano volta a ação para ABERTO, e o FECHADO vem do finalizar-execucao. O ABERTO
// depois da aprovação é um degrau à parte, "PLANO_APROVADO": o plano travado (B2) e a execução liberada (B1)
export type DegrauAcaoCorretiva = EstadoRegistro | "PLANO_APROVADO";

export async function levarAcaoCorretivaAte(estado: DegrauAcaoCorretiva) {
    // A ação corretiva aponta para uma investigação ainda editável (RN-49): o cenário precisa de uma aberta
    const cenario = await investigacaoAberta();
    const { editor, aprovador, gerente, nc, investigacao } = cenario;

    // Degrau 1: Rascunho
    const acao = await chamar(editor, "POST", `/api/nc/${nc.id}/acoes-corretivas`, 201, {
        investigacaoId: investigacao.id,
    });

    await chamar(gerente, "PUT", `/api/registros/${acao.id}/aprovador`, 200, { usuarioId: aprovador.usuario.id });

    expect(await chamar(editor, "GET", `/api/acoes-corretivas/${acao.id}`, 200)).toMatchObject({ estado: "RASCUNHO" });
    if (estado === "RASCUNHO") return { ...cenario, acao };

    // Degrau 2: Aberto (plano ainda não aprovado)
    await chamar(editor, "POST", `/api/acoes-corretivas/${acao.id}/publicar`, 200);

    expect(await chamar(editor, "GET", `/api/acoes-corretivas/${acao.id}`, 200)).toMatchObject({ estado: "ABERTO" });

    if (estado === "ABERTO") return { ...cenario, acao };

    if (estado === "CANCELADO") {
        await chamar(aprovador, "POST", `/api/acoes-corretivas/${acao.id}/cancelar`, 200, {
            motivo: "Teste de cancelamento.",
        });

        expect(await chamar(editor, "GET", `/api/acoes-corretivas/${acao.id}`, 200)).toMatchObject({
            estado: "CANCELADO",
        });

        return { ...cenario, acao };
    }

    // Degrau 3: Em Aprovação — o submeter exige o plano preenchido
    await chamar(editor, "PATCH", `/api/acoes-corretivas/${acao.id}`, 200, {
        descricao: "Atualizar o procedimento de manutenção para especificar o material correto de vedação.",
        prazo: diaDaquiA(15),
        instrucoesVerificacao: "Após 30 dias de uso, inspecionar a vedação e confirmar ausência de vazamento.",
    });

    await chamar(editor, "POST", `/api/acoes-corretivas/${acao.id}/submeter`, 200);

    expect(await chamar(editor, "GET", `/api/acoes-corretivas/${acao.id}`, 200)).toMatchObject({
        estado: "EM_APROVACAO",
    });

    if (estado === "EM_APROVACAO") return { ...cenario, acao };

    // Degrau 4: Plano aprovado — volta a ABERTO
    await chamar(aprovador, "POST", `/api/acoes-corretivas/${acao.id}/decidir`, 200, { decisao: "APROVADO" });

    expect(await chamar(editor, "GET", `/api/acoes-corretivas/${acao.id}`, 200)).toMatchObject({
        estado: "ABERTO",
        planoAprovado: true,
    });

    if (estado === "PLANO_APROVADO") return { ...cenario, acao };

    // Degrau 5: Fechado — execução registrada e finalizada

    await chamar(editor, "PATCH", `/api/acoes-corretivas/${acao.id}`, 200, {
        executadoEm: diaDaquiA(-1),
        evidencia: "Procedimento PO-07 revisado e publicado na intranet, versão 3.0, com o material correto.",
    });

    await chamar(editor, "POST", `/api/acoes-corretivas/${acao.id}/finalizar-execucao`, 200, { diasParaVerificar: 30 });

    expect(await chamar(editor, "GET", `/api/acoes-corretivas/${acao.id}`, 200)).toMatchObject({ estado: "FECHADO" });

    return { ...cenario, acao };
}
