import { describe, expect, it } from "vitest";
import { app } from "../../app.js";
import { loginComo } from "../../testes/fabricas.js";

type Quem = Awaited<ReturnType<typeof loginComo>>;
type Metodo = "GET" | "POST" | "PATCH" | "PUT" | "DELETE";

// Uma etapa do fluxo: faz a requisição, confere o status e devolve o corpo.
// A mensagem do expect diz qual etapa falhou e o que o servidor respondeu.
async function chamar(quem: Quem, metodo: Metodo, url: string, statusEsperado: number, body?: object) {
    const resposta = await app.inject({ method: metodo, url, headers: quem.autenticacao, body });
    expect(resposta.statusCode, `${metodo} ${url} → ${resposta.body}`).toBe(statusEsperado);
    return resposta.json();
}

describe("Fluxo completo da NC", () => {
    it("fecha a NC depois de contenção, classificação e investigação aprovadas", async () => {
        // Prepara
        const editor = await loginComo("editor");
        const gerente = await loginComo("gerente");
        const aprovador = await loginComo("aprovador");
        const qa = await loginComo("qa");

        // 1. NC: rascunho → edição → publicação → aprovador designado
        const nc = await chamar(editor, "POST", "/nc", 201, {
            titulo: "Vazamento de óleo na linha 2",
            descricao: "Identificado vazamento de óleo hidráulico durante inspeção de rotina na linha 2.",
            requisitoViolado: "Procedimento PO-07, item 4.3 - inspeção de recebimento",
            processoAfetado: "Linha de Produção 2",
            setorId: editor.usuario.setorId,
            detectadoEm: "2026-09-10T10:00:00.000Z",
            origem: "OPERACAO",
        });
        await chamar(editor, "PATCH", `/nc/${nc.id}`, 200, {
            descricao: "Identificado vazamento de óleo hidráulico na linha 2. Volume estimado: 2 litros.",
        });
        expect(await chamar(editor, "POST", `/nc/${nc.id}/publicar`, 200)).toMatchObject({
            estado: "ABERTO",
            codigo: expect.stringMatching(/^NC-\d{4}-0001$/),
        });
        await chamar(gerente, "PUT", `/registros/${nc.id}/aprovador`, 200, { usuarioId: aprovador.usuario.id });

        // 2. Contenção: rascunho → publicação → aprovação
        const contencao = await chamar(editor, "POST", `/nc/${nc.id}/contencoes`, 201, {
            descricao: "Retrabalho realizado na peça com defeito, substituindo a vedação danificada.",
        });
        await chamar(editor, "PATCH", `/contencoes/${contencao.id}`, 200, {
            executadaEm: "2026-09-15T14:30:00.000Z",
            disposicao: "CORRIGIDO",
        });
        await chamar(editor, "POST", `/contencoes/${contencao.id}/publicar`, 200);
        await chamar(gerente, "PUT", `/registros/${contencao.id}/aprovador`, 200, { usuarioId: aprovador.usuario.id });
        await chamar(editor, "POST", `/contencoes/${contencao.id}/submeter`, 200);
        await chamar(aprovador, "POST", `/contencoes/${contencao.id}/decidir`, 200, { decisao: "APROVADO" });
        expect(await chamar(editor, "GET", `/contencoes/${contencao.id}`, 200)).toMatchObject({ estado: "FECHADO" });

        // 3. Classificação (RN-20: só APROVADOR/GERENTE), aprovada pelo aprovador designado — o QA, não quem criou
        const classificacao = await chamar(aprovador, "POST", `/nc/${nc.id}/classificacoes`, 201, {
            valor: "MAIOR",
            justificativa: "Vazamento afeta a segurança operacional e a qualidade do produto entregue ao cliente.",
        });
        await chamar(aprovador, "POST", `/classificacoes/${classificacao.id}/publicar`, 200);
        await chamar(gerente, "PUT", `/registros/${classificacao.id}/aprovador`, 200, { usuarioId: qa.usuario.id });
        await chamar(aprovador, "POST", `/classificacoes/${classificacao.id}/submeter`, 200);
        await chamar(qa, "POST", `/classificacoes/${classificacao.id}/decidir`, 200, { decisao: "APROVADO" });
        expect(await chamar(aprovador, "GET", `/classificacoes/${classificacao.id}`, 200)).toMatchObject({
            estado: "FECHADO",
        });

        // 4. Investigação: causas preenchidas já em ABERTO (editável até ser submetida)
        const investigacao = await chamar(editor, "POST", `/nc/${nc.id}/investigacoes`, 201, {
            realProblema: "Vedação da bomba hidráulica com desgaste prematuro, causando vazamento contínuo de óleo.",
        });
        await chamar(editor, "PATCH", `/investigacoes/${investigacao.id}`, 200, {
            metodo: "A3_SPS",
            conteudo: {
                percepcaoInicial: "Vazamento constante na linha 2",
                descricao: "Óleo hidráulico vazando na base da bomba",
                ishikawa: { metodo: "Troca de vedação fora do padrão" },
            },
        });
        await chamar(editor, "POST", `/investigacoes/${investigacao.id}/publicar`, 200);
        await chamar(gerente, "PUT", `/registros/${investigacao.id}/aprovador`, 200, {
            usuarioId: aprovador.usuario.id,
        });
        await chamar(editor, "PATCH", `/investigacoes/${investigacao.id}`, 200, {
            causaDireta: "Vedação de material incompatível com o fluido hidráulico utilizado na máquina.",
            causaRaiz: "Procedimento de manutenção não especifica o material correto de vedação para esta bomba.",
        });
        await chamar(editor, "POST", `/investigacoes/${investigacao.id}/submeter`, 200);
        await chamar(aprovador, "POST", `/investigacoes/${investigacao.id}/decidir`, 200, { decisao: "APROVADO" });
        expect(await chamar(editor, "GET", `/investigacoes/${investigacao.id}`, 200)).toMatchObject({
            estado: "FECHADO",
        });

        // 5. Fechamento da NC (RN-21 satisfeita): campos de fechamento → submissão → aprovação
        await chamar(editor, "PATCH", `/nc/${nc.id}`, 200, {
            riscosRevisados: "Risco de contaminação reavaliado, mitigado pela troca do material de vedação.",
            mudancasSGQ: "Procedimento PO-07 será atualizado para especificar o material de vedação compatível.",
        });
        await chamar(editor, "POST", `/nc/${nc.id}/submeter`, 200);
        await chamar(aprovador, "POST", `/nc/${nc.id}/decidir`, 200, { decisao: "APROVADO" });

        // Confere
        expect(await chamar(editor, "GET", `/nc/${nc.id}`, 200)).toMatchObject({ estado: "FECHADO" });
    });
});
