import { describe, expect, it } from "vitest";
import { chamar, concluirVerificacao, executarAcao, fecharNC } from "../../testes/cenarios.js";

// Seções 1 a 10 de testes/old/requests-fluxo-completo.http: o caminho feliz de ponta a ponta. Os cenários
// (fecharNC, executarAcao...) moram em src/testes/cenarios.ts.

describe("Fluxo completo da NC", () => {
    it("fecha a NC depois de contenção, classificação e investigação aprovadas", async () => {
        // Prepara e chama
        const { editor, nc } = await fecharNC();

        // Confere
        expect(await chamar(editor, "GET", `/nc/${nc.id}`, 200)).toMatchObject({ estado: "FECHADO" });
    });

    it("depois do fechamento, executa a ação corretiva e conclui a verificação como EFICAZ", async () => {
        // Prepara
        const cenario = await fecharNC();
        const { editor } = cenario;

        // Chama
        const { acao, verificacao } = await executarAcao(cenario);
        await concluirVerificacao(cenario, verificacao.id, "EFICAZ");

        // Confere
        expect(await chamar(editor, "GET", `/verificacoes/${verificacao.id}`, 200)).toMatchObject({
            estado: "FECHADO",
            resultado: "EFICAZ",
        });
        expect(await chamar(editor, "GET", `/acoes-corretivas/${acao.id}`, 200)).toMatchObject({ estado: "FECHADO" });
    });

    it("PARCIALMENTE_EFICAZ cria sozinha uma nova ação corretiva em rascunho, na mesma investigação", async () => {
        // Prepara
        const cenario = await fecharNC();
        const { editor, nc, investigacao } = cenario;
        const { acao, verificacao } = await executarAcao(cenario);

        // Chama
        await concluirVerificacao(cenario, verificacao.id, "PARCIALMENTE_EFICAZ");

        // Confere (sem autor nem colaboradores da ação nova: bugs B3 e B6, da A3)
        const rascunhos = await chamar(
            editor,
            "GET",
            `/acoes-corretivas?naoConformidadeId=${nc.id}&estado=RASCUNHO`,
            200,
        );
        expect(rascunhos).toEqual([
            expect.objectContaining({
                tipo: "ACAO_CORRETIVA",
                naoConformidadeId: nc.id,
                investigacaoId: investigacao.id,
            }),
        ]);
        expect(rascunhos[0].id).not.toBe(acao.id);
    });

    it("NAO_EFICAZ reabre a investigação e a NC, que estavam fechadas", async () => {
        // Prepara
        const cenario = await fecharNC();
        const { editor, nc, investigacao } = cenario;
        const { verificacao } = await executarAcao(cenario);

        // Chama
        await concluirVerificacao(cenario, verificacao.id, "NAO_EFICAZ");

        // Confere (o caso com as duas fechadas; com alguma não fechada, verificacao.routes.test.ts, B4)
        expect(await chamar(editor, "GET", `/investigacoes/${investigacao.id}`, 200)).toMatchObject({
            estado: "ABERTO",
        });
        expect(await chamar(editor, "GET", `/nc/${nc.id}`, 200)).toMatchObject({ estado: "ABERTO" });
    });
});
