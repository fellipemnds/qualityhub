import { describe, expect, it } from "vitest";
import { chamar, executarAcao, ncProntaParaFechar } from "../../../testes/cenarios.js";
import { loginComo } from "../../../testes/fabricas.js";

const ID_INEXISTENTE = "00000000-0000-0000-0000-000000000000";

describe("GET /verificacoes/:id", () => {
    it("responde 404, e não 500, quando a verificação não existe", async () => {
        // Prepara
        const editor = await loginComo("editor");

        // Chama
        const resposta = await chamar(editor, "GET", `/verificacoes/${ID_INEXISTENTE}`, 404);

        // Confere
        expect(resposta).toEqual({ mensagem: "Item não encontrado." });
    });
});

describe("GET /verificacoes", () => {
    it("filtra pela ação corretiva e por estado", async () => {
        // Prepara (a verificação nasce ABERTA ao finalizar a execução)
        const cenario = await ncProntaParaFechar();
        const { acao, verificacao } = await executarAcao(cenario);
        const { editor } = cenario;

        // Chama
        const daAcao = await chamar(editor, "GET", `/verificacoes?acaoCorretivaId=${acao.id}`, 200);
        const deOutraAcao = await chamar(editor, "GET", `/verificacoes?acaoCorretivaId=${ID_INEXISTENTE}`, 200);
        const fechadas = await chamar(editor, "GET", `/verificacoes?acaoCorretivaId=${acao.id}&estado=FECHADO`, 200);

        // Confere
        expect(daAcao.map((item: { id: string }) => item.id)).toEqual([verificacao.id]);
        expect(deOutraAcao).toEqual([]);
        expect(fechadas).toEqual([]);
    });
});
