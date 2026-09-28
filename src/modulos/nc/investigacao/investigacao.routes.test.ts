import { describe, expect, it } from "vitest";
import { chamar, ncPublicada } from "../../../testes/cenarios.js";

describe("PATCH /investigacoes/:id", () => {
    it("recusa método fora da lista (só A3_SPS)", async () => {
        // Prepara
        const { editor, nc } = await ncPublicada();
        const investigacao = await chamar(editor, "POST", `/nc/${nc.id}/investigacoes`, 201, {
            realProblema: "Vedação da bomba hidráulica com desgaste prematuro.",
        });

        // Chama
        const resposta = await chamar(editor, "PATCH", `/investigacoes/${investigacao.id}`, 400, {
            metodo: "SEIS_SIGMA",
        });

        // Confere
        expect(resposta).toMatchObject({
            mensagem: "Dados inválidos",
            error: expect.arrayContaining([expect.objectContaining({ instancePath: "/metodo" })]),
        });
    });
});

describe("POST /investigacoes/:id/submeter", () => {
    it("recusa sem causa raiz preenchida (RN-24)", async () => {
        // Prepara
        const { editor, gerente, aprovador, nc } = await ncPublicada();
        const investigacao = await chamar(editor, "POST", `/nc/${nc.id}/investigacoes`, 201, {
            realProblema: "Vedação da bomba hidráulica com desgaste prematuro.",
        });
        await chamar(editor, "POST", `/investigacoes/${investigacao.id}/publicar`, 200);
        await chamar(gerente, "PUT", `/registros/${investigacao.id}/aprovador`, 200, {
            usuarioId: aprovador.usuario.id,
        });

        // Chama
        const resposta = await chamar(editor, "POST", `/investigacoes/${investigacao.id}/submeter`, 400);

        // Confere
        expect(resposta).toMatchObject({
            mensagem: "Dados inválidos",
            error: expect.arrayContaining([expect.objectContaining({ path: ["causaRaiz"] })]),
        });
    });
});
