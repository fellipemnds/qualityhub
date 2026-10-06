import { afterEach, describe, expect, it, vi } from "vitest";
import { app } from "../../../app.js";
import {
    chamar,
    classificarNC,
    daquiA,
    diaDaquiA,
    ncProntaParaFechar,
    ncPublicada,
    perfisDeFora,
} from "../../../testes/cenarios.js";
import { loginComo } from "../../../testes/fabricas.js";
import { levarInvestigacaoAte } from "../../../testes/levar-ate/investigacao.js";
import { levarNCAte } from "../../../testes/levar-ate/nc.js";

const ID_INEXISTENTE = "00000000-0000-0000-0000-000000000000";

// Os campos do envio, que o colaborador preenche quando os filhos estão atendidos
const CAMPOS_DO_ENVIO = {
    riscosRevisados: "Risco de contaminação reavaliado, mitigado pela troca do material de vedação.",
    mudancasSGQ: "Procedimento PO-07 será atualizado para especificar o material de vedação compatível.",
};

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
            url: "/api/nc",
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
        const resposta = await chamar(editor, "POST", "/api/nc", 400, { titulo: "NC" });

        // Confere
        expect(resposta).toMatchObject({
            mensagem: "Dados inválidos",
            error: expect.arrayContaining([expect.objectContaining({ instancePath: "/titulo" })]),
        });
    });

    it("recusa data de detecção com hora: dia de calendário é AAAA-MM-DD (TRD §6)", async () => {
        // Prepara
        const editor = await loginComo("editor");

        // Chama
        const resposta = await chamar(editor, "POST", "/api/nc", 400, {
            titulo: "NC de testes",
            detectadoEm: "2026-09-10T10:00:00.000Z",
        });

        // Confere
        expect(resposta).toMatchObject({
            mensagem: "Dados inválidos",
            error: expect.arrayContaining([expect.objectContaining({ instancePath: "/detectadoEm" })]),
        });
    });

    it("recusa data de detecção no futuro", async () => {
        // Prepara
        const editor = await loginComo("editor");

        // Chama
        const resposta = await chamar(editor, "POST", "/api/nc", 400, {
            titulo: "NC de testes",
            detectadoEm: diaDaquiA(1),
        });

        // Confere
        expect(resposta).toMatchObject({
            mensagem: "Dados inválidos",
            error: expect.arrayContaining([expect.objectContaining({ instancePath: "/detectadoEm" })]),
        });
    });

    it("recusa detecção amanhã em São Paulo, mesmo quando em UTC já é amanhã (B11)", async () => {
        // Prepara: 30/09 às 22h em Brasília, que já é 01/10 em UTC
        vi.useFakeTimers({ toFake: ["Date"] });
        vi.setSystemTime("2026-09-30T22:00:00-03:00");
        const editor = await loginComo("editor");

        // Chama
        const resposta = await chamar(editor, "POST", "/api/nc", 400, {
            titulo: "NC de testes",
            detectadoEm: "2026-10-01",
        });

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
        const ontem = diaDaquiA(-1);
        const resposta = await chamar(editor, "POST", "/api/nc", 201, { titulo: "NC de testes", detectadoEm: ontem });

        // Confere
        expect(resposta).toMatchObject({ estado: "RASCUNHO", detectadoEm: `${ontem}T00:00:00.000Z` });
    });
});

// A guarda de fechamento (RN-21, esquema §4.3) responde com a lista do que falta: só os itens não atendidos
describe("POST /nc/:id/submeter", () => {
    it("recusa enquanto não há classificação fechada, com a lista do que falta (RN-21)", async () => {
        // Prepara
        const { editor, nc } = await ncPublicada();

        // Chama
        const resposta = await chamar(editor, "POST", `/api/nc/${nc.id}/submeter`, 409);

        // Confere: o que está atendido (contenções, aprovador) não vem na lista
        expect(resposta.mensagem).toEqual(expect.any(String));
        expect(resposta.error.map((item: { requisito: string }) => item.requisito)).toEqual([
            "CLASSIFICACAO_FECHADA",
            "INVESTIGACOES_FECHADAS",
            "RISCOS_REVISADOS",
            "MUDANCAS_SGQ",
        ]);
    });

    it("recusa sem os campos do envio, com os filhos atendidos (RN-21)", async () => {
        // Prepara
        const { editor, nc } = await ncProntaParaFechar();

        // Chama
        const resposta = await chamar(editor, "POST", `/api/nc/${nc.id}/submeter`, 409);

        // Confere
        expect(resposta.error).toMatchObject([
            { requisito: "RISCOS_REVISADOS", grupo: "ENVIO", atendido: false },
            { requisito: "MUDANCAS_SGQ", grupo: "ENVIO", atendido: false },
        ]);
    });

    it("recusa com uma investigação fechada e outra aberta (RN-21)", async () => {
        // Prepara: a NC pronta, com o envio preenchido, e uma segunda investigação ainda aberta
        const { editor, nc } = await ncProntaParaFechar();
        await chamar(editor, "PATCH", `/api/nc/${nc.id}`, 200, CAMPOS_DO_ENVIO);
        const outra = await chamar(editor, "POST", `/api/nc/${nc.id}/investigacoes`, 201, {
            realProblema: "Ruído anormal no redutor da esteira, percebido na mesma inspeção da linha 2.",
        });
        const publicada = await chamar(editor, "POST", `/api/investigacoes/${outra.id}/publicar`, 200);

        // Chama
        const resposta = await chamar(editor, "POST", `/api/nc/${nc.id}/submeter`, 409);

        // Confere: a aberta aparece com o código, para a tela apontar o que resolve
        expect(resposta.error).toEqual([
            expect.objectContaining({
                requisito: "INVESTIGACOES_FECHADAS",
                atendido: false,
                pendentes: [{ id: outra.id, codigo: publicada.codigo }],
            }),
        ]);
        expect(await chamar(editor, "GET", `/api/nc/${nc.id}`, 200)).toMatchObject({ estado: "ABERTO" });
    });

    // A investigação pode concluir sem ação corretiva, e a NC não confere as ações (PRD Q17)
    it("fecha a NC sem nenhuma ação corretiva (RN-21)", async () => {
        // Prepara: investigação fechada sem ações, classificação fechada, nenhuma contenção
        const cenario = await levarInvestigacaoAte("FECHADO");
        const { editor, aprovador, nc } = cenario;
        await classificarNC(cenario);
        await chamar(editor, "PATCH", `/api/nc/${nc.id}`, 200, CAMPOS_DO_ENVIO);

        // Chama
        await chamar(editor, "POST", `/api/nc/${nc.id}/submeter`, 200);
        await chamar(aprovador, "POST", `/api/nc/${nc.id}/decidir`, 200, { decisao: "APROVADO" });

        // Confere
        expect(await chamar(editor, "GET", `/api/nc/${nc.id}`, 200)).toMatchObject({ estado: "FECHADO" });
        expect(await chamar(editor, "GET", `/api/acoes-corretivas?naoConformidadeId=${nc.id}`, 200)).toEqual([]);
    });
});

// A mesma guarda do submeter, só para ler: a tela mostra o checklist sem tentar submeter (TRD §5, lacuna L6)
describe("GET /nc/:id/checklist-fechamento", () => {
    it("devolve os seis requisitos, atendidos ou não, na ordem", async () => {
        // Prepara: só a NC publicada, com aprovador
        const { nc } = await ncPublicada();
        const { visualizador } = await perfisDeFora();

        // Chama
        const resposta = await chamar(visualizador, "GET", `/api/nc/${nc.id}/checklist-fechamento`, 200);

        // Confere
        expect(resposta).toMatchObject([
            { requisito: "CLASSIFICACAO_FECHADA", grupo: "FILHOS", atendido: false },
            { requisito: "INVESTIGACOES_FECHADAS", grupo: "FILHOS", atendido: false },
            { requisito: "CONTENCOES_RESOLVIDAS", grupo: "FILHOS", atendido: true },
            { requisito: "RISCOS_REVISADOS", grupo: "ENVIO", atendido: false },
            { requisito: "MUDANCAS_SGQ", grupo: "ENVIO", atendido: false },
            { requisito: "APROVADOR_DEFINIDO", grupo: "ENVIO", atendido: true },
        ]);
    });

    it("responde 404 quando a NC não existe", async () => {
        const editor = await loginComo("editor");

        await chamar(editor, "GET", `/api/nc/${ID_INEXISTENTE}/checklist-fechamento`, 404);
    });

    it("recusa quem não tem papel de leitura", async () => {
        // Prepara
        const { nc } = await ncPublicada();
        const { semPapel } = await perfisDeFora();

        // Chama e confere
        await chamar(semPapel, "GET", `/api/nc/${nc.id}/checklist-fechamento`, 403);
    });
});

describe("PATCH /nc/:id", () => {
    it("null apaga a data de detecção, e não grava 01/01/1970 (B14)", async () => {
        // Prepara
        const editor = await loginComo("editor");
        const nc = await chamar(editor, "POST", "/api/nc", 201, { titulo: "NC de testes", detectadoEm: "2026-09-10" });

        // Chama
        const resposta = await chamar(editor, "PATCH", `/api/nc/${nc.id}`, 200, { detectadoEm: null });

        // Confere
        expect(resposta).toMatchObject({ detectadoEm: null });
    });
});

describe("GET /nc", () => {
    it("filtra por estado", async () => {
        // Prepara (a NC do ncPublicada está ABERTA; a segunda fica em rascunho)
        const { editor, nc } = await ncPublicada();
        await chamar(editor, "POST", "/api/nc", 201, { titulo: "NC que fica em rascunho" });

        // Chama
        const resposta = await chamar(editor, "GET", "/api/nc?estado=ABERTO", 200);

        // Confere
        expect(resposta.itensDaPagina.map((item: { id: string }) => item.id)).toEqual([nc.id]);
    });
});

describe("GET /nc/:id", () => {
    it("devolve a data de detecção como dia, sem hora (B22)", async () => {
        // Prepara: o levarNCAte cria a NC com detectadoEm "2026-09-10"
        const { editor, nc } = await levarNCAte("RASCUNHO");

        // Chama
        const resposta = await chamar(editor, "GET", `/api/nc/${nc.id}`, 200);

        // Confere
        expect(resposta.detectadoEm).toBe("2026-09-10");
    });

    it("não expõe o portaoAtual, detalhe interno do ciclo de vida (D2)", async () => {
        // Prepara
        const { editor, nc } = await levarNCAte("RASCUNHO");

        // Chama
        const resposta = await chamar(editor, "GET", `/api/nc/${nc.id}`, 200);

        // Confere
        expect(resposta.id).toBe(nc.id);
        expect(resposta).not.toHaveProperty("portaoAtual");
    });

    it("responde 404 só com a mensagem quando a NC não existe", async () => {
        // Prepara
        const editor = await loginComo("editor");

        // Chama
        const resposta = await chamar(editor, "GET", `/api/nc/${ID_INEXISTENTE}`, 404);

        // Confere
        expect(resposta).toEqual({ mensagem: "Item não encontrado." });
    });

    it("responde 400 com a lista do que está inválido quando o id não é UUID", async () => {
        // Prepara
        const editor = await loginComo("editor");

        // Chama
        const resposta = await chamar(editor, "GET", "/api/nc/nao-e-uuid", 400);

        // Confere
        expect(resposta).toMatchObject({ mensagem: "Dados inválidos", error: expect.any(Array) });
    });

    it("o visualizador lê a NC", async () => {
        // Prepara
        const { nc } = await ncPublicada();
        const { visualizador } = await perfisDeFora();

        // Chama
        const resposta = await chamar(visualizador, "GET", `/api/nc/${nc.id}`, 200);

        // Confere
        expect(resposta).toMatchObject({ id: nc.id, estado: "ABERTO" });
    });
});

describe("DELETE /nc/:id", () => {
    it("exclui o rascunho de verdade (RN-09)", async () => {
        // Prepara
        const editor = await loginComo("editor");
        const nc = await chamar(editor, "POST", "/api/nc", 201, { titulo: "NC que vai ser excluída" });

        // Chama
        await chamar(editor, "DELETE", `/api/nc/${nc.id}`, 204);

        // Confere
        await chamar(editor, "GET", `/api/nc/${nc.id}`, 404);
    });

    it("responde 404 quando a NC não existe", async () => {
        const editor = await loginComo("editor");

        await chamar(editor, "DELETE", `/api/nc/${ID_INEXISTENTE}`, 404);
    });

    // O banco apaga os filhos junto, e a ação aponta para a investigação, que também é apagada (RN-49)
    it("exclui o rascunho com uma investigação e uma ação ligadas", async () => {
        // Prepara
        const editor = await loginComo("editor");
        const nc = await chamar(editor, "POST", "/api/nc", 201, { titulo: "NC que vai ser excluída" });
        const investigacao = await chamar(editor, "POST", `/api/nc/${nc.id}/investigacoes`, 201, {
            realProblema: "Vedação da bomba hidráulica com desgaste prematuro.",
        });
        await chamar(editor, "POST", `/api/investigacoes/${investigacao.id}/publicar`, 200);
        await chamar(editor, "POST", `/api/nc/${nc.id}/acoes-corretivas`, 201, { investigacaoId: investigacao.id });

        // Chama
        await chamar(editor, "DELETE", `/api/nc/${nc.id}`, 204);

        // Confere
        await chamar(editor, "GET", `/api/nc/${nc.id}`, 404);
    });
});

describe("POST /nc/:id/publicar", () => {
    it("recusa publicar sem data de detecção (B14)", async () => {
        // Prepara: todos os campos da publicação, menos a data
        const editor = await loginComo("editor");
        const nc = await chamar(editor, "POST", "/api/nc", 201, {
            titulo: "Vazamento de óleo na linha 2",
            descricao: "Identificado vazamento de óleo hidráulico durante inspeção de rotina na linha 2.",
            requisitoViolado: "Procedimento PO-07, item 4.3 - inspeção de recebimento",
            processoAfetado: "Linha de Produção 2",
            setorId: editor.usuario.setorId,
            origem: "OPERACAO",
        });

        // Chama
        const resposta = await chamar(editor, "POST", `/api/nc/${nc.id}/publicar`, 400);

        // Confere
        expect(resposta).toMatchObject({
            mensagem: "Dados inválidos",
            error: [expect.objectContaining({ path: ["detectadoEm"] })],
        });
    });

    it("responde 404 quando a NC não existe", async () => {
        const editor = await loginComo("editor");

        await chamar(editor, "POST", `/api/nc/${ID_INEXISTENTE}/publicar`, 404);
    });

    it("o código usa o ano de São Paulo, não o do servidor (B11)", async () => {
        // Prepara: 31/12 às 23h em Brasília, que já é 01/01 em UTC
        vi.useFakeTimers({ toFake: ["Date"] });
        vi.setSystemTime("2026-12-31T23:00:00-03:00");
        const { editor, nc } = await ncPublicada();

        // Chama
        const publicada = await chamar(editor, "GET", `/api/nc/${nc.id}`, 200);

        // Confere
        expect(publicada.codigo).toBe("NC-2026-0001");
    });
});

describe("POST /nc/:id/reabrir", () => {
    it("qualquer APROVADOR reabre, sem ser o designado (RN-17)", async () => {
        // Prepara (o qa tem o papel APROVADOR e não está na NC)
        const { qa, nc } = await levarNCAte("FECHADO");

        // Chama
        const resposta = await chamar(qa, "POST", `/api/nc/${nc.id}/reabrir`, 200, {
            motivo: "Reincidência do vazamento na linha 2.",
        });

        // Confere
        expect(resposta).toMatchObject({ estado: "ABERTO" });
    });

    // B18 (esquema-backend.md §7): o motivo em branco é um erro de campo (400, no schema), não de estado (409)
    it("recusa motivo só com espaços (RN-05)", async () => {
        // Prepara
        const { aprovador, editor, nc } = await levarNCAte("FECHADO");

        // Chama
        await chamar(aprovador, "POST", `/api/nc/${nc.id}/reabrir`, 400, { motivo: "   " });

        // Confere
        expect(await chamar(editor, "GET", `/api/nc/${nc.id}`, 200)).toMatchObject({ estado: "FECHADO" });
    });
});

describe("POST /nc/:id/retirar", () => {
    it("o colaborador retira a NC da aprovação do fechamento (RN-48)", async () => {
        // Prepara
        const { editor, nc } = await levarNCAte("EM_APROVACAO");

        // Chama e confere
        expect(await chamar(editor, "POST", `/api/nc/${nc.id}/retirar`, 200)).toMatchObject({ estado: "ABERTO" });
    });
});
