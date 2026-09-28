import { describe, expect, it } from "vitest";
import { chamar, ncPublicada } from "../../../testes/cenarios.js";

describe("POST /nc/:naoConformidadeId/classificacoes", () => {
    it("recusa justificativa com menos de 20 caracteres", async () => {
        // Prepara
        const { aprovador, nc } = await ncPublicada();

        // Chama
        const resposta = await chamar(aprovador, "POST", `/nc/${nc.id}/classificacoes`, 400, {
            valor: "MAIOR",
            justificativa: "Curta demais",
        });

        // Confere
        expect(resposta).toMatchObject({
            mensagem: "Dados inválidos",
            error: expect.arrayContaining([expect.objectContaining({ instancePath: "/justificativa" })]),
        });
    });
});

describe("PATCH /classificacoes/:id", () => {
    it("recusa valor fora de MAIOR/MENOR", async () => {
        // Prepara
        const { aprovador, nc } = await ncPublicada();
        const classificacao = await chamar(aprovador, "POST", `/nc/${nc.id}/classificacoes`, 201, {
            valor: "MAIOR",
            justificativa: "Vazamento afeta a segurança operacional da linha 2.",
        });

        // Chama
        const resposta = await chamar(aprovador, "PATCH", `/classificacoes/${classificacao.id}`, 400, {
            valor: "GRAVISSIMA",
        });

        // Confere
        expect(resposta).toMatchObject({
            mensagem: "Dados inválidos",
            error: expect.arrayContaining([expect.objectContaining({ instancePath: "/valor" })]),
        });
    });
});
