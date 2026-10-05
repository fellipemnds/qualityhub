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
