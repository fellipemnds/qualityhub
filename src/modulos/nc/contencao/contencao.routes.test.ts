import { describe, expect, it } from "vitest";
import { chamar, ncPublicada } from "../../../testes/cenarios.js";
import { loginComo } from "../../../testes/fabricas.js";

const ID_INEXISTENTE = "00000000-0000-0000-0000-000000000000";

describe("POST /nc/:naoConformidadeId/contencoes", () => {
    it("responde 404 quando a NC não existe", async () => {
        // Prepara
        const editor = await loginComo("editor");

        // Chama
        const resposta = await chamar(editor, "POST", `/nc/${ID_INEXISTENTE}/contencoes`, 404, {
            descricao: "Contenção de uma NC que não existe.",
        });

        // Confere
        expect(resposta).toEqual({ mensagem: "A Não Conformidade não existe ou não foi encontrada" });
    });
});

describe("PATCH /contencoes/:id", () => {
    it("recusa disposição fora da lista", async () => {
        // Prepara
        const { editor, nc } = await ncPublicada();
        const contencao = await chamar(editor, "POST", `/nc/${nc.id}/contencoes`, 201, {
            descricao: "Retrabalho realizado na peça com defeito.",
        });

        // Chama
        const resposta = await chamar(editor, "PATCH", `/contencoes/${contencao.id}`, 400, {
            disposicao: "XPTO_INVALIDO",
        });

        // Confere
        expect(resposta).toMatchObject({
            mensagem: "Dados inválidos",
            error: expect.arrayContaining([expect.objectContaining({ instancePath: "/disposicao" })]),
        });
    });
});

describe("GET /contencoes", () => {
    it("recusa filtro de estado fora da lista", async () => {
        // Prepara
        const editor = await loginComo("editor");

        // Chama
        const resposta = await chamar(editor, "GET", "/contencoes?estado=XPTO_INVALIDO", 400);

        // Confere
        expect(resposta).toMatchObject({
            mensagem: "Dados inválidos",
            error: expect.arrayContaining([expect.objectContaining({ instancePath: "/estado" })]),
        });
    });
});
