import { expect } from "vitest";
import { app } from "../app.js";
import { loginComo } from "./fabricas.js";

// Cenários de teste montados pela API — passando pelas mesmas permissões e guardas que um usuário real. Cada
// um parte do anterior: ncPublicada → ncProntaParaFechar → fecharNC → aprovarPlano → executarAcao.

type Quem = Awaited<ReturnType<typeof loginComo>>;
type Metodo = "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
type Resultado = "EFICAZ" | "PARCIALMENTE_EFICAZ" | "NAO_EFICAZ";

// Faz a requisição, confere o status e devolve o corpo.
// A mensagem do expect diz qual requisição falhou e o que o servidor respondeu.
export async function chamar(quem: Quem, metodo: Metodo, url: string, statusEsperado: number, body?: object) {
    const resposta = await app.inject({ method: metodo, url, headers: quem.autenticacao, body });
    expect(resposta.statusCode, `${metodo} ${url} → ${resposta.body}`).toBe(statusEsperado);
    return resposta.body ? resposta.json() : undefined;
}

// Uma data a N dias de hoje, para o teste não depender do dia em que roda
export function daquiA(dias: number) {
    return new Date(Date.now() + dias * 24 * 60 * 60 * 1000).toISOString();
}

// Os quatro perfis do fluxo e uma NC publicada, com o aprovador designado
export async function ncPublicada() {
    const editor = await loginComo("editor");
    const gerente = await loginComo("gerente");
    const aprovador = await loginComo("aprovador");
    const qa = await loginComo("qa");

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

    return { editor, gerente, aprovador, qa, nc };
}

export type Cenario = Awaited<ReturnType<typeof ncPublicada>>;

// A NC com contenção, classificação e investigação FECHADAS (guarda RN-21 satisfeita), mas ainda sem os campos
// de fechamento
export async function ncProntaParaFechar() {
    const cenario = await ncPublicada();
    const { editor, gerente, aprovador, qa, nc } = cenario;

    // Contenção: rascunho → publicação → aprovação
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

    // Classificação (RN-20: só APROVADOR/GERENTE), aprovada pelo aprovador designado — o QA, não quem criou
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

    // Investigação: causas preenchidas já em ABERTO (editável até ser submetida)
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
    await chamar(gerente, "PUT", `/registros/${investigacao.id}/aprovador`, 200, { usuarioId: aprovador.usuario.id });
    await chamar(editor, "PATCH", `/investigacoes/${investigacao.id}`, 200, {
        causaDireta: "Vedação de material incompatível com o fluido hidráulico utilizado na máquina.",
        causaRaiz: "Procedimento de manutenção não especifica o material correto de vedação para esta bomba.",
    });
    await chamar(editor, "POST", `/investigacoes/${investigacao.id}/submeter`, 200);
    await chamar(aprovador, "POST", `/investigacoes/${investigacao.id}/decidir`, 200, { decisao: "APROVADO" });
    expect(await chamar(editor, "GET", `/investigacoes/${investigacao.id}`, 200)).toMatchObject({
        estado: "FECHADO",
    });

    return { ...cenario, investigacao };
}

export type CenarioComInvestigacao = Awaited<ReturnType<typeof ncProntaParaFechar>>;

// A NC FECHADA: campos de fechamento → submissão → aprovação. A ação corretiva continua depois daqui.
export async function fecharNC() {
    const cenario = await ncProntaParaFechar();
    const { editor, aprovador, nc } = cenario;

    await chamar(editor, "PATCH", `/nc/${nc.id}`, 200, {
        riscosRevisados: "Risco de contaminação reavaliado, mitigado pela troca do material de vedação.",
        mudancasSGQ: "Procedimento PO-07 será atualizado para especificar o material de vedação compatível.",
    });
    await chamar(editor, "POST", `/nc/${nc.id}/submeter`, 200);
    await chamar(aprovador, "POST", `/nc/${nc.id}/decidir`, 200, { decisao: "APROVADO" });

    return cenario;
}

// Ação corretiva com o plano aprovado: o portão PLANO devolve a ação a ABERTO — autoriza a execução, não fecha
export async function aprovarPlano({ editor, gerente, aprovador, nc, investigacao }: CenarioComInvestigacao) {
    const acao = await chamar(editor, "POST", `/nc/${nc.id}/acoes-corretivas`, 201, {
        investigacaoId: investigacao.id,
    });
    await chamar(editor, "POST", `/acoes-corretivas/${acao.id}/publicar`, 200);
    await chamar(gerente, "PUT", `/registros/${acao.id}/aprovador`, 200, { usuarioId: aprovador.usuario.id });
    await chamar(editor, "PATCH", `/acoes-corretivas/${acao.id}`, 200, {
        descricao: "Atualizar o procedimento de manutenção para especificar o material correto de vedação.",
        prazo: daquiA(15),
        instrucoesVerificacao: "Após 30 dias de uso, inspecionar a vedação e confirmar ausência de vazamento.",
    });
    await chamar(editor, "POST", `/acoes-corretivas/${acao.id}/submeter`, 200);
    expect(
        await chamar(aprovador, "POST", `/acoes-corretivas/${acao.id}/decidir`, 200, { decisao: "APROVADO" }),
    ).toMatchObject({ estado: "ABERTO" });

    return acao;
}

// Execução registrada e finalizada sem aprovação → a ação fecha e a verificação nasce já ABERTA
export async function executarAcao(cenario: CenarioComInvestigacao) {
    const { editor } = cenario;
    const acao = await aprovarPlano(cenario);

    await chamar(editor, "PATCH", `/acoes-corretivas/${acao.id}`, 200, {
        executadoEm: daquiA(-1),
        evidencia: "Procedimento PO-07 revisado e publicado na intranet, versão 3.0, com o material correto.",
    });
    const acaoFinalizada = await chamar(editor, "POST", `/acoes-corretivas/${acao.id}/finalizar-execucao`, 200, {
        diasParaVerificar: 30,
    });
    expect(acaoFinalizada).toMatchObject({
        estado: "FECHADO",
        verificacaoGerada: { tipo: "VERIFICACAO", estado: "ABERTO", prazo: expect.any(String) },
    });

    return { acao, verificacao: acaoFinalizada.verificacaoGerada };
}

// Conclui a verificação com o resultado pedido. Concluir exige ser colaborador, e o aprovador nasce atribuído
// só como APROVADOR.
export async function concluirVerificacao(
    { gerente, aprovador }: Cenario,
    verificacaoId: string,
    resultado: Resultado,
) {
    await chamar(gerente, "POST", `/registros/${verificacaoId}/colaboradores`, 200, {
        colaboradores: [aprovador.usuario.id],
    });
    await chamar(aprovador, "PATCH", `/verificacoes/${verificacaoId}`, 200, {
        resultado,
        conclusao: "Verificação feita na linha 2 depois do prazo, conforme as instruções do plano.",
        verificadoEm: daquiA(0),
    });
    await chamar(aprovador, "POST", `/verificacoes/${verificacaoId}/concluir`, 200);
}
