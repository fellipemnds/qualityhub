import { describe, expect, it } from "vitest";
import { app } from "../../../app.js";
import { loginComo } from "../../../testes/fabricas.js";

describe("POST /nc", () => {
    it("cria um rascunho de nc em nome do editor", async () => {
        // Prepara
        const { token, usuario } = await loginComo("editor");
        const titulo = "NC de testes";

        // Chama
        const resultado = await app.inject({
            method: "POST",
            url: "/nc",
            headers: { authorization: `Bearer ${token}` },
            body: { titulo },
        });

        // Confere
        expect(resultado.statusCode).toBe(201);
        expect(resultado.json()).toMatchObject({
            tipo: "NAO_CONFORMIDADE",
            estado: "RASCUNHO",
            titulo,
            criadoPorId: usuario.id,
        });
    });
});
