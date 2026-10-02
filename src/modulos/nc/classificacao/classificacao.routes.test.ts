import { describe, expect, it } from "vitest";
import { chamar, ncPublicada } from "../../../testes/cenarios.js";
import { levarClassificacaoAte } from "../../../testes/levar-ate/classificacao.js";

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

describe("GET /classificacoes", () => {
    it("filtra por NC e por estado", async () => {
        // Prepara: dois itens na NC do cenário (um publicado) e um em outra NC. Classificar é do APROVADOR (RN-20)
        const { editor, aprovador, nc } = await ncPublicada();
        const outraNC = await chamar(editor, "POST", "/nc", 201, { titulo: "Outra NC, com o seu item" });
        const publicado = await chamar(aprovador, "POST", `/nc/${nc.id}/classificacoes`, 201, {
            valor: "MAIOR",
            justificativa: "Vazamento afeta a segurança operacional da linha 2.",
        });
        const rascunho = await chamar(aprovador, "POST", `/nc/${nc.id}/classificacoes`, 201, {
            valor: "MAIOR",
            justificativa: "Vazamento afeta a segurança operacional da linha 2.",
        });
        await chamar(aprovador, "POST", `/nc/${outraNC.id}/classificacoes`, 201, {
            valor: "MAIOR",
            justificativa: "Vazamento afeta a segurança operacional da linha 2.",
        });
        await chamar(aprovador, "POST", `/classificacoes/${publicado.id}/publicar`, 200);

        // Chama
        const daNC = await chamar(aprovador, "GET", `/classificacoes?naoConformidadeId=${nc.id}`, 200);
        const abertosDaNC = await chamar(
            aprovador,
            "GET",
            `/classificacoes?naoConformidadeId=${nc.id}&estado=ABERTO`,
            200,
        );

        // Confere
        const ids = (lista: { id: string }[]) => lista.map((item) => item.id).sort();
        expect(ids(daNC)).toEqual([publicado.id, rascunho.id].sort());
        expect(ids(abertosDaNC)).toEqual([publicado.id]);
    });
});

describe("POST /classificacoes/:id/retirar", () => {
    it("quem classificou retira da aprovação (RN-48, RN-20)", async () => {
        // Prepara
        const { aprovador, classificacao } = await levarClassificacaoAte("EM_APROVACAO");

        // Chama e confere
        expect(await chamar(aprovador, "POST", `/classificacoes/${classificacao.id}/retirar`, 200)).toMatchObject({
            estado: "ABERTO",
        });
    });
});
