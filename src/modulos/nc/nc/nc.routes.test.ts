import { describe, expect, it } from "vitest";
import { app } from "../../../app.js";
import { chamar, daquiA, ncProntaParaFechar, ncPublicada } from "../../../testes/cenarios.js";
import { loginComo } from "../../../testes/fabricas.js";

describe("POST /nc", () => {
    it("cria um rascunho de nc em nome do editor", async () => {
        // Prepara
        const { autenticacao, usuario } = await loginComo("editor");
        const titulo = "NC de testes";

        // Chama
        const resultado = await app.inject({
            method: "POST",
            url: "/nc",
            headers: autenticacao,
            body: { titulo },
        });

        // Confere
        expect(resultado.statusCode).toBe(201);
        expect(resultado.json()).toMatchObject({
            tipo: "NAO_CONFORMIDADE",
            estado: "RASCUNHO",
            titulo,
            criadoPorId: usuario.id,
        });
    });

    it("recusa título com menos de 5 caracteres", async () => {
        // Prepara
        const editor = await loginComo("editor");

        // Chama
        const resposta = await chamar(editor, "POST", "/nc", 400, { titulo: "NC" });

        // Confere
        expect(resposta).toMatchObject({
            mensagem: "Dados inválidos",
            error: expect.arrayContaining([expect.objectContaining({ instancePath: "/titulo" })]),
        });
    });

    it("recusa data de detecção no futuro", async () => {
        // Prepara
        const editor = await loginComo("editor");

        // Chama
        const resposta = await chamar(editor, "POST", "/nc", 400, { titulo: "NC de testes", detectadoEm: daquiA(1) });

        // Confere
        expect(resposta).toMatchObject({
            mensagem: "Dados inválidos",
            error: expect.arrayContaining([expect.objectContaining({ instancePath: "/detectadoEm" })]),
        });
    });
});

describe("POST /nc/:id/submeter", () => {
    it("recusa enquanto não há classificação fechada (RN-21)", async () => {
        // Prepara
        const { editor, nc } = await ncPublicada();

        // Chama
        const resposta = await chamar(editor, "POST", `/nc/${nc.id}/submeter`, 409);

        // Confere
        expect(resposta.mensagem).toContain("Classificação FECHADA");
    });

    it("recusa sem os campos de fechamento, mesmo com a RN-21 satisfeita", async () => {
        // Prepara
        const { editor, nc } = await ncProntaParaFechar();

        // Chama
        const resposta = await chamar(editor, "POST", `/nc/${nc.id}/submeter`, 400);

        // Confere
        expect(resposta).toMatchObject({
            mensagem: "Dados inválidos",
            error: expect.arrayContaining([
                expect.objectContaining({ path: ["riscosRevisados"] }),
                expect.objectContaining({ path: ["mudancasSGQ"] }),
            ]),
        });
    });
});
