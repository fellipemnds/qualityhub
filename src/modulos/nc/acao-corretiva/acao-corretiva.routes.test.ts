import { afterEach, describe, expect, it, vi } from "vitest";
import {
    aprovarPlano,
    chamar,
    diaDaquiA,
    executarAcao,
    ncProntaParaFechar,
    ncPublicada,
} from "../../../testes/cenarios.js";
import { loginComo } from "../../../testes/fabricas.js";
import { levarAcaoCorretivaAte } from "../../../testes/levar-ate/acao-corretiva.js";

const ID_INEXISTENTE = "00000000-0000-0000-0000-000000000000";

afterEach(() => {
    vi.useRealTimers();
});

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

// "Plano aprovado" é derivado das decisões registradas em Aprovacao, não do portaoAtual (esquema §4.2)
describe("GET /acoes-corretivas/:id", () => {
    it("planoAprovado é false com o plano nunca submetido", async () => {
        // Prepara
        const { editor, acao } = await levarAcaoCorretivaAte("ABERTO");

        // Chama
        const resposta = await chamar(editor, "GET", `/acoes-corretivas/${acao.id}`, 200);

        // Confere
        expect(resposta).toMatchObject({ estado: "ABERTO", planoAprovado: false });
    });

    it("planoAprovado é true depois da aprovação do plano", async () => {
        // Prepara
        const { editor, aprovador, acao } = await levarAcaoCorretivaAte("EM_APROVACAO");
        await chamar(aprovador, "POST", `/acoes-corretivas/${acao.id}/decidir`, 200, { decisao: "APROVADO" });

        // Chama
        const resposta = await chamar(editor, "GET", `/acoes-corretivas/${acao.id}`, 200);

        // Confere (volta a ABERTO: só o planoAprovado distingue do plano nunca submetido)
        expect(resposta).toMatchObject({ estado: "ABERTO", planoAprovado: true });
    });

    it("planoAprovado é false com o plano reprovado", async () => {
        // Prepara
        const { editor, aprovador, acao } = await levarAcaoCorretivaAte("EM_APROVACAO");
        await chamar(aprovador, "POST", `/acoes-corretivas/${acao.id}/decidir`, 200, {
            decisao: "REPROVADO",
            motivo: "O prazo não é compatível com a próxima parada da linha.",
        });

        // Chama
        const resposta = await chamar(editor, "GET", `/acoes-corretivas/${acao.id}`, 200);

        // Confere
        expect(resposta).toMatchObject({ estado: "ABERTO", planoAprovado: false });
    });

    it("planoAprovado é true com o plano reprovado e depois aprovado", async () => {
        // Prepara
        const { editor, aprovador, acao } = await levarAcaoCorretivaAte("EM_APROVACAO");
        await chamar(aprovador, "POST", `/acoes-corretivas/${acao.id}/decidir`, 200, {
            decisao: "REPROVADO",
            motivo: "O prazo não é compatível com a próxima parada da linha.",
        });
        await chamar(editor, "POST", `/acoes-corretivas/${acao.id}/submeter`, 200);
        await chamar(aprovador, "POST", `/acoes-corretivas/${acao.id}/decidir`, 200, { decisao: "APROVADO" });

        // Chama
        const resposta = await chamar(editor, "GET", `/acoes-corretivas/${acao.id}`, 200);

        // Confere
        expect(resposta).toMatchObject({ estado: "ABERTO", planoAprovado: true });
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

        // Confere (o prazo vazio também: B14)
        expect(resposta).toMatchObject({
            mensagem: "Dados inválidos",
            error: expect.arrayContaining([
                expect.objectContaining({ path: ["descricao"] }),
                expect.objectContaining({ path: ["prazo"] }),
                expect.objectContaining({ path: ["instrucoesVerificacao"] }),
            ]),
        });
    });
});

describe("POST /acoes-corretivas/:id/finalizar-execucao", () => {
    it("a verificação gerada usa o dia de São Paulo: código do ano e prazo (B11)", async () => {
        // Prepara: 31/12 às 23h em Brasília, que já é 01/01 em UTC
        vi.useFakeTimers({ toFake: ["Date"] });
        vi.setSystemTime("2026-12-31T23:00:00-03:00");
        const cenario = await ncProntaParaFechar();

        // Chama (o executarAcao finaliza com 30 dias para verificar)
        const { verificacao } = await executarAcao(cenario);

        // Confere: 31/12/2026 + 30 dias = 30/01/2027, guardado como meia-noite UTC do dia
        expect(verificacao).toMatchObject({ codigo: "VE-2026-0001", prazo: "2027-01-30T00:00:00.000Z" });
    });

    it("recusa com a execução registrada, mas o plano nunca aprovado (B1)", async () => {
        // Prepara: plano escrito mas nunca submetido, execução preenchida — só falta a aprovação do plano
        const { editor, acao } = await levarAcaoCorretivaAte("ABERTO");
        await chamar(editor, "PATCH", `/acoes-corretivas/${acao.id}`, 200, {
            descricao: "Atualizar o procedimento de manutenção para especificar o material correto de vedação.",
            prazo: diaDaquiA(15),
            instrucoesVerificacao: "Após 30 dias de uso, inspecionar a vedação e confirmar ausência de vazamento.",
            executadoEm: diaDaquiA(-1),
            evidencia: "Procedimento PO-07 revisado e publicado na intranet, versão 3.0, com o material correto.",
        });

        // Chama
        const resposta = await chamar(editor, "POST", `/acoes-corretivas/${acao.id}/finalizar-execucao`, 409, {
            diasParaVerificar: 30,
        });

        // Confere: a ação continua aberta, e nenhuma verificação nasceu
        expect(resposta.mensagem).toContain("plano precisa estar aprovado");
        expect(await chamar(editor, "GET", `/acoes-corretivas/${acao.id}`, 200)).toMatchObject({ estado: "ABERTO" });
        expect(await chamar(editor, "GET", `/verificacoes?acaoCorretivaId=${acao.id}`, 200)).toEqual([]);
    });

    it("recusa sem a execução registrada (RN-25)", async () => {
        // Prepara
        const cenario = await ncProntaParaFechar();
        const acao = await aprovarPlano(cenario);

        // Chama
        const resposta = await chamar(cenario.editor, "POST", `/acoes-corretivas/${acao.id}/finalizar-execucao`, 400, {
            diasParaVerificar: 30,
        });

        // Confere (a data de execução vazia também: B14)
        expect(resposta).toMatchObject({
            mensagem: "Dados inválidos",
            error: expect.arrayContaining([
                expect.objectContaining({ path: ["executadoEm"] }),
                expect.objectContaining({ path: ["evidencia"] }),
            ]),
        });
    });

    it("recusa prazo de verificação negativo", async () => {
        // Prepara: plano aprovado e execução registrada — o único problema é o número de dias
        const cenario = await ncProntaParaFechar();
        const acao = await aprovarPlano(cenario);
        await chamar(cenario.editor, "PATCH", `/acoes-corretivas/${acao.id}`, 200, {
            executadoEm: diaDaquiA(-1),
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
