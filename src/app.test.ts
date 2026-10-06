import { describe, expect, it } from "vitest";
import { app } from "./app.js";
import { prisma } from "./compartilhado/prisma/cliente.js";
import { loginComo } from "./testes/fabricas.js";

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
            url: "/api/auth/login",
            headers: {
                "content-type": "application/json",
            },
            payload: "{quebrado",
        });

        // Confere
        expect(resposta.statusCode).toBe(400);
        expect(resposta.json()).toEqual({ mensagem: expect.any(String) });
    });

    it("corpo text/plain responde 415 e a ação não é executada (B20)", async () => {
        // Prepara
        const editor = await loginComo("editor");

        // Chama
        const resposta = await app.inject({
            method: "POST",
            url: "/api/auth/sair-de-todos",
            headers: {
                ...editor.autenticacao,
                "content-type": "text/plain",
            },
            payload: "oi",
        });

        // Confere
        expect(resposta.statusCode).toBe(415);
        expect(resposta.json()).toEqual({ mensagem: expect.any(String) });
        expect(await prisma.auditoria.findMany({ where: { acao: "SAIR_DE_TODOS" } })).toEqual([]);
    });
});
