import { describe, expect, it } from "vitest";
import { app } from "../app.js";
import { prisma } from "../compartilhado/prisma/cliente.js";
import { chamar } from "../testes/cenarios.js";
import { loginComo } from "../testes/fabricas.js";

describe("autenticar", () => {
    it("responde 401 sem o cookie da sessão", async () => {
        // Chama
        const resposta = await app.inject({ method: "GET", url: "/api/nc" });

        // Confere
        expect(resposta.statusCode).toBe(401);
        expect(resposta.json()).toEqual({ mensagem: "401 Unauthorized" });
    });

    it("responde 401 com um token inválido", async () => {
        // Chama
        const resposta = await app.inject({
            method: "GET",
            url: "/api/nc",
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
        await chamar(admin, "POST", "/api/usuarios", 403, {
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
        await chamar(editor, "GET", "/api/nc", 401);
    });

    it("sessão com a versão de antes recebe 401 (sair de todos)", async () => {
        // Prepara
        const editor = await loginComo("editor");
        await prisma.usuario.update({
            where: { id: editor.usuario.id },
            data: { versaoSessao: { increment: 1 } },
        });

        // Chama
        await chamar(editor, "GET", "/api/nc", 401);
    });

    it("um login em voo durante a derrubada das sessões não sobrevive a ela (B27)", async () => {
        // Prepara: o login leu a versão da sessão antes do "sair de todos" e só assina o token depois dele (o bcrypt leva
        // ~250 ms). Assinar à mão, depois da derrubada e com a versão de antes, é exatamente esse token
        const editor = await loginComo("editor");
        await chamar(editor, "POST", "/api/auth/sair-de-todos", 204);
        const tokenEmVoo = app.jwt.sign({ id: editor.usuario.id, sv: 0 });

        // Chama
        const resposta = await app.inject({
            method: "GET",
            url: "/api/nc",
            headers: { cookie: `qh_sessao=${tokenEmVoo}` },
        });

        // Confere
        expect(resposta.statusCode).toBe(401);
    });

    it("token sem a versão da sessão é recusado (B27)", async () => {
        // Prepara
        const editor = await loginComo("editor");
        // O tipo do token exige a versão; o token de antes da B27 não a tinha, e é ele que este teste monta
        const semVersao = app.jwt.sign({ id: editor.usuario.id } as unknown as { id: string; sv: number });

        // Chama
        const resposta = await app.inject({
            method: "GET",
            url: "/api/nc",
            headers: { cookie: `qh_sessao=${semVersao}` },
        });

        // Confere
        expect(resposta.statusCode).toBe(401);
    });

    it("token válido no cabeçalho Authorization é recusado: só o cookie vale", async () => {
        // Prepara
        const editor = await loginComo("editor");

        // Chama
        const resposta = await app.inject({
            method: "GET",
            url: "/api/nc",
            headers: { authorization: `Bearer ${editor.token}` },
        });

        // Confere
        expect(resposta.statusCode).toBe(401);
    });
});
