import { describe, expect, it } from "vitest";
import { chamar, investigacaoAberta, ncPublicada } from "../../../testes/cenarios.js";
import { loginComo } from "../../../testes/fabricas.js";
import { type DegrauAcaoCorretiva, levarAcaoCorretivaAte } from "../../../testes/levar-ate/acao-corretiva.js";
import { levarInvestigacaoAte } from "../../../testes/levar-ate/investigacao.js";

const ID_INEXISTENTE = "00000000-0000-0000-0000-000000000000";

describe("PATCH /investigacoes/:id", () => {
    it("recusa método fora da lista (só A3_SPS)", async () => {
        // Prepara
        const { editor, nc } = await ncPublicada();
        const investigacao = await chamar(editor, "POST", `/api/nc/${nc.id}/investigacoes`, 201, {
            realProblema: "Vedação da bomba hidráulica com desgaste prematuro.",
        });

        // Chama
        const resposta = await chamar(editor, "PATCH", `/api/investigacoes/${investigacao.id}`, 400, {
            metodo: "SEIS_SIGMA",
        });

        // Confere
        expect(resposta).toMatchObject({
            mensagem: "Dados inválidos",
            error: expect.arrayContaining([expect.objectContaining({ instancePath: "/metodo" })]),
        });
    });

    it("devolve a investigação inteira, com estado e código, como as outras rotas (D1)", async () => {
        // Prepara
        const { editor, investigacao } = await levarInvestigacaoAte("ABERTO");

        // Chama
        const resposta = await chamar(editor, "PATCH", `/api/investigacoes/${investigacao.id}`, 200, {
            metodo: "A3_SPS",
        });

        // Confere
        expect(resposta).toMatchObject({ metodo: "A3_SPS", estado: "ABERTO", codigo: expect.any(String) });
    });

    it("devolve o conteúdo do A3 do jeito que foi gravado", async () => {
        // Prepara: o conteúdo é JSON livre, com objetos, listas, números e nulos aninhados
        const { editor, investigacao } = await levarInvestigacaoAte("RASCUNHO");
        const conteudo = { contramedidas: [{ ordem: 1, texto: "Trocar a vedação", prazo: null }], versao: 2 };

        // Chama
        await chamar(editor, "PATCH", `/api/investigacoes/${investigacao.id}`, 200, { conteudo });

        // Confere
        const resposta = await chamar(editor, "GET", `/api/investigacoes/${investigacao.id}`, 200);
        expect(resposta.conteudo).toEqual(conteudo);
    });
});

describe("GET /investigacoes/:id", () => {
    it("não expõe o portaoAtual, detalhe interno do ciclo de vida (D2)", async () => {
        // Prepara
        const { editor, investigacao } = await levarInvestigacaoAte("RASCUNHO");

        // Chama
        const resposta = await chamar(editor, "GET", `/api/investigacoes/${investigacao.id}`, 200);

        // Confere
        expect(resposta.id).toBe(investigacao.id);
        expect(resposta).not.toHaveProperty("portaoAtual");
    });

    it("responde 404 só com a mensagem quando a investigação não existe", async () => {
        // Prepara
        const editor = await loginComo("editor");

        // Chama
        const resposta = await chamar(editor, "GET", `/api/investigacoes/${ID_INEXISTENTE}`, 404);

        // Confere
        expect(resposta).toEqual({ mensagem: "Item não encontrado." });
    });
});

describe("POST /investigacoes/:id/submeter", () => {
    it("recusa sem causa raiz preenchida (RN-24)", async () => {
        // Prepara
        const { editor, gerente, aprovador, nc } = await ncPublicada();
        const investigacao = await chamar(editor, "POST", `/api/nc/${nc.id}/investigacoes`, 201, {
            realProblema: "Vedação da bomba hidráulica com desgaste prematuro.",
        });
        await chamar(editor, "POST", `/api/investigacoes/${investigacao.id}/publicar`, 200);
        await chamar(gerente, "PUT", `/api/registros/${investigacao.id}/aprovador`, 200, {
            usuarioId: aprovador.usuario.id,
        });

        // Chama
        const resposta = await chamar(editor, "POST", `/api/investigacoes/${investigacao.id}/submeter`, 400);

        // Confere
        expect(resposta).toMatchObject({
            mensagem: "Dados inválidos",
            error: expect.arrayContaining([expect.objectContaining({ path: ["causaRaiz"] })]),
        });
    });
});

// Os planos das ações ligadas à investigação são aprovados antes do envio (RN-24, PRD Q17): é o B5
describe("POST /investigacoes/:id/submeter, com ações ligadas", () => {
    const naoAprovados: { situacao: string; degrau: DegrauAcaoCorretiva; reprovar?: boolean }[] = [
        { situacao: "em rascunho", degrau: "RASCUNHO" },
        { situacao: "aberta, com o plano nunca submetido", degrau: "ABERTO" },
        { situacao: "com o plano em aprovação", degrau: "EM_APROVACAO" },
        { situacao: "com o plano reprovado", degrau: "EM_APROVACAO", reprovar: true },
    ];

    it.each(naoAprovados)("recusa com uma ação $situacao, com a lista do que falta (RN-24)", async (caso) => {
        // Prepara
        const { editor, aprovador, acao, investigacao } = await levarAcaoCorretivaAte(caso.degrau);
        if (caso.reprovar) {
            await chamar(aprovador, "POST", `/api/acoes-corretivas/${acao.id}/decidir`, 200, {
                decisao: "REPROVADO",
                motivo: "O prazo não é compatível com a próxima parada da linha.",
            });
        }
        const { codigo } = await chamar(editor, "GET", `/api/acoes-corretivas/${acao.id}`, 200);

        // Chama
        const resposta = await chamar(editor, "POST", `/api/investigacoes/${investigacao.id}/submeter`, 409);

        // Confere: a ação aparece com o código, e a investigação continua aberta
        expect(resposta.error).toEqual([
            expect.objectContaining({
                requisito: "PLANOS_APROVADOS",
                atendido: false,
                pendentes: [{ id: acao.id, codigo }],
            }),
        ]);
        expect(await chamar(editor, "GET", `/api/investigacoes/${investigacao.id}`, 200)).toMatchObject({
            estado: "ABERTO",
        });
    });

    it.each<DegrauAcaoCorretiva>(["PLANO_APROVADO", "CANCELADO"])(
        "aceita com a ação no degrau %s (RN-24)",
        async (degrau) => {
            // Prepara
            const { editor, investigacao } = await levarAcaoCorretivaAte(degrau);

            // Chama
            const resposta = await chamar(editor, "POST", `/api/investigacoes/${investigacao.id}/submeter`, 200);

            // Confere
            expect(resposta).toMatchObject({ estado: "EM_APROVACAO" });
        },
    );

    it("aceita sem nenhuma ação (PRD Q17)", async () => {
        // Prepara
        const { editor, investigacao } = await investigacaoAberta();

        // Chama
        const resposta = await chamar(editor, "POST", `/api/investigacoes/${investigacao.id}/submeter`, 200);

        // Confere
        expect(resposta).toMatchObject({ estado: "EM_APROVACAO" });
    });
});

// Cancelar a investigação com ação pendente deixaria a ação solta: a NC ignora investigação cancelada (RN-50, Q18)
describe("POST /investigacoes/:id/cancelar", () => {
    const motivo = { motivo: "A causa já é tratada por outra investigação desta NC." };

    it.each<DegrauAcaoCorretiva>(["RASCUNHO", "ABERTO", "EM_APROVACAO", "PLANO_APROVADO"])(
        "recusa com uma ação ligada no degrau %s, com a lista do que falta (RN-50)",
        async (degrau) => {
            // Prepara
            const { editor, aprovador, acao, investigacao } = await levarAcaoCorretivaAte(degrau);
            const { codigo } = await chamar(editor, "GET", `/api/acoes-corretivas/${acao.id}`, 200);

            // Chama
            const resposta = await chamar(
                aprovador,
                "POST",
                `/api/investigacoes/${investigacao.id}/cancelar`,
                409,
                motivo,
            );

            // Confere: a ação aparece com o código, e a investigação continua como estava
            expect(resposta.error).toEqual([
                expect.objectContaining({
                    requisito: "ACOES_RESOLVIDAS",
                    atendido: false,
                    pendentes: [{ id: acao.id, codigo }],
                }),
            ]);
            expect(await chamar(editor, "GET", `/api/investigacoes/${investigacao.id}`, 200)).toMatchObject({
                estado: "ABERTO",
            });
        },
    );

    it.each<DegrauAcaoCorretiva>(["CANCELADO", "FECHADO"])("aceita com a ação no degrau %s (RN-50)", async (degrau) => {
        // Prepara
        const { aprovador, investigacao } = await levarAcaoCorretivaAte(degrau);

        // Chama
        const resposta = await chamar(aprovador, "POST", `/api/investigacoes/${investigacao.id}/cancelar`, 200, motivo);

        // Confere
        expect(resposta).toMatchObject({ estado: "CANCELADO" });
    });

    it("quem não pode cancelar recebe 403, e não a lista", async () => {
        // Prepara: com ação pendente, mas pedido pelo editor, que não é o aprovador nem GERENTE
        const { editor, investigacao } = await levarAcaoCorretivaAte("ABERTO");

        // Chama e confere
        await chamar(editor, "POST", `/api/investigacoes/${investigacao.id}/cancelar`, 403, motivo);
    });
});

describe("GET /investigacoes", () => {
    it("filtra por NC e por estado", async () => {
        // Prepara: dois itens na NC do cenário (um publicado) e um em outra NC
        const { editor, nc } = await ncPublicada();
        const outraNC = await chamar(editor, "POST", "/api/nc", 201, { titulo: "Outra NC, com o seu item" });
        const publicado = await chamar(editor, "POST", `/api/nc/${nc.id}/investigacoes`, 201, {
            realProblema: "Vedação da bomba hidráulica com desgaste prematuro.",
        });
        const rascunho = await chamar(editor, "POST", `/api/nc/${nc.id}/investigacoes`, 201, {
            realProblema: "Vedação da bomba hidráulica com desgaste prematuro.",
        });
        await chamar(editor, "POST", `/api/nc/${outraNC.id}/investigacoes`, 201, {
            realProblema: "Vedação da bomba hidráulica com desgaste prematuro.",
        });
        await chamar(editor, "POST", `/api/investigacoes/${publicado.id}/publicar`, 200);

        // Chama
        const daNC = await chamar(editor, "GET", `/api/investigacoes?naoConformidadeId=${nc.id}`, 200);
        const abertosDaNC = await chamar(
            editor,
            "GET",
            `/api/investigacoes?naoConformidadeId=${nc.id}&estado=ABERTO`,
            200,
        );

        // Confere
        const ids = (lista: { id: string }[]) => lista.map((item) => item.id).sort();
        expect(ids(daNC)).toEqual([publicado.id, rascunho.id].sort());
        expect(ids(abertosDaNC)).toEqual([publicado.id]);
    });
});

describe("POST /investigacoes/:id/retirar", () => {
    it("o colaborador retira da aprovação (RN-48)", async () => {
        // Prepara
        const { editor, investigacao } = await levarInvestigacaoAte("EM_APROVACAO");

        // Chama e confere
        expect(await chamar(editor, "POST", `/api/investigacoes/${investigacao.id}/retirar`, 200)).toMatchObject({
            estado: "ABERTO",
        });
    });
});
