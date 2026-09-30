import { afterEach, describe, expect, it, vi } from "vitest";
import { app } from "../../../app.js";
import { chamar, daquiA, ncProntaParaFechar, ncPublicada, perfisDeFora } from "../../../testes/cenarios.js";
import { loginComo } from "../../../testes/fabricas.js";
import { levarNCAte } from "../../../testes/levar-ate/nc.js";

const ID_INEXISTENTE = "00000000-0000-0000-0000-000000000000";

afterEach(() => {
    vi.useRealTimers();
});

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

    it("cria uma nc depois do servidor ativado há muito tempo (B9)", async () => {
        // Prepara
        vi.useFakeTimers({ toFake: ["Date"] });
        vi.setSystemTime(daquiA(3));
        const editor = await loginComo("editor");

        // Chama
        const ontem = daquiA(-1);
        const resposta = await chamar(editor, "POST", "/nc", 201, { titulo: "NC de testes", detectadoEm: ontem });

        // Confere
        expect(resposta).toMatchObject({ estado: "RASCUNHO", detectadoEm: ontem });
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

describe("GET /nc", () => {
    it("filtra por estado", async () => {
        // Prepara (a NC do ncPublicada está ABERTA; a segunda fica em rascunho)
        const { editor, nc } = await ncPublicada();
        await chamar(editor, "POST", "/nc", 201, { titulo: "NC que fica em rascunho" });

        // Chama
        const resposta = await chamar(editor, "GET", "/nc?estado=ABERTO", 200);

        // Confere
        expect(resposta.itensDaPagina.map((item: { id: string }) => item.id)).toEqual([nc.id]);
    });
});

describe("GET /nc/:id", () => {
    it("o visualizador lê a NC", async () => {
        // Prepara
        const { nc } = await ncPublicada();
        const { visualizador } = await perfisDeFora();

        // Chama
        const resposta = await chamar(visualizador, "GET", `/nc/${nc.id}`, 200);

        // Confere
        expect(resposta).toMatchObject({ id: nc.id, estado: "ABERTO" });
    });
});

describe("DELETE /nc/:id", () => {
    it("exclui o rascunho de verdade (RN-09)", async () => {
        // Prepara
        const editor = await loginComo("editor");
        const nc = await chamar(editor, "POST", "/nc", 201, { titulo: "NC que vai ser excluída" });

        // Chama
        await chamar(editor, "DELETE", `/nc/${nc.id}`, 204);

        // Confere
        await chamar(editor, "GET", `/nc/${nc.id}`, 404);
    });

    it("responde 404 quando a NC não existe", async () => {
        const editor = await loginComo("editor");

        await chamar(editor, "DELETE", `/nc/${ID_INEXISTENTE}`, 404);
    });
});

describe("POST /nc/:id/publicar", () => {
    it("responde 404 quando a NC não existe", async () => {
        const editor = await loginComo("editor");

        await chamar(editor, "POST", `/nc/${ID_INEXISTENTE}/publicar`, 404);
    });
});

describe("POST /nc/:id/reabrir", () => {
    it("qualquer APROVADOR reabre, sem ser o designado (RN-17)", async () => {
        // Prepara (o qa tem o papel APROVADOR e não está na NC)
        const { qa, nc } = await levarNCAte("FECHADO");

        // Chama
        const resposta = await chamar(qa, "POST", `/nc/${nc.id}/reabrir`, 200, {
            motivo: "Reincidência do vazamento na linha 2.",
        });

        // Confere
        expect(resposta).toMatchObject({ estado: "ABERTO" });
    });

    // B18 (esquema-backend.md §7): o motivo em branco é recusado, mas com 409 e mensagem de estado. No conserto (A3),
    // trocar para it.
    it.fails("recusa motivo só com espaços (RN-05)", async () => {
        // Prepara
        const { aprovador, editor, nc } = await levarNCAte("FECHADO");

        // Chama
        await chamar(aprovador, "POST", `/nc/${nc.id}/reabrir`, 400, { motivo: "   " });

        // Confere
        expect(await chamar(editor, "GET", `/nc/${nc.id}`, 200)).toMatchObject({ estado: "FECHADO" });
    });
});
