import { describe, expect, it } from "vitest";
import { app } from "./app.js";

describe("GET /", () => {
    it("responde que o servidor está online", async () => {
        // Chama
        const resposta = await app.inject({ method: "GET", url: "/" });

        // Confere
        expect(resposta.statusCode).toBe(200);
        expect(resposta.json()).toEqual({ status: "Servidor online" });
    });
});

describe("Cabeçalhos de segurança (auditoria R3)", () => {
    it("toda resposta sai com os cabeçalhos do helmet", async () => {
        // Chama
        const resposta = await app.inject({ method: "GET", url: "/" });

        // Confere: os que mais importam para a API e para os anexos que vêm no C5
        expect(resposta.headers).toMatchObject({
            "x-content-type-options": "nosniff",
            "x-frame-options": "SAMEORIGIN",
            "strict-transport-security": expect.stringContaining("max-age="),
            "content-security-policy": expect.stringContaining("frame-ancestors 'self'"),
        });
    });
});

describe("Corpo da requisição (B20, B21)", () => {
    it("JSON malformado responde 400, não 500 (B21)", async () => {
        // Chama
        const resposta = await app.inject({
            method: "POST",
            url: "/auth/login",
            headers: {
                "content-type": "application/json",
            },
            payload: "{quebrado",
        });

        // Confere
        expect(resposta.statusCode).toBe(400);
        expect(resposta.json()).toEqual({ mensagem: expect.any(String) });
    });
});
