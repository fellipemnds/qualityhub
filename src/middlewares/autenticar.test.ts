import { describe, expect, it } from "vitest";
import { app } from "../app.js";

describe("autenticar", () => {
    it("responde 401 sem o cabeçalho de autenticação", async () => {
        // Chama
        const resposta = await app.inject({ method: "GET", url: "/nc" });

        // Confere
        expect(resposta.statusCode).toBe(401);
        expect(resposta.json()).toEqual({ mensagem: "401 Unauthorized" });
    });

    it("responde 401 com um token inválido", async () => {
        // Chama
        const resposta = await app.inject({
            method: "GET",
            url: "/nc",
            headers: { authorization: "Bearer token.invalido.aqui" },
        });

        // Confere
        expect(resposta.statusCode).toBe(401);
        expect(resposta.json()).toEqual({ mensagem: "401 Unauthorized" });
    });
});
