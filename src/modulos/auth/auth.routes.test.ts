import { describe, expect, it } from "vitest";
import { app } from "../../app.js";
import { criarUsuario } from "../../testes/fabricas.js";

describe("POST /auth/login", () => {
    it("responde 200 e token se login é bem sucedido", async () => {
        // Prepara
        const {
            usuario: { email },
            senha,
        } = await criarUsuario();

        // Chama
        const resultado = await app.inject({ method: "POST", url: "/auth/login", payload: { email, senha } });

        // Confere
        expect(resultado.statusCode).toBe(200);
        expect(resultado.json()).toEqual({ token: expect.any(String) });
    });

    it("responde 401 e mensagem quando senha está errada", async () => {
        // Prepara
        const {
            usuario: { email },
        } = await criarUsuario();

        // Chama
        const resultado = await app.inject({
            method: "POST",
            url: "/auth/login",
            payload: { email, senha: "testando-a-senha-errada" },
        });

        // Confere
        expect(resultado.statusCode).toBe(401);
        expect(resultado.json()).toEqual({ mensagem: "Credenciais inválidas" });
    });

    it("responde 401 e mensagem quando o usuário ainda não definiu senha", async () => {
        // Prepara
        const {
            usuario: { email },
        } = await criarUsuario({ senha: null });

        // Chama
        const resultado = await app.inject({
            method: "POST",
            url: "/auth/login",
            payload: { email, senha: "senha-qualquer" },
        });

        // Confere
        expect(resultado.statusCode).toBe(401);
        expect(resultado.json()).toEqual({ mensagem: "Credenciais inválidas" });
    });
});
