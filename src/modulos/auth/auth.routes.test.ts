import { describe, expect, it } from "vitest";
import { app } from "../../app.js";
import { chamar, perfisDeFora } from "../../testes/cenarios.js";
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
        expect(login.statusCode).toBe(200);
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
});
