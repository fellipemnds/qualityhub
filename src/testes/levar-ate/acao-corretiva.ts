import { expect } from "vitest";
import type { EstadoRegistro } from "../../compartilhado/entidades/estados.js";
import { chamar, diaDaquiA, ncProntaParaFechar } from "../cenarios.js";

// Só um portão (PLANO): aprovar o plano volta a ação para ABERTO, e o FECHADO vem do finalizar-execucao. O ABERTO
// depois do plano aprovado fica de fora — o que ele permite hoje está errado (B2).
export async function levarAcaoCorretivaAte(estado: EstadoRegistro) {
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
        prazo: diaDaquiA(15),
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
        executadoEm: diaDaquiA(-1),
        evidencia: "Procedimento PO-07 revisado e publicado na intranet, versão 3.0, com o material correto.",
    });

    await chamar(editor, "POST", `/acoes-corretivas/${acao.id}/finalizar-execucao`, 200, { diasParaVerificar: 30 });

    expect(await chamar(editor, "GET", `/acoes-corretivas/${acao.id}`, 200)).toMatchObject({ estado: "FECHADO" });

    return { ...cenario, acao };
}
