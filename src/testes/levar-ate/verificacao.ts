import { expect } from "vitest";
import type { EstadoRegistro } from "../../compartilhado/entidades/estados.js";
import { chamar, diaDaquiA, executarAcao, ncProntaParaFechar } from "../cenarios.js";

// A Verificação nasce já ABERTA (gerada pelo finalizar-execucao) e fecha pelo concluir, sem portão: não passa por
// RASCUNHO nem por EM_APROVACAO
export type EstadoAlcancavel = Exclude<EstadoRegistro, "RASCUNHO" | "EM_APROVACAO">;

export async function levarVerificacaoAte(estado: EstadoAlcancavel) {
    const cenario = await ncProntaParaFechar();
    const { editor, aprovador, gerente } = cenario;

    // Degrau 1: Aberto. Editar e concluir exigem ser colaborador, e o aprovador nasce atribuído só como APROVADOR.
    const { verificacao } = await executarAcao(cenario);

    await chamar(gerente, "POST", `/registros/${verificacao.id}/colaboradores`, 200, {
        colaboradores: [aprovador.usuario.id],
    });

    expect(await chamar(editor, "GET", `/verificacoes/${verificacao.id}`, 200)).toMatchObject({ estado: "ABERTO" });

    if (estado === "ABERTO") return { ...cenario, verificacao };

    if (estado === "CANCELADO") {
        await chamar(aprovador, "POST", `/verificacoes/${verificacao.id}/cancelar`, 200, {
            motivo: "Teste de cancelamento.",
        });

        expect(await chamar(editor, "GET", `/verificacoes/${verificacao.id}`, 200)).toMatchObject({
            estado: "CANCELADO",
        });

        return { ...cenario, verificacao };
    }

    // Degrau 2: Fechado — EFICAZ, para a conclusão não disparar nada automático
    await chamar(aprovador, "PATCH", `/verificacoes/${verificacao.id}`, 200, {
        resultado: "EFICAZ",
        conclusao: "Verificação feita na linha 2 depois do prazo, conforme as instruções do plano.",
        verificadoEm: diaDaquiA(0),
    });

    await chamar(aprovador, "POST", `/verificacoes/${verificacao.id}/concluir`, 200);

    expect(await chamar(editor, "GET", `/verificacoes/${verificacao.id}`, 200)).toMatchObject({ estado: "FECHADO" });

    return { ...cenario, verificacao };
}
