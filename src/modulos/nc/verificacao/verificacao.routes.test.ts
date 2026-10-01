import { describe, expect, it } from "vitest";
import {
    aprovarPlano,
    chamar,
    concluirVerificacao,
    executarAcao,
    investigacaoAberta,
    ncProntaParaFechar,
} from "../../../testes/cenarios.js";
import { loginComo } from "../../../testes/fabricas.js";

const ID_INEXISTENTE = "00000000-0000-0000-0000-000000000000";

describe("GET /verificacoes/:id", () => {
    it("responde 404, e não 500, quando a verificação não existe", async () => {
        // Prepara
        const editor = await loginComo("editor");

        // Chama
        const resposta = await chamar(editor, "GET", `/verificacoes/${ID_INEXISTENTE}`, 404);

        // Confere
        expect(resposta).toEqual({ mensagem: "Item não encontrado." });
    });
});

describe("GET /verificacoes", () => {
    it("filtra pela ação corretiva e por estado", async () => {
        // Prepara (a verificação nasce ABERTA ao finalizar a execução)
        const cenario = await ncProntaParaFechar();
        const { acao, verificacao } = await executarAcao(cenario);
        const { editor } = cenario;

        // Chama
        const daAcao = await chamar(editor, "GET", `/verificacoes?acaoCorretivaId=${acao.id}`, 200);
        const deOutraAcao = await chamar(editor, "GET", `/verificacoes?acaoCorretivaId=${ID_INEXISTENTE}`, 200);
        const fechadas = await chamar(editor, "GET", `/verificacoes?acaoCorretivaId=${acao.id}&estado=FECHADO`, 200);

        // Confere
        expect(daAcao.map((item: { id: string }) => item.id)).toEqual([verificacao.id]);
        expect(deOutraAcao).toEqual([]);
        expect(fechadas).toEqual([]);
    });
});

describe("POST /verificacoes/:id/concluir", () => {
    it("recusa sem a data da verificação (B14)", async () => {
        // Prepara: resultado e conclusão preenchidos, a data não. Concluir exige ser colaborador
        const cenario = await ncProntaParaFechar();
        const { gerente, aprovador } = cenario;
        const { verificacao } = await executarAcao(cenario);
        await chamar(gerente, "POST", `/registros/${verificacao.id}/colaboradores`, 200, {
            colaboradores: [aprovador.usuario.id],
        });
        await chamar(aprovador, "PATCH", `/verificacoes/${verificacao.id}`, 200, {
            resultado: "EFICAZ",
            conclusao: "Verificação feita na linha 2 depois do prazo, conforme as instruções do plano.",
        });

        // Chama
        const resposta = await chamar(aprovador, "POST", `/verificacoes/${verificacao.id}/concluir`, 400);

        // Confere
        expect(resposta).toMatchObject({
            mensagem: "Dados inválidos",
            error: [expect.objectContaining({ path: ["verificadoEm"] })],
        });
    });
});

// NAO_EFICAZ reabre só o que estiver fechado; o que estiver aberto, em aprovação ou cancelado fica como está (B4, PRD Q2).
// O caso com as duas fechadas está no fluxo-completo.test.ts
describe("POST /verificacoes/:id/concluir com NAO_EFICAZ", () => {
    it("com a NC ainda aberta: reabre só a investigação (B4)", async () => {
        // Prepara: investigação fechada, NC aberta (nunca submetida)
        const cenario = await ncProntaParaFechar();
        const { editor, nc, investigacao } = cenario;
        const { verificacao } = await executarAcao(cenario);

        // Chama
        await concluirVerificacao(cenario, verificacao.id, "NAO_EFICAZ");

        // Confere
        expect(await chamar(editor, "GET", `/investigacoes/${investigacao.id}`, 200)).toMatchObject({
            estado: "ABERTO",
        });
        expect(await chamar(editor, "GET", `/nc/${nc.id}`, 200)).toMatchObject({ estado: "ABERTO" });
    });

    it("com a NC em aprovação: reabre a investigação e deixa a NC como está (B4)", async () => {
        // Prepara: a NC submetida para fechamento, com a investigação já fechada
        const cenario = await ncProntaParaFechar();
        const { editor, nc, investigacao } = cenario;
        await chamar(editor, "PATCH", `/nc/${nc.id}`, 200, {
            riscosRevisados: "Risco de contaminação reavaliado, mitigado pela troca do material de vedação.",
            mudancasSGQ: "Procedimento PO-07 será atualizado para especificar o material de vedação compatível.",
        });
        await chamar(editor, "POST", `/nc/${nc.id}/submeter`, 200);
        const { verificacao } = await executarAcao(cenario);

        // Chama
        await concluirVerificacao(cenario, verificacao.id, "NAO_EFICAZ");

        // Confere
        expect(await chamar(editor, "GET", `/investigacoes/${investigacao.id}`, 200)).toMatchObject({
            estado: "ABERTO",
        });
        expect(await chamar(editor, "GET", `/nc/${nc.id}`, 200)).toMatchObject({ estado: "EM_APROVACAO" });
    });

    it("com a investigação ainda aberta: não reabre nada (B4)", async () => {
        // Prepara: a ação executada antes de a investigação ser enviada
        const cenario = await investigacaoAberta();
        const { editor, nc, investigacao } = cenario;
        const acao = await aprovarPlano(cenario);
        const { verificacao } = await executarAcao({ ...cenario, acao });

        // Chama
        await concluirVerificacao(cenario, verificacao.id, "NAO_EFICAZ");

        // Confere
        expect(await chamar(editor, "GET", `/investigacoes/${investigacao.id}`, 200)).toMatchObject({
            estado: "ABERTO",
        });
        expect(await chamar(editor, "GET", `/nc/${nc.id}`, 200)).toMatchObject({ estado: "ABERTO" });
    });

    it("com a investigação cancelada: ela continua cancelada (B4)", async () => {
        // Prepara: a ação já executada, e a investigação cancelada depois (RN-50 permite: ação fechada)
        const cenario = await investigacaoAberta();
        const { editor, aprovador, nc, investigacao } = cenario;
        const acao = await aprovarPlano(cenario);
        const { verificacao } = await executarAcao({ ...cenario, acao });
        await chamar(aprovador, "POST", `/investigacoes/${investigacao.id}/cancelar`, 200, {
            motivo: "A causa foi tratada por outra investigação desta NC.",
        });

        // Chama
        await concluirVerificacao(cenario, verificacao.id, "NAO_EFICAZ");

        // Confere
        expect(await chamar(editor, "GET", `/investigacoes/${investigacao.id}`, 200)).toMatchObject({
            estado: "CANCELADO",
        });
        expect(await chamar(editor, "GET", `/nc/${nc.id}`, 200)).toMatchObject({ estado: "ABERTO" });
    });
});
