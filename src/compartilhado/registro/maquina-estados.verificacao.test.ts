import { describe, expect, it } from "vitest";
import { chamar, daquiA, executarAcao, ncProntaParaFechar } from "../../testes/cenarios.js";
import type { EstadoRegistro } from "../entidades/estados.js";

// A Verificação nasce já ABERTA (gerada pelo finalizar-execucao) e fecha pelo concluir, sem portão: não passa por
// RASCUNHO nem por EM_APROVACAO
type EstadoAlcancavel = Exclude<EstadoRegistro, "RASCUNHO" | "EM_APROVACAO">;

async function levarAte(estado: EstadoAlcancavel) {
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
        verificadoEm: daquiA(0),
    });

    await chamar(aprovador, "POST", `/verificacoes/${verificacao.id}/concluir`, 200);

    expect(await chamar(editor, "GET", `/verificacoes/${verificacao.id}`, 200)).toMatchObject({ estado: "FECHADO" });

    return { ...cenario, verificacao };
}

type Contexto = Awaited<ReturnType<typeof levarAte>>;

// Excluir fica de fora: a rota DELETE /verificacoes/:id nunca funciona e vai ser removida (B8)
const acoes = {
    editar: ({ aprovador, verificacao }: Contexto) =>
        chamar(aprovador, "PATCH", `/verificacoes/${verificacao.id}`, 409, {
            conclusao: "Tentativa de editar a verificação fora do estado permitido.",
        }),
    concluir: ({ aprovador, verificacao }: Contexto) =>
        chamar(aprovador, "POST", `/verificacoes/${verificacao.id}/concluir`, 409),
    cancelar: ({ aprovador, verificacao }: Contexto) =>
        chamar(aprovador, "POST", `/verificacoes/${verificacao.id}/cancelar`, 409, {
            motivo: "Tentativa de cancelar fora do estado permitido",
        }),
};

type NomeAcao = keyof typeof acoes;

// ABERTO não tem linha: ali as três ações são permitidas
const tabela: { estado: EstadoAlcancavel; proibidas: NomeAcao[] }[] = [
    { estado: "FECHADO", proibidas: ["editar", "concluir", "cancelar"] },
    { estado: "CANCELADO", proibidas: ["editar", "concluir", "cancelar"] },
];

describe("Máquina de estados: Verificação", () => {
    it.each(tabela)("$estado recusa as ações proibidas", async ({ estado, proibidas }) => {
        const contexto = await levarAte(estado);
        for (const acao of proibidas) {
            await acoes[acao](contexto);
        }
    });
});
