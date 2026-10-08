import bcrypt from "bcrypt";
import { afterEach, describe, expect, it, vi } from "vitest";
import { app } from "../../app.js";
import { prisma } from "../../compartilhado/prisma/cliente.js";
import { abrirDuasConexoes, chamar, perfisDeFora } from "../../testes/cenarios.js";
import { criarUsuario, loginComo } from "../../testes/fabricas.js";

describe("POST /auth/login", () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("responde 204 e o cookie de sessão, sem o token no corpo", async () => {
        // Prepara
        const {
            usuario: { email },
            senha,
        } = await criarUsuario();

        // Chama
        const resultado = await app.inject({ method: "POST", url: "/api/auth/login", payload: { email, senha } });

        const cookie = resultado.cookies.find((c) => c.name === "qh_sessao");

        // Confere
        expect(resultado.statusCode).toBe(204);
        expect(resultado.body).toBe("");
        expect(cookie).toMatchObject({
            httpOnly: true,
            secure: true,
            sameSite: "Strict",
            path: "/api",
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
            url: "/api/auth/login",
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
            path: "/api",
        });
        expect(cookie?.maxAge).toBe(30 * 24 * 60 * 60);
        const { iat, exp } = app.jwt.verify<{ iat: number; exp: number }>(cookie?.value ?? "");
        expect(exp - iat).toBe(30 * 24 * 60 * 60);
    });

    it("registra o login na auditoria", async () => {
        // Prepara
        const { usuario, senha } = await criarUsuario({ email: "auditado@teste.com" });

        // Chama
        await app.inject({ method: "POST", url: "/api/auth/login", payload: { email: usuario.email, senha } });

        // Confere
        expect(await prisma.auditoria.findMany({ where: { entidadeId: usuario.id, acao: "LOGIN" } })).toMatchObject([
            { entidade: "USUARIO", usuarioId: usuario.id },
        ]);
    });

    it("recusa o usuário inativo com a mesma resposta da senha errada (RN-38)", async () => {
        // Prepara
        const { usuario, senha } = await criarUsuario({ email: "inativo@teste.com" });
        await prisma.usuario.update({ where: { id: usuario.id }, data: { desativadoEm: new Date() } });

        // Chama
        const resultado = await app.inject({
            method: "POST",
            url: "/api/auth/login",
            payload: { email: usuario.email, senha },
        });

        // Confere: nada diz que a conta existe nem que está inativa
        expect(resultado.statusCode).toBe(401);
        expect(resultado.json()).toEqual({ mensagem: "Credenciais inválidas" });
    });

    it("e-mail inexistente também passa pelo bcrypt, para a resposta levar o mesmo tempo (auditoria L1)", async () => {
        // Prepara: medir o tempo daria um teste instável; o que importa é a comparação acontecer
        const comparar = vi.spyOn(bcrypt, "compare");

        // Chama
        const resultado = await app.inject({
            method: "POST",
            url: "/api/auth/login",
            payload: { email: "ninguem@teste.com", senha: "QualquerSenha123!" },
        });

        // Confere
        expect(resultado.statusCode).toBe(401);
        expect(comparar).toHaveBeenCalledTimes(1);
    });

    it("a 6ª tentativa no mesmo minuto, do mesmo IP e e-mail, recebe 429", async () => {
        // Prepara: um IP só deste teste (o loginComo usa um IP por login, para o limite não pegar os outros testes)
        const tentar = (email: string) =>
            app.inject({
                method: "POST",
                url: "/api/auth/login",
                remoteAddress: "10.99.99.99",
                payload: { email, senha: "SenhaErrada123!" },
            });
        for (let i = 0; i < 5; i++) {
            expect((await tentar("insistente@teste.com")).statusCode).toBe(401);
        }

        // Chama
        const sexta = await tentar("insistente@teste.com");

        // Confere: barrada, e o limite é por e-mail: outro e-mail do mesmo IP ainda tenta
        expect(sexta.statusCode).toBe(429);
        expect(sexta.json()).toEqual({ mensagem: "Muitas tentativas, aguarde um minuto." });
        expect((await tentar("outra@teste.com")).statusCode).toBe(401);
    });

    it("responde 401 e mensagem quando senha está errada", async () => {
        // Prepara
        const {
            usuario: { email },
        } = await criarUsuario();

        // Chama
        const resultado = await app.inject({
            method: "POST",
            url: "/api/auth/login",
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
            url: "/api/auth/login",
            payload: { email, senha: "senha-qualquer" },
        });

        // Confere
        expect(resultado.statusCode).toBe(401);
        expect(resultado.json()).toEqual({ mensagem: "Credenciais inválidas" });
    });
});

describe("POST /auth/definir-senha", () => {
    // O bcrypt só usa os primeiros 72 bytes, e letra com acento ocupa 2: 36 "á" cabem, 37 não, mesmo tendo menos de 72
    // caracteres. Sem o teto, duas senhas que começam igual valeriam a mesma
    it("teto da senha em bytes: 37 letras com acento (74 bytes) são recusadas, 36 (72 bytes) passam (L4)", async () => {
        // Prepara (o convite não existe: quem passa da validação da senha recebe o erro do convite)
        const definir = (senha: string) =>
            app.inject({ method: "POST", url: "/api/auth/definir-senha", payload: { token: "f".repeat(64), senha } });

        // Chama
        const longaDemais = await definir("á".repeat(37));
        const noTeto = await definir("á".repeat(36));

        // Confere: a de 74 bytes para no campo senha; a de 72 passa e para no convite
        expect(longaDemais.json()).toMatchObject({
            mensagem: "Dados inválidos",
            error: expect.arrayContaining([expect.objectContaining({ instancePath: "/senha" })]),
        });
        expect(noTeto.json()).toEqual({ mensagem: "Não foi possível processar a solicitação." });
    });

    // O admin cria a pessoa pela API e devolve o convite
    async function convidar() {
        const { admin } = await perfisDeFora();
        const email = "convidada@teste.com";
        const { tokenConvite } = await chamar(admin, "POST", "/api/usuarios", 201, {
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
            url: "/api/auth/definir-senha",
            payload: { token: tokenConvite, senha },
        });

        // Confere
        expect(resultado.statusCode).toBe(204);
        const login = await app.inject({ method: "POST", url: "/api/auth/login", payload: { email, senha } });
        expect(login.statusCode).toBe(204);
    });

    it("guarda a senha com bcrypt de custo 12", async () => {
        // Prepara
        const { email, tokenConvite } = await convidar();

        // Chama
        await app.inject({
            method: "POST",
            url: "/api/auth/definir-senha",
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
        await app.inject({ method: "POST", url: "/api/auth/definir-senha", payload });

        // Chama
        const resultado = await app.inject({ method: "POST", url: "/api/auth/definir-senha", payload });

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
            app.inject({ method: "POST", url: "/api/auth/definir-senha", payload: { token: tokenConvite, senha } });
        await abrirDuasConexoes();
        const respostas = await Promise.all([definir("SenhaDaPrimeira123!"), definir("SenhaDaSegunda123!")]);

        // Confere: uma passa, a outra é recusada como convite já usado, e a senha foi definida uma vez só
        expect(respostas.map((r) => r.statusCode).sort()).toEqual([204, 400]);
        expect(await prisma.auditoria.count({ where: { acao: "DEFINIR_SENHA" } })).toBe(1);
    });
});

describe("POST /auth/logout", () => {
    it("responde 204 e apaga o cookie de sessão deste navegador", async () => {
        // Prepara
        const editor = await loginComo("editor");

        // Chama
        const resultado = await app.inject({ method: "POST", url: "/api/auth/logout", headers: editor.autenticacao });

        // Confere: o cookie volta vazio e já vencido, o que faz o navegador apagá-lo
        expect(resultado.statusCode).toBe(204);
        const cookie = resultado.cookies.find((c) => c.name === "qh_sessao");
        expect(cookie).toMatchObject({ value: "", path: "/api" });
        expect(cookie?.expires?.getTime()).toBeLessThanOrEqual(Date.now());
    });
});

describe("POST /auth/sair-de-todos", () => {
    it("derruba toda sessão já emitida, e um login novo volta a funcionar", async () => {
        // Prepara: o login e o pedido no mesmo instante; a versão das sessões não depende do relógio (B27)
        const editor = await loginComo("editor");

        // Chama
        await chamar(editor, "POST", "/api/auth/sair-de-todos", 204);

        // Confere: a sessão antiga cai, um login novo entra, e o pedido fica na auditoria
        await chamar(editor, "GET", "/api/nc", 401);
        const login = await app.inject({
            method: "POST",
            url: "/api/auth/login",
            payload: { email: editor.usuario.email, senha: "SenhaDeTeste123!" },
        });
        const cookie = login.cookies.find((c) => c.name === "qh_sessao");
        await chamar({ ...editor, autenticacao: { cookie: `qh_sessao=${cookie?.value}` } }, "GET", "/api/nc", 200);
        expect(
            await prisma.auditoria.findMany({ where: { entidadeId: editor.usuario.id, acao: "SAIR_DE_TODOS" } }),
        ).toMatchObject([{ entidade: "USUARIO", usuarioId: editor.usuario.id }]);
    });
});

describe("GET /auth/eu", () => {
    it("devolve quem está logado, com a tela inicial e as que pode escolher, sem a senha", async () => {
        // Prepara
        const gerente = await loginComo("gerente");

        // Chama
        const eu = await chamar(gerente, "GET", "/api/auth/eu", 200);

        // Confere
        expect(eu).toEqual({
            id: gerente.usuario.id,
            nome: "gerente",
            email: "gerente@teste.com",
            setor: { id: gerente.usuario.setorId, nome: "Qualidade" },
            papeis: expect.arrayContaining(["EDITOR", "APROVADOR", "GERENTE"]),
            telaInicial: "PENDENCIAS",
            telasIniciais: ["PENDENCIAS", "NCS", "RELATORIOS"],
        });
    });
});

describe("PATCH /auth/eu", () => {
    it("grava a tela inicial escolhida, e null volta para o padrão", async () => {
        // Prepara
        const gerente = await loginComo("gerente");

        // Chama e confere: a escolha vale, inclusive num GET depois
        expect(await chamar(gerente, "PATCH", "/api/auth/eu", 200, { telaInicial: "RELATORIOS" })).toMatchObject({
            telaInicial: "RELATORIOS",
        });
        expect(await chamar(gerente, "GET", "/api/auth/eu", 200)).toMatchObject({ telaInicial: "RELATORIOS" });
        expect(await chamar(gerente, "PATCH", "/api/auth/eu", 200, { telaInicial: null })).toMatchObject({
            telaInicial: "PENDENCIAS",
        });
    });

    it("recusa com 400 uma tela que os papéis não permitem", async () => {
        // Prepara
        const visualizador = await loginComo("visualizador");

        // Chama
        const resposta = await chamar(visualizador, "PATCH", "/api/auth/eu", 400, { telaInicial: "USUARIOS" });

        // Confere: nada gravado
        expect(resposta.mensagem).toContain("tela inicial");
        const usuario = await prisma.usuario.findUniqueOrThrow({ where: { id: visualizador.usuario.id } });
        expect(usuario.telaInicial).toBeNull();
    });
});
