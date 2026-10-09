import { describe, expect, it } from "vitest";
import type { EstadoRegistro } from "../../../compartilhado/entidades/estados.js";
import { prisma } from "../../../compartilhado/prisma/cliente.js";
import { cicloVidaService } from "../../../compartilhado/registro/ciclo-vida.service.js";
import {
    aprovarPlano,
    chamar,
    investigacaoAberta,
    ncPublicada,
    pausarNoMeio,
    statusDe,
} from "../../../testes/cenarios.js";
import { loginComo } from "../../../testes/fabricas.js";
import { type DegrauAcaoCorretiva, levarAcaoCorretivaAte } from "../../../testes/levar-ate/acao-corretiva.js";
import { levarInvestigacaoAte } from "../../../testes/levar-ate/investigacao.js";
import { levarNCAte } from "../../../testes/levar-ate/nc.js";

const ID_INEXISTENTE = "00000000-0000-0000-0000-000000000000";

// Filho novo só com a NC em rascunho ou aberta (RN-51, B29): em aprovação, retira-se o envio; fechada, reabre-se
describe("POST /nc/:naoConformidadeId/investigacoes", () => {
    it.each<EstadoRegistro>(["EM_APROVACAO", "FECHADO", "CANCELADO"])(
        "recusa com a NC em %s, e nada nasce (RN-51, B29)",
        async (estado) => {
            // Prepara
            const { editor, nc } = await levarNCAte(estado);
            const antes = await prisma.investigacao.count({ where: { naoConformidadeId: nc.id } });

            // Chama
            const resposta = await chamar(editor, "POST", `/api/nc/${nc.id}/investigacoes`, 409, {
                realProblema: "Ruído anormal no redutor da esteira, percebido na mesma inspeção da linha 2.",
            });

            // Confere
            expect(resposta).toEqual({
                mensagem: "Só uma NC em rascunho ou aberta recebe itens novos: retire o envio ou reabra a NC.",
            });
            expect(await prisma.investigacao.count({ where: { naoConformidadeId: nc.id } })).toBe(antes);
        },
    );
});

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
    it("traz o motivo da última reprovação, para o colaborador saber o que corrigir (L7)", async () => {
        // Prepara
        const { editor, aprovador, investigacao } = await levarInvestigacaoAte("EM_APROVACAO");
        await chamar(aprovador, "POST", `/api/investigacoes/${investigacao.id}/decidir`, 200, {
            decisao: "REPROVADO",
            motivo: "Faltou detalhar o que foi feito.",
        });

        // Chama
        const resposta = await chamar(editor, "GET", `/api/investigacoes/${investigacao.id}`, 200);

        // Confere
        expect(resposta).toMatchObject({ ultimoMotivoReprovacao: "Faltou detalhar o que foi feito." });
    });

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

    // O envio lê as ações e, antes de gravar, uma ação nova é criada: sem a trava da linha da investigação, as duas
    // passavam, e a investigação ia para a aprovação com uma ação sem plano aprovado (B30)
    it("criar uma ação no meio do envio: a ação espera o envio e é recusada (RN-24, B30)", async () => {
        // Prepara
        const cenario = await investigacaoAberta();
        const { editor, nc, investigacao } = cenario;
        await aprovarPlano(cenario);
        const pausa = pausarNoMeio(cicloVidaService, "submeter", () =>
            statusDe(editor, "POST", `/api/nc/${nc.id}/acoes-corretivas`, { investigacaoId: investigacao.id }),
        );

        // Chama
        await chamar(editor, "POST", `/api/investigacoes/${investigacao.id}/submeter`, 200);

        // Confere: a ação viu a investigação já em aprovação
        expect(await pausa.outra()).toBe(400);
        expect(await prisma.acaoCorretiva.count({ where: { investigacaoId: investigacao.id } })).toBe(1);
    });

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

    it("criar uma ação no meio do cancelamento: a ação espera e é recusada (RN-50, B31)", async () => {
        // Prepara
        const { editor, aprovador, nc, investigacao } = await investigacaoAberta();
        const pausa = pausarNoMeio(cicloVidaService, "cancelar", () =>
            statusDe(editor, "POST", `/api/nc/${nc.id}/acoes-corretivas`, { investigacaoId: investigacao.id }),
        );

        // Chama
        await chamar(aprovador, "POST", `/api/investigacoes/${investigacao.id}/cancelar`, 200, motivo);

        // Confere: nunca uma investigação cancelada com uma ação viva
        expect(await pausa.outra()).toBe(400);
        expect(await prisma.acaoCorretiva.count({ where: { investigacaoId: investigacao.id } })).toBe(0);
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
        const ids = (pagina: { itensDaPagina: { id: string }[] }) => pagina.itensDaPagina.map((item) => item.id).sort();
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
