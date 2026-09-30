import { describe, expect, it } from "vitest";
import { aprovarPlano, chamar, daquiA, ncProntaParaFechar, ncPublicada } from "../../../testes/cenarios.js";
import { loginComo } from "../../../testes/fabricas.js";

const ID_INEXISTENTE = "00000000-0000-0000-0000-000000000000";

describe("POST /nc/:naoConformidadeId/acoes-corretivas", () => {
    it("responde 404 quando a NC não existe", async () => {
        // Prepara
        const editor = await loginComo("editor");

        // Chama
        const resposta = await chamar(editor, "POST", `/nc/${ID_INEXISTENTE}/acoes-corretivas`, 404, {});

        // Confere
        expect(resposta.mensagem).toEqual(expect.any(String));
    });
});

describe("POST /acoes-corretivas/:id/submeter", () => {
    it("recusa o plano sem descrição e instruções de verificação", async () => {
        // Prepara
        const { editor, gerente, aprovador, nc } = await ncPublicada();
        const acao = await chamar(editor, "POST", `/nc/${nc.id}/acoes-corretivas`, 201, {});
        await chamar(editor, "POST", `/acoes-corretivas/${acao.id}/publicar`, 200);
        await chamar(gerente, "PUT", `/registros/${acao.id}/aprovador`, 200, { usuarioId: aprovador.usuario.id });

        // Chama
        const resposta = await chamar(editor, "POST", `/acoes-corretivas/${acao.id}/submeter`, 400);

        // Confere (o prazo vazio NÃO é recusado hoje: bug B14, da A3)
        expect(resposta).toMatchObject({
            mensagem: "Dados inválidos",
            error: expect.arrayContaining([
                expect.objectContaining({ path: ["descricao"] }),
                expect.objectContaining({ path: ["instrucoesVerificacao"] }),
            ]),
        });
    });
});

describe("POST /acoes-corretivas/:id/finalizar-execucao", () => {
    it("recusa sem a execução registrada (RN-25)", async () => {
        // Prepara
        const cenario = await ncProntaParaFechar();
        const acao = await aprovarPlano(cenario);

        // Chama
        const resposta = await chamar(cenario.editor, "POST", `/acoes-corretivas/${acao.id}/finalizar-execucao`, 400, {
            diasParaVerificar: 30,
        });

        // Confere (a data de execução vazia NÃO é recusada hoje: bug B14, da A3)
        expect(resposta).toMatchObject({
            mensagem: "Dados inválidos",
            error: expect.arrayContaining([expect.objectContaining({ path: ["evidencia"] })]),
        });
    });

    it("recusa prazo de verificação negativo", async () => {
        // Prepara: plano aprovado e execução registrada — o único problema é o número de dias
        const cenario = await ncProntaParaFechar();
        const acao = await aprovarPlano(cenario);
        await chamar(cenario.editor, "PATCH", `/acoes-corretivas/${acao.id}`, 200, {
            executadoEm: daquiA(-1),
            evidencia: "Procedimento PO-07 revisado e publicado na intranet.",
        });

        // Chama
        const resposta = await chamar(cenario.editor, "POST", `/acoes-corretivas/${acao.id}/finalizar-execucao`, 400, {
            diasParaVerificar: -5,
        });

        // Confere
        expect(resposta).toMatchObject({
            mensagem: "Dados inválidos",
            error: expect.arrayContaining([expect.objectContaining({ instancePath: "/diasParaVerificar" })]),
        });
    });
});

describe("GET /acoes-corretivas", () => {
    it("filtra por NC e por estado", async () => {
        // Prepara: dois itens na NC do cenário (um publicado) e um em outra NC
        const { editor, nc } = await ncPublicada();
        const outraNC = await chamar(editor, "POST", "/nc", 201, { titulo: "Outra NC, com o seu item" });
        const publicado = await chamar(editor, "POST", `/nc/${nc.id}/acoes-corretivas`, 201, {});
        const rascunho = await chamar(editor, "POST", `/nc/${nc.id}/acoes-corretivas`, 201, {});
        await chamar(editor, "POST", `/nc/${outraNC.id}/acoes-corretivas`, 201, {});
        await chamar(editor, "POST", `/acoes-corretivas/${publicado.id}/publicar`, 200);

        // Chama
        const daNC = await chamar(editor, "GET", `/acoes-corretivas?naoConformidadeId=${nc.id}`, 200);
        const abertosDaNC = await chamar(
            editor,
            "GET",
            `/acoes-corretivas?naoConformidadeId=${nc.id}&estado=ABERTO`,
            200,
        );

        // Confere
        const ids = (lista: { id: string }[]) => lista.map((item) => item.id).sort();
        expect(ids(daNC)).toEqual([publicado.id, rascunho.id].sort());
        expect(ids(abertosDaNC)).toEqual([publicado.id]);
    });
});
