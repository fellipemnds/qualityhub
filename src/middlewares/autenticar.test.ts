import { describe, expect, it } from "vitest";
import { app } from "../app.js";
import { prisma } from "../compartilhado/prisma/cliente.js";
import { chamar } from "../testes/cenarios.js";
import { loginComo } from "../testes/fabricas.js";

describe("autenticar", () => {
    it("responde 401 sem o cookie da sessão", async () => {
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
            headers: { cookie: "qh_sessao=token.invalido.aqui" },
        });

        // Confere
        expect(resposta.statusCode).toBe(401);
        expect(resposta.json()).toEqual({ mensagem: "401 Unauthorized" });
    });

    it("papel revogado deixa de valer na hora (B7)", async () => {
        // Prepara
        const admin = await loginComo("admin");
        await prisma.usuarioPapel.deleteMany({ where: { usuarioId: admin.usuario.id } });

        // Chama
        await chamar(admin, "POST", "/usuarios", 403, {
            nome: "Pessoa nova",
            email: "nova@teste.com",
            papeis: ["EDITOR"],
            setorId: admin.usuario.setorId,
        });
    });

    it("usuário inativo recebe 401", async () => {
        // Prepara
        const editor = await loginComo("editor");
        await prisma.usuario.update({ where: { id: editor.usuario.id }, data: { desativadoEm: new Date() } });

        // Chama
        await chamar(editor, "GET", "/nc", 401);
    });

    it("sessão emitida antes do sessaoValidaDesde recebe 401 (sair de todos)", async () => {
        // Prepara
        const editor = await loginComo("editor");
        await prisma.usuario.update({
            where: { id: editor.usuario.id },
            data: { sessaoValidaDesde: new Date(Date.now() + 5000) },
        });

        // Chama
        await chamar(editor, "GET", "/nc", 401);
    });

    it("token válido no cabeçalho Authorization é recusado: só o cookie vale", async () => {
        // Prepara
        const editor = await loginComo("editor");

        // Chama
        const resposta = await app.inject({
            method: "GET",
            url: "/nc",
            headers: { authorization: `Bearer ${editor.token}` },
        });

        // Confere
        expect(resposta.statusCode).toBe(401);
    });
});
