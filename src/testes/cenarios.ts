import { expect } from "vitest";
import { app } from "../app.js";
import { hojeEmSaoPaulo } from "../compartilhado/datas/hoje-em-sao-paulo.js";
import { prisma } from "../compartilhado/prisma/cliente.js";
import { loginComo } from "./fabricas.js";

// Cenários de teste montados pela API — passando pelas mesmas permissões e guardas que um usuário real. Cada
// um parte do anterior, na ordem do fluxo real (PRD Q17): ncPublicada → investigacaoAberta → ncProntaParaFechar
// (a ação nasce com a investigação aberta e tem o plano aprovado antes do envio, pelo aprovarPlano) → fecharNC →
// executarAcao.

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

// Um instante a N dias de agora (para o relógio falso), para o teste não depender do dia em que roda
export function daquiA(dias: number) {
    return new Date(Date.now() + dias * 24 * 60 * 60 * 1000).toISOString();
}

// Um dia de calendário a N dias de hoje em São Paulo, como "AAAA-MM-DD" — o formato dos campos de dia (TRD §6)
export function diaDaquiA(dias: number) {
    const dia = new Date(`${hojeEmSaoPaulo()}T00:00:00Z`);
    dia.setUTCDate(dia.getUTCDate() + dias);
    return dia.toISOString().slice(0, 10);
}

// Duas requisições ao mesmo tempo (B19) só correm juntas se houver duas conexões abertas com o banco. Com uma só, a
// segunda espera abrir a dela (~20 ms) e, se a transação da primeira for curta, ela já terminou: a corrida não
// acontece, e o teste passa mesmo sem a trava. Chamar logo antes do Promise.all
export async function abrirDuasConexoes() {
    await Promise.all([prisma.$queryRaw`SELECT 1`, prisma.$queryRaw`SELECT 1`]);
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
        detectadoEm: "2026-09-10",
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

// Os perfis que não participam de item nenhum: sem papel de negócio (admin), só leitura (visualizador) e sem papel
export async function perfisDeFora() {
    const admin = await loginComo("admin");
    const visualizador = await loginComo("visualizador");
    const semPapel = await loginComo("semPapel");

    return { admin, visualizador, semPapel };
}

// A investigação ABERTA, com método, conteúdo e as duas causas preenchidos: pronta para receber as ações
// corretivas, que só se ligam a uma investigação editável (RN-49)
export async function investigacaoAberta() {
    const cenario = await ncPublicada();
    const { editor, gerente, aprovador, nc } = cenario;

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
    expect(await chamar(editor, "GET", `/investigacoes/${investigacao.id}`, 200)).toMatchObject({
        estado: "ABERTO",
    });

    return { ...cenario, investigacao };
}

export type CenarioComInvestigacao = Awaited<ReturnType<typeof investigacaoAberta>>;

// A NC com contenção, classificação e investigação FECHADAS (guarda RN-21 satisfeita), mas ainda sem os campos
// de fechamento. A investigação fecha com uma ação de plano aprovado: o plano é aprovado antes do envio (RN-24)
export async function ncProntaParaFechar() {
    const cenario = await investigacaoAberta();
    const { editor, gerente, aprovador, nc, investigacao } = cenario;

    // Contenção: rascunho → publicação → aprovação
    const contencao = await chamar(editor, "POST", `/nc/${nc.id}/contencoes`, 201, {
        descricao: "Retrabalho realizado na peça com defeito, substituindo a vedação danificada.",
    });
    await chamar(editor, "PATCH", `/contencoes/${contencao.id}`, 200, {
        executadaEm: "2026-09-15",
        disposicao: "CORRIGIDO",
    });
    await chamar(editor, "POST", `/contencoes/${contencao.id}/publicar`, 200);
    await chamar(gerente, "PUT", `/registros/${contencao.id}/aprovador`, 200, { usuarioId: aprovador.usuario.id });
    await chamar(editor, "POST", `/contencoes/${contencao.id}/submeter`, 200);
    await chamar(aprovador, "POST", `/contencoes/${contencao.id}/decidir`, 200, { decisao: "APROVADO" });
    expect(await chamar(editor, "GET", `/contencoes/${contencao.id}`, 200)).toMatchObject({ estado: "FECHADO" });

    await classificarNC(cenario);

    // Investigação: a ação corretiva tem o plano aprovado com ela ainda aberta, e só depois ela é enviada
    const acao = await aprovarPlano(cenario);
    await chamar(editor, "POST", `/investigacoes/${investigacao.id}/submeter`, 200);
    await chamar(aprovador, "POST", `/investigacoes/${investigacao.id}/decidir`, 200, { decisao: "APROVADO" });
    expect(await chamar(editor, "GET", `/investigacoes/${investigacao.id}`, 200)).toMatchObject({
        estado: "FECHADO",
    });

    return { ...cenario, acao };
}

export type CenarioProntoParaFechar = Awaited<ReturnType<typeof ncProntaParaFechar>>;

// Classificação (RN-20: só APROVADOR/GERENTE), aprovada pelo aprovador designado — o QA, não quem criou
export async function classificarNC({ gerente, aprovador, qa, nc }: Cenario) {
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

    return classificacao;
}

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
        prazo: diaDaquiA(15),
        instrucoesVerificacao: "Após 30 dias de uso, inspecionar a vedação e confirmar ausência de vazamento.",
    });
    await chamar(editor, "POST", `/acoes-corretivas/${acao.id}/submeter`, 200);
    expect(
        await chamar(aprovador, "POST", `/acoes-corretivas/${acao.id}/decidir`, 200, { decisao: "APROVADO" }),
    ).toMatchObject({ estado: "ABERTO" });

    return acao;
}

// Execução da ação do cenário registrada e finalizada sem aprovação → a ação fecha e a verificação nasce já ABERTA
export async function executarAcao(cenario: CenarioProntoParaFechar) {
    const { editor, acao } = cenario;

    await chamar(editor, "PATCH", `/acoes-corretivas/${acao.id}`, 200, {
        executadoEm: diaDaquiA(-1),
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
        verificadoEm: diaDaquiA(0),
    });
    await chamar(aprovador, "POST", `/verificacoes/${verificacaoId}/concluir`, 200);
}
