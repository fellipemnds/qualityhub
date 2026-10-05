import { describe, expect, it } from "vitest";
import { app } from "../../app.js";
import { prisma } from "../../compartilhado/prisma/cliente.js";
import { abrirDuasConexoes, chamar, perfisDeFora } from "../../testes/cenarios.js";
import { criarUsuario } from "../../testes/fabricas.js";

describe("POST /auth/login", () => {
    it("responde 204 e o cookie de sessão, sem o token no corpo", async () => {
        // Prepara
        const {
            usuario: { email },
            senha,
        } = await criarUsuario();

        // Chama
        const resultado = await app.inject({ method: "POST", url: "/auth/login", payload: { email, senha } });

        const cookie = resultado.cookies.find((c) => c.name === "qh_sessao");

        // Confere
        expect(resultado.statusCode).toBe(204);
        expect(resultado.body).toBe("");
        expect(cookie).toMatchObject({
            httpOnly: true,
            secure: true,
            sameSite: "Strict",
            path: "/",
        });
        expect(cookie?.maxAge).toBeUndefined();
        const { iat, exp } = app.jwt.verify<{ iat: number; exp: number }>(cookie?.value ?? "");
        expect(exp - iat).toBe(12 * 60 * 60);
    });

    it("responde 204 e o cookie com manter conectado ativado, com o cookie valendo 30 dias", async () => {
        // Prepara
        const {
            usuario: { email },
            senha,
        } = await criarUsuario();

        // Chama
        const resultado = await app.inject({
            method: "POST",
            url: "/auth/login",
            payload: { email, senha, manterConectado: true },
        });

        const cookie = resultado.cookies.find((c) => c.name === "qh_sessao");

        // Confere
        expect(resultado.statusCode).toBe(204);
        expect(resultado.body).toBe("");
        expect(cookie).toMatchObject({
            httpOnly: true,
            secure: true,
            sameSite: "Strict",
            path: "/",
        });
        expect(cookie?.maxAge).toBe(30 * 24 * 60 * 60);
        const { iat, exp } = app.jwt.verify<{ iat: number; exp: number }>(cookie?.value ?? "");
        expect(exp - iat).toBe(30 * 24 * 60 * 60);
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

describe("POST /auth/definir-senha", () => {
    // O admin cria a pessoa pela API e devolve o convite
    async function convidar() {
        const { admin } = await perfisDeFora();
        const email = "convidada@teste.com";
        const { tokenConvite } = await chamar(admin, "POST", "/usuarios", 201, {
            nome: "Pessoa Convidada",
            email,
            papeis: ["EDITOR"],
            setorId: admin.usuario.setorId,
        });
        return { email, tokenConvite };
    }

    it("define a senha com o convite, e o login passa a funcionar", async () => {
        // Prepara
        const { email, tokenConvite } = await convidar();
        const senha = "SenhaDaConvidada123!";

        // Chama
        const resultado = await app.inject({
            method: "POST",
            url: "/auth/definir-senha",
            payload: { token: tokenConvite, senha },
        });

        // Confere
        expect(resultado.statusCode).toBe(204);
        const login = await app.inject({ method: "POST", url: "/auth/login", payload: { email, senha } });
        expect(login.statusCode).toBe(204);
    });

    it("guarda a senha com bcrypt de custo 12", async () => {
        // Prepara
        const { email, tokenConvite } = await convidar();

        // Chama
        await app.inject({
            method: "POST",
            url: "/auth/definir-senha",
            payload: { token: tokenConvite, senha: "SenhaDaConvidada123!" },
        });

        // Confere: o custo fica gravado no próprio hash ("$2b$12$..."); sem este teste, voltar para 10 passaria
        const usuario = await prisma.usuario.findUniqueOrThrow({ where: { email } });
        expect(usuario.senhaHash?.startsWith("$2b$12$")).toBe(true);
    });

    it("recusa o convite já usado", async () => {
        // Prepara
        const { tokenConvite } = await convidar();
        const payload = { token: tokenConvite, senha: "SenhaDaConvidada123!" };
        await app.inject({ method: "POST", url: "/auth/definir-senha", payload });

        // Chama
        const resultado = await app.inject({ method: "POST", url: "/auth/definir-senha", payload });

        // Confere
        expect(resultado.statusCode).toBe(400);
        expect(resultado.json()).toEqual({ mensagem: "Este token já foi utilizado" });
    });

    // B19 (esquema-backend.md §7): as duas leem o convite sem uso antes de qualquer uma marcar, e as duas definem a senha
    it("o mesmo convite usado duas vezes ao mesmo tempo: só uma senha é definida (B19)", async () => {
        // Prepara
        const { tokenConvite } = await convidar();

        // Chama: as duas de uma vez, cada uma com uma senha
        const definir = (senha: string) =>
            app.inject({ method: "POST", url: "/auth/definir-senha", payload: { token: tokenConvite, senha } });
        await abrirDuasConexoes();
        const respostas = await Promise.all([definir("SenhaDaPrimeira123!"), definir("SenhaDaSegunda123!")]);

        // Confere: uma passa, a outra é recusada como convite já usado, e a senha foi definida uma vez só
        expect(respostas.map((r) => r.statusCode).sort()).toEqual([204, 400]);
        expect(await prisma.auditoria.count({ where: { acao: "DEFINIR_SENHA" } })).toBe(1);
    });
});
