import { describe, expect, it } from "vitest";
import { chamar } from "../../../testes/cenarios.js";
import { loginComo } from "../../../testes/fabricas.js";

describe("GET /verificacoes/:id", () => {
    it("responde 404, e não 500, quando a verificação não existe", async () => {
        // Prepara
        const editor = await loginComo("editor");

        // Chama
        const resposta = await chamar(editor, "GET", "/verificacoes/00000000-0000-0000-0000-000000000000", 404);

        // Confere
        expect(resposta).toEqual({ mensagem: "Item não encontrado." });
    });
});
