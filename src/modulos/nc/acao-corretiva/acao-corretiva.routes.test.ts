import { afterEach, describe, expect, it, vi } from "vitest";
import { app } from "../../../app.js";
import { prisma } from "../../../compartilhado/prisma/cliente.js";
import {
    abrirDuasConexoes,
    chamar,
    concluirVerificacao,
    diaDaquiA,
    executarAcao,
    investigacaoAberta,
    ncProntaParaFechar,
    ncPublicada,
} from "../../../testes/cenarios.js";
import { loginComo } from "../../../testes/fabricas.js";
import { levarAcaoCorretivaAte } from "../../../testes/levar-ate/acao-corretiva.js";
import { levarInvestigacaoAte } from "../../../testes/levar-ate/investigacao.js";

const ID_INEXISTENTE = "00000000-0000-0000-0000-000000000000";

type Quem = Awaited<ReturnType<typeof loginComo>>;

// Uma investigação publicada na NC: a menor que aceita uma ação ligada (RN-49)
async function investigacaoPublicada(editor: Quem, naoConformidadeId: string) {
    const investigacao = await chamar(editor, "POST", `/api/nc/${naoConformidadeId}/investigacoes`, 201, {
        realProblema: "Vedação da bomba hidráulica com desgaste prematuro, causando vazamento contínuo de óleo.",
    });
    await chamar(editor, "POST", `/api/investigacoes/${investigacao.id}/publicar`, 200);
    return investigacao;
}

// As formas de apontar a ação para uma investigação que não serve: a que a Verificação NAO_EFICAZ reabriria tem de
// existir e ser desta NC (B10), e só recebe ação enquanto está aberta (RN-49)
const INVESTIGACOES_INVALIDAS = [
    {
        caso: "que não existe",
        montar: async () => ({ ...(await ncPublicada()), investigacaoId: ID_INEXISTENTE }),
    },
    {
        caso: "de outra NC",
        montar: async () => {
            const cenario = await ncPublicada();
            const outraNC = await chamar(cenario.editor, "POST", "/api/nc", 201, {
                titulo: "Outra NC, com a sua investigação",
            });
            const investigacao = await chamar(cenario.editor, "POST", `/api/nc/${outraNC.id}/investigacoes`, 201, {
                realProblema: "Ruído anormal no redutor da esteira, sem relação com o vazamento da linha 2.",
            });
            return { ...cenario, investigacaoId: investigacao.id };
        },
    },
    {
        caso: "em rascunho",
        montar: async () => {
            const { investigacao, ...cenario } = await levarInvestigacaoAte("RASCUNHO");
            return { ...cenario, investigacaoId: investigacao.id };
        },
    },
    {
        caso: "cancelada",
        montar: async () => {
            const { investigacao, ...cenario } = await levarInvestigacaoAte("CANCELADO");
            return { ...cenario, investigacaoId: investigacao.id };
        },
    },
    {
        caso: "em aprovação",
        montar: async () => {
            const { investigacao, ...cenario } = await levarInvestigacaoAte("EM_APROVACAO");
            return { ...cenario, investigacaoId: investigacao.id };
        },
    },
    {
        caso: "fechada",
        montar: async () => {
            const { investigacao, ...cenario } = await levarInvestigacaoAte("FECHADO");
            return { ...cenario, investigacaoId: investigacao.id };
        },
    },
];

afterEach(() => {
    vi.useRealTimers();
});

describe("POST /nc/:naoConformidadeId/acoes-corretivas", () => {
    it("responde 404 quando a NC não existe", async () => {
        // Prepara
        const editor = await loginComo("editor");

        // Chama (com uma investigação qualquer: sem ela, o corpo já seria recusado com 400)
        const resposta = await chamar(editor, "POST", `/api/nc/${ID_INEXISTENTE}/acoes-corretivas`, 404, {
            investigacaoId: ID_INEXISTENTE,
        });

        // Confere
        expect(resposta.mensagem).toEqual(expect.any(String));
    });

    it("recusa sem investigação (RN-49)", async () => {
        // Prepara
        const { editor, nc } = await ncPublicada();

        // Chama
        const resposta = await chamar(editor, "POST", `/api/nc/${nc.id}/acoes-corretivas`, 400, {});

        // Confere: nenhuma ação nasceu
        expect(resposta.error).toEqual([expect.objectContaining({ instancePath: "/investigacaoId" })]);
        expect(await chamar(editor, "GET", `/api/acoes-corretivas?naoConformidadeId=${nc.id}`, 200)).toEqual([]);
    });

    it.each(INVESTIGACOES_INVALIDAS)("recusa a investigação $caso (B10, RN-49)", async ({ montar }) => {
        // Prepara
        const { editor, nc, investigacaoId } = await montar();

        // Chama
        const resposta = await chamar(editor, "POST", `/api/nc/${nc.id}/acoes-corretivas`, 400, { investigacaoId });

        // Confere: nenhuma ação nasceu
        expect(resposta.mensagem).toContain("investigação");
        expect(await chamar(editor, "GET", `/api/acoes-corretivas?naoConformidadeId=${nc.id}`, 200)).toEqual([]);
    });
});

// "Plano aprovado" é derivado das decisões registradas em Aprovacao, não do portaoAtual (esquema §4.2)
describe("GET /acoes-corretivas/:id", () => {
    it("planoAprovado é false com o plano nunca submetido", async () => {
        // Prepara
        const { editor, acao } = await levarAcaoCorretivaAte("ABERTO");

        // Chama
        const resposta = await chamar(editor, "GET", `/api/acoes-corretivas/${acao.id}`, 200);

        // Confere
        expect(resposta).toMatchObject({ estado: "ABERTO", planoAprovado: false });
    });

    it("planoAprovado é true depois da aprovação do plano", async () => {
        // Prepara
        const { editor, aprovador, acao } = await levarAcaoCorretivaAte("EM_APROVACAO");
        await chamar(aprovador, "POST", `/api/acoes-corretivas/${acao.id}/decidir`, 200, { decisao: "APROVADO" });

        // Chama
        const resposta = await chamar(editor, "GET", `/api/acoes-corretivas/${acao.id}`, 200);

        // Confere (volta a ABERTO: só o planoAprovado distingue do plano nunca submetido)
        expect(resposta).toMatchObject({ estado: "ABERTO", planoAprovado: true });
    });

    it("planoAprovado é false com o plano reprovado", async () => {
        // Prepara
        const { editor, aprovador, acao } = await levarAcaoCorretivaAte("EM_APROVACAO");
        await chamar(aprovador, "POST", `/api/acoes-corretivas/${acao.id}/decidir`, 200, {
            decisao: "REPROVADO",
            motivo: "O prazo não é compatível com a próxima parada da linha.",
        });

        // Chama
        const resposta = await chamar(editor, "GET", `/api/acoes-corretivas/${acao.id}`, 200);

        // Confere
        expect(resposta).toMatchObject({ estado: "ABERTO", planoAprovado: false });
    });

    it("planoAprovado é true com o plano reprovado e depois aprovado", async () => {
        // Prepara
        const { editor, aprovador, acao } = await levarAcaoCorretivaAte("EM_APROVACAO");
        await chamar(aprovador, "POST", `/api/acoes-corretivas/${acao.id}/decidir`, 200, {
            decisao: "REPROVADO",
            motivo: "O prazo não é compatível com a próxima parada da linha.",
        });
        await chamar(editor, "POST", `/api/acoes-corretivas/${acao.id}/submeter`, 200);
        await chamar(aprovador, "POST", `/api/acoes-corretivas/${acao.id}/decidir`, 200, { decisao: "APROVADO" });

        // Chama
        const resposta = await chamar(editor, "GET", `/api/acoes-corretivas/${acao.id}`, 200);

        // Confere
        expect(resposta).toMatchObject({ estado: "ABERTO", planoAprovado: true });
    });
});

describe("PATCH /acoes-corretivas/:id", () => {
    // Com o plano aprovado, o PATCH só aceita a execução: o que o QA aprovou não muda (B2). Recusa se o campo vier,
    // mesmo com o mesmo valor (o investigacaoId vai igual)
    it.each([
        { campo: "descricao", valor: () => "Trocar a bomba hidráulica inteira, em vez de só a vedação." },
        { campo: "prazo", valor: () => diaDaquiA(60) },
        { campo: "instrucoesVerificacao", valor: () => "Verificar só visualmente, sem medir o vazamento." },
        { campo: "investigacaoId", valor: (investigacaoId: string) => investigacaoId },
    ])("recusa mudar o $campo do plano depois de aprovado (B2)", async ({ campo, valor }) => {
        // Prepara
        const { editor, acao, investigacao } = await levarAcaoCorretivaAte("PLANO_APROVADO");
        const antes = await chamar(editor, "GET", `/api/acoes-corretivas/${acao.id}`, 200);

        // Chama
        const resposta = await chamar(editor, "PATCH", `/api/acoes-corretivas/${acao.id}`, 409, {
            [campo]: valor(investigacao.id),
        });

        // Confere
        expect(resposta.mensagem).toContain(campo);
        expect(await chamar(editor, "GET", `/api/acoes-corretivas/${acao.id}`, 200)).toEqual(antes);
    });

    it("com o plano aprovado, registra a execução (B2)", async () => {
        // Prepara
        const { editor, acao } = await levarAcaoCorretivaAte("PLANO_APROVADO");

        // Chama
        const resposta = await chamar(editor, "PATCH", `/api/acoes-corretivas/${acao.id}`, 200, {
            executadoEm: diaDaquiA(-1),
            evidencia: "Procedimento PO-07 revisado e publicado na intranet, versão 3.0, com o material correto.",
        });

        // Confere
        expect(resposta).toMatchObject({ executadoEm: `${diaDaquiA(-1)}T00:00:00.000Z` });
    });

    it.each(INVESTIGACOES_INVALIDAS)("recusa apontar para a investigação $caso (B10, RN-49)", async ({ montar }) => {
        // Prepara: ação ligada a uma investigação que serve, na NC do cenário
        const { editor, nc, investigacaoId } = await montar();
        const valida = await investigacaoPublicada(editor, nc.id);
        const acao = await chamar(editor, "POST", `/api/nc/${nc.id}/acoes-corretivas`, 201, {
            investigacaoId: valida.id,
        });
        const antes = await chamar(editor, "GET", `/api/acoes-corretivas/${acao.id}`, 200);

        // Chama
        const resposta = await chamar(editor, "PATCH", `/api/acoes-corretivas/${acao.id}`, 400, { investigacaoId });

        // Confere
        expect(resposta.mensagem).toContain("investigação");
        expect(await chamar(editor, "GET", `/api/acoes-corretivas/${acao.id}`, 200)).toEqual(antes);
    });

    it("recusa apagar a investigação (RN-49)", async () => {
        // Prepara
        const { editor, acao } = await levarAcaoCorretivaAte("ABERTO");
        const antes = await chamar(editor, "GET", `/api/acoes-corretivas/${acao.id}`, 200);

        // Chama
        const resposta = await chamar(editor, "PATCH", `/api/acoes-corretivas/${acao.id}`, 400, {
            investigacaoId: null,
        });

        // Confere
        expect(resposta.error).toEqual([expect.objectContaining({ instancePath: "/investigacaoId" })]);
        expect(await chamar(editor, "GET", `/api/acoes-corretivas/${acao.id}`, 200)).toEqual(antes);
    });

    // A ação do PARCIALMENTE_EFICAZ é a única ligada a uma investigação já fechada (RN-49): editar o plano mandando
    // o mesmo vínculo não é ligar de novo
    it("aceita o mesmo investigacaoId na ação gerada pelo PARCIALMENTE_EFICAZ (RN-49)", async () => {
        // Prepara: o editor, que criou a ação anterior, é colaborador da nova
        const cenario = await ncProntaParaFechar();
        const { editor, nc, investigacao } = cenario;
        const { verificacao } = await executarAcao(cenario);
        await concluirVerificacao(cenario, verificacao.id, "PARCIALMENTE_EFICAZ");
        const [nova] = await chamar(
            editor,
            "GET",
            `/api/acoes-corretivas?naoConformidadeId=${nc.id}&estado=RASCUNHO`,
            200,
        );

        // Chama
        const resposta = await chamar(editor, "PATCH", `/api/acoes-corretivas/${nova.id}`, 200, {
            investigacaoId: investigacao.id,
            descricao: "Trocar também a vedação da bomba reserva, que usa o mesmo material incompatível.",
        });

        // Confere
        expect(resposta).toMatchObject({ investigacaoId: investigacao.id });
    });
});

describe("POST /acoes-corretivas/:id/submeter", () => {
    it("recusa o plano sem descrição e instruções de verificação", async () => {
        // Prepara
        const { editor, gerente, aprovador, nc, investigacao } = await investigacaoAberta();
        const acao = await chamar(editor, "POST", `/api/nc/${nc.id}/acoes-corretivas`, 201, {
            investigacaoId: investigacao.id,
        });
        await chamar(editor, "POST", `/api/acoes-corretivas/${acao.id}/publicar`, 200);
        await chamar(gerente, "PUT", `/api/registros/${acao.id}/aprovador`, 200, { usuarioId: aprovador.usuario.id });

        // Chama
        const resposta = await chamar(editor, "POST", `/api/acoes-corretivas/${acao.id}/submeter`, 400);

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
        await chamar(editor, "PATCH", `/api/acoes-corretivas/${acao.id}`, 200, {
            descricao: "Atualizar o procedimento de manutenção para especificar o material correto de vedação.",
            prazo: diaDaquiA(15),
            instrucoesVerificacao: "Após 30 dias de uso, inspecionar a vedação e confirmar ausência de vazamento.",
            executadoEm: diaDaquiA(-1),
            evidencia: "Procedimento PO-07 revisado e publicado na intranet, versão 3.0, com o material correto.",
        });

        // Chama
        const resposta = await chamar(editor, "POST", `/api/acoes-corretivas/${acao.id}/finalizar-execucao`, 409, {
            diasParaVerificar: 30,
        });

        // Confere: a ação continua aberta, e nenhuma verificação nasceu
        expect(resposta.mensagem).toContain("plano precisa estar aprovado");
        expect(await chamar(editor, "GET", `/api/acoes-corretivas/${acao.id}`, 200)).toMatchObject({
            estado: "ABERTO",
        });
        expect(await chamar(editor, "GET", `/api/verificacoes?acaoCorretivaId=${acao.id}`, 200)).toEqual([]);
    });

    it("recusa sem a execução registrada (RN-25)", async () => {
        // Prepara: o cenário traz a ação com o plano aprovado
        const { editor, acao } = await ncProntaParaFechar();

        // Chama
        const resposta = await chamar(editor, "POST", `/api/acoes-corretivas/${acao.id}/finalizar-execucao`, 400, {
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

    it("audita a finalização na ação e o nascimento da verificação", async () => {
        // Prepara e chama
        const cenario = await ncProntaParaFechar();
        const { acao, verificacao } = await executarAcao(cenario);

        // Confere: na ação, o antes e o depois; na verificação, já ABERTA com o código, sem o antes
        expect(
            await prisma.auditoria.findMany({ where: { entidadeId: acao.id, acao: "FINALIZAR_EXECUCAO" } }),
        ).toMatchObject([
            {
                entidade: "ACAO_CORRETIVA",
                usuarioId: cenario.editor.usuario.id,
                antes: { estado: "ABERTO" },
                depois: { estado: "FECHADO" },
            },
        ]);
        expect(
            await prisma.auditoria.findMany({ where: { entidadeId: verificacao.id, acao: "GERAR_VERIFICACAO" } }),
        ).toMatchObject([
            {
                entidade: "VERIFICACAO",
                usuarioId: cenario.editor.usuario.id,
                antes: null,
                depois: { estado: "ABERTO", codigo: verificacao.codigo, acaoCorretivaId: acao.id },
            },
        ]);
    });

    // B19 (esquema-backend.md §7): as duas leem a ação ABERTA antes de qualquer uma gravar, e as duas passam
    it("duplo clique: duas finalizações ao mesmo tempo geram uma verificação só (B19)", async () => {
        // Prepara: plano aprovado e execução registrada
        const { editor, acao } = await ncProntaParaFechar();
        await chamar(editor, "PATCH", `/api/acoes-corretivas/${acao.id}`, 200, {
            executadoEm: diaDaquiA(-1),
            evidencia: "Procedimento PO-07 revisado e publicado na intranet.",
        });

        // Chama: as duas ao mesmo tempo. Sem o chamar, porque não dá para saber qual delas chega primeiro
        const finalizar = () =>
            app.inject({
                method: "POST",
                url: `/api/acoes-corretivas/${acao.id}/finalizar-execucao`,
                headers: editor.autenticacao,
                body: { diasParaVerificar: 30 },
            });
        await abrirDuasConexoes();
        const respostas = await Promise.all([finalizar(), finalizar()]);

        // Confere: uma passa, a outra é recusada, e nasce uma verificação só
        expect(respostas.map((r) => r.statusCode).sort()).toEqual([200, 409]);
        expect(await chamar(editor, "GET", `/api/verificacoes?acaoCorretivaId=${acao.id}`, 200)).toHaveLength(1);
    });

    it("recusa prazo de verificação negativo", async () => {
        // Prepara: plano aprovado e execução registrada — o único problema é o número de dias
        const { editor, acao } = await ncProntaParaFechar();
        await chamar(editor, "PATCH", `/api/acoes-corretivas/${acao.id}`, 200, {
            executadoEm: diaDaquiA(-1),
            evidencia: "Procedimento PO-07 revisado e publicado na intranet.",
        });

        // Chama
        const resposta = await chamar(editor, "POST", `/api/acoes-corretivas/${acao.id}/finalizar-execucao`, 400, {
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
        const outraNC = await chamar(editor, "POST", "/api/nc", 201, { titulo: "Outra NC, com o seu item" });
        const daNCDoCenario = { investigacaoId: (await investigacaoPublicada(editor, nc.id)).id };
        const daOutraNC = { investigacaoId: (await investigacaoPublicada(editor, outraNC.id)).id };
        const publicado = await chamar(editor, "POST", `/api/nc/${nc.id}/acoes-corretivas`, 201, daNCDoCenario);
        const rascunho = await chamar(editor, "POST", `/api/nc/${nc.id}/acoes-corretivas`, 201, daNCDoCenario);
        await chamar(editor, "POST", `/api/nc/${outraNC.id}/acoes-corretivas`, 201, daOutraNC);
        await chamar(editor, "POST", `/api/acoes-corretivas/${publicado.id}/publicar`, 200);

        // Chama
        const daNC = await chamar(editor, "GET", `/api/acoes-corretivas?naoConformidadeId=${nc.id}`, 200);
        const abertosDaNC = await chamar(
            editor,
            "GET",
            `/api/acoes-corretivas?naoConformidadeId=${nc.id}&estado=ABERTO`,
            200,
        );

        // Confere
        const ids = (lista: { id: string }[]) => lista.map((item) => item.id).sort();
        expect(ids(daNC)).toEqual([publicado.id, rascunho.id].sort());
        expect(ids(abertosDaNC)).toEqual([publicado.id]);
    });
});

describe("POST /acoes-corretivas/:id/retirar", () => {
    it("o colaborador retira o plano da aprovação, e o plano continua não aprovado (RN-48)", async () => {
        // Prepara
        const { editor, acao } = await levarAcaoCorretivaAte("EM_APROVACAO");

        // Chama
        await chamar(editor, "POST", `/api/acoes-corretivas/${acao.id}/retirar`, 200);

        // Confere
        expect(await chamar(editor, "GET", `/api/acoes-corretivas/${acao.id}`, 200)).toMatchObject({
            estado: "ABERTO",
            planoAprovado: false,
        });
    });
});
