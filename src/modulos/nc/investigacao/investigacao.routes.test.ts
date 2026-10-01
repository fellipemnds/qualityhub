import { describe, expect, it } from "vitest";
import { chamar, investigacaoAberta, ncPublicada } from "../../../testes/cenarios.js";
import { type DegrauAcaoCorretiva, levarAcaoCorretivaAte } from "../../../testes/levar-ate/acao-corretiva.js";

describe("PATCH /investigacoes/:id", () => {
    it("recusa método fora da lista (só A3_SPS)", async () => {
        // Prepara
        const { editor, nc } = await ncPublicada();
        const investigacao = await chamar(editor, "POST", `/nc/${nc.id}/investigacoes`, 201, {
            realProblema: "Vedação da bomba hidráulica com desgaste prematuro.",
        });

        // Chama
        const resposta = await chamar(editor, "PATCH", `/investigacoes/${investigacao.id}`, 400, {
            metodo: "SEIS_SIGMA",
        });

        // Confere
        expect(resposta).toMatchObject({
            mensagem: "Dados inválidos",
            error: expect.arrayContaining([expect.objectContaining({ instancePath: "/metodo" })]),
        });
    });
});

describe("POST /investigacoes/:id/submeter", () => {
    it("recusa sem causa raiz preenchida (RN-24)", async () => {
        // Prepara
        const { editor, gerente, aprovador, nc } = await ncPublicada();
        const investigacao = await chamar(editor, "POST", `/nc/${nc.id}/investigacoes`, 201, {
            realProblema: "Vedação da bomba hidráulica com desgaste prematuro.",
        });
        await chamar(editor, "POST", `/investigacoes/${investigacao.id}/publicar`, 200);
        await chamar(gerente, "PUT", `/registros/${investigacao.id}/aprovador`, 200, {
            usuarioId: aprovador.usuario.id,
        });

        // Chama
        const resposta = await chamar(editor, "POST", `/investigacoes/${investigacao.id}/submeter`, 400);

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
            await chamar(aprovador, "POST", `/acoes-corretivas/${acao.id}/decidir`, 200, {
                decisao: "REPROVADO",
                motivo: "O prazo não é compatível com a próxima parada da linha.",
            });
        }
        const { codigo } = await chamar(editor, "GET", `/acoes-corretivas/${acao.id}`, 200);

        // Chama
        const resposta = await chamar(editor, "POST", `/investigacoes/${investigacao.id}/submeter`, 409);

        // Confere: a ação aparece com o código, e a investigação continua aberta
        expect(resposta.error).toEqual([
            expect.objectContaining({
                requisito: "PLANOS_APROVADOS",
                atendido: false,
                pendentes: [{ id: acao.id, codigo }],
            }),
        ]);
        expect(await chamar(editor, "GET", `/investigacoes/${investigacao.id}`, 200)).toMatchObject({
            estado: "ABERTO",
        });
    });

    it.each<DegrauAcaoCorretiva>(["PLANO_APROVADO", "CANCELADO"])(
        "aceita com a ação no degrau %s (RN-24)",
        async (degrau) => {
            // Prepara
            const { editor, investigacao } = await levarAcaoCorretivaAte(degrau);

            // Chama
            const resposta = await chamar(editor, "POST", `/investigacoes/${investigacao.id}/submeter`, 200);

            // Confere
            expect(resposta).toMatchObject({ estado: "EM_APROVACAO" });
        },
    );

    it("aceita sem nenhuma ação (PRD Q17)", async () => {
        // Prepara
        const { editor, investigacao } = await investigacaoAberta();

        // Chama
        const resposta = await chamar(editor, "POST", `/investigacoes/${investigacao.id}/submeter`, 200);

        // Confere
        expect(resposta).toMatchObject({ estado: "EM_APROVACAO" });
    });
});

describe("GET /investigacoes", () => {
    it("filtra por NC e por estado", async () => {
        // Prepara: dois itens na NC do cenário (um publicado) e um em outra NC
        const { editor, nc } = await ncPublicada();
        const outraNC = await chamar(editor, "POST", "/nc", 201, { titulo: "Outra NC, com o seu item" });
        const publicado = await chamar(editor, "POST", `/nc/${nc.id}/investigacoes`, 201, {
            realProblema: "Vedação da bomba hidráulica com desgaste prematuro.",
        });
        const rascunho = await chamar(editor, "POST", `/nc/${nc.id}/investigacoes`, 201, {
            realProblema: "Vedação da bomba hidráulica com desgaste prematuro.",
        });
        await chamar(editor, "POST", `/nc/${outraNC.id}/investigacoes`, 201, {
            realProblema: "Vedação da bomba hidráulica com desgaste prematuro.",
        });
        await chamar(editor, "POST", `/investigacoes/${publicado.id}/publicar`, 200);

        // Chama
        const daNC = await chamar(editor, "GET", `/investigacoes?naoConformidadeId=${nc.id}`, 200);
        const abertosDaNC = await chamar(editor, "GET", `/investigacoes?naoConformidadeId=${nc.id}&estado=ABERTO`, 200);

        // Confere
        const ids = (lista: { id: string }[]) => lista.map((item) => item.id).sort();
        expect(ids(daNC)).toEqual([publicado.id, rascunho.id].sort());
        expect(ids(abertosDaNC)).toEqual([publicado.id]);
    });
});
