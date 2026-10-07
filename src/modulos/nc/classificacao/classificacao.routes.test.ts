import { describe, expect, it } from "vitest";
import { chamar, ncPublicada } from "../../../testes/cenarios.js";
import { loginComo } from "../../../testes/fabricas.js";
import { levarClassificacaoAte } from "../../../testes/levar-ate/classificacao.js";

const ID_INEXISTENTE = "00000000-0000-0000-0000-000000000000";

describe("POST /nc/:naoConformidadeId/classificacoes", () => {
    it("recusa justificativa com menos de 20 caracteres", async () => {
        // Prepara
        const { aprovador, nc } = await ncPublicada();

        // Chama
        const resposta = await chamar(aprovador, "POST", `/api/nc/${nc.id}/classificacoes`, 400, {
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
        const classificacao = await chamar(aprovador, "POST", `/api/nc/${nc.id}/classificacoes`, 201, {
            valor: "MAIOR",
            justificativa: "Vazamento afeta a segurança operacional da linha 2.",
        });

        // Chama
        const resposta = await chamar(aprovador, "PATCH", `/api/classificacoes/${classificacao.id}`, 400, {
            valor: "GRAVISSIMA",
        });

        // Confere
        expect(resposta).toMatchObject({
            mensagem: "Dados inválidos",
            error: expect.arrayContaining([expect.objectContaining({ instancePath: "/valor" })]),
        });
    });

    it("devolve a classificação inteira, com estado e código, como as outras rotas (D1)", async () => {
        // Prepara
        const { aprovador, classificacao } = await levarClassificacaoAte("ABERTO");

        // Chama
        const resposta = await chamar(aprovador, "PATCH", `/api/classificacoes/${classificacao.id}`, 200, {
            valor: "MENOR",
        });

        // Confere
        expect(resposta).toMatchObject({ valor: "MENOR", estado: "ABERTO", codigo: expect.any(String) });
    });
});

describe("GET /classificacoes", () => {
    it("filtra por NC e por estado", async () => {
        // Prepara: dois itens na NC do cenário (um publicado) e um em outra NC. Classificar é do APROVADOR (RN-20)
        const { editor, aprovador, nc } = await ncPublicada();
        const outraNC = await chamar(editor, "POST", "/api/nc", 201, { titulo: "Outra NC, com o seu item" });
        const publicado = await chamar(aprovador, "POST", `/api/nc/${nc.id}/classificacoes`, 201, {
            valor: "MAIOR",
            justificativa: "Vazamento afeta a segurança operacional da linha 2.",
        });
        const rascunho = await chamar(aprovador, "POST", `/api/nc/${nc.id}/classificacoes`, 201, {
            valor: "MAIOR",
            justificativa: "Vazamento afeta a segurança operacional da linha 2.",
        });
        await chamar(aprovador, "POST", `/api/nc/${outraNC.id}/classificacoes`, 201, {
            valor: "MAIOR",
            justificativa: "Vazamento afeta a segurança operacional da linha 2.",
        });
        await chamar(aprovador, "POST", `/api/classificacoes/${publicado.id}/publicar`, 200);

        // Chama
        const daNC = await chamar(aprovador, "GET", `/api/classificacoes?naoConformidadeId=${nc.id}`, 200);
        const abertosDaNC = await chamar(
            aprovador,
            "GET",
            `/api/classificacoes?naoConformidadeId=${nc.id}&estado=ABERTO`,
            200,
        );

        // Confere
        const ids = (lista: { id: string }[]) => lista.map((item) => item.id).sort();
        expect(ids(daNC)).toEqual([publicado.id, rascunho.id].sort());
        expect(ids(abertosDaNC)).toEqual([publicado.id]);
    });
});

describe("GET /classificacoes/:id", () => {
    it("traz o motivo da última reprovação, para o colaborador saber o que corrigir (L7)", async () => {
        // Prepara
        const { aprovador, qa, classificacao } = await levarClassificacaoAte("EM_APROVACAO");
        await chamar(qa, "POST", `/api/classificacoes/${classificacao.id}/decidir`, 200, {
            decisao: "REPROVADO",
            motivo: "Faltou detalhar o que foi feito.",
        });

        // Chama
        const resposta = await chamar(aprovador, "GET", `/api/classificacoes/${classificacao.id}`, 200);

        // Confere
        expect(resposta).toMatchObject({ ultimoMotivoReprovacao: "Faltou detalhar o que foi feito." });
    });

    it("não expõe o portaoAtual, detalhe interno do ciclo de vida (D2)", async () => {
        // Prepara
        const { aprovador, classificacao } = await levarClassificacaoAte("RASCUNHO");

        // Chama
        const resposta = await chamar(aprovador, "GET", `/api/classificacoes/${classificacao.id}`, 200);

        // Confere
        expect(resposta.id).toBe(classificacao.id);
        expect(resposta).not.toHaveProperty("portaoAtual");
    });

    it("responde 404 só com a mensagem quando a classificação não existe", async () => {
        // Prepara
        const aprovador = await loginComo("aprovador");

        // Chama
        const resposta = await chamar(aprovador, "GET", `/api/classificacoes/${ID_INEXISTENTE}`, 404);

        // Confere
        expect(resposta).toEqual({ mensagem: "Item não encontrado." });
    });
});

describe("POST /classificacoes/:id/retirar", () => {
    it("quem classificou retira da aprovação (RN-48, RN-20)", async () => {
        // Prepara
        const { aprovador, classificacao } = await levarClassificacaoAte("EM_APROVACAO");

        // Chama e confere
        expect(await chamar(aprovador, "POST", `/api/classificacoes/${classificacao.id}/retirar`, 200)).toMatchObject({
            estado: "ABERTO",
        });
    });
});
