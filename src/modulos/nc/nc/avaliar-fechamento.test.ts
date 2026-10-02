import { describe, expect, it } from "vitest";

import { avaliarFechamentoNC, type DadosFechamentoNC } from "./avaliar-fechamento.js";

function dadosCompletos(): DadosFechamentoNC {
    return {
        riscosRevisados: "Riscos revisados de teste.",
        mudancasSGQ: "Mudanças SGQ de teste.",
        temAprovador: true,
        classificacoes: [{ id: "1", codigo: "CL-2026-0001", estado: "FECHADO" }],
        investigacoes: [{ id: "1", codigo: "IV-2026-0001", estado: "FECHADO" }],
        contencoes: [{ id: "1", codigo: "CT-2026-0001", estado: "FECHADO" }],
    };
}

// Teste de função pura: sem banco, sem login, sem chamar a API. Monta os dados, chama a função, confere a lista
describe("avaliarFechamentoNC", () => {
    // Filhos
    it("sem classificação fechada: CLASSIFICACAO_FECHADA não atendida", () => {
        // Prepara
        const dados: DadosFechamentoNC = {
            ...dadosCompletos(),
            classificacoes: [{ id: "1", codigo: null, estado: "RASCUNHO" }],
        };

        // Chama
        const resultado = avaliarFechamentoNC(dados);

        // Confere
        const item = resultado.find((i) => i.requisito === "CLASSIFICACAO_FECHADA");
        expect(item).toMatchObject({ atendido: false });
    });

    it("sem nenhuma investigação: INVESTIGACOES_FECHADAS não atendida", () => {
        // Prepara
        const dados: DadosFechamentoNC = {
            ...dadosCompletos(),
            investigacoes: [],
        };

        // Chama
        const resultado = avaliarFechamentoNC(dados);

        // Confere
        const item = resultado.find((i) => i.requisito === "INVESTIGACOES_FECHADAS");
        expect(item).toMatchObject({ atendido: false });
    });

    it("uma investigação fechada e outra aberta: INVESTIGACOES_FECHADAS não atendida, com a aberta em pendentes", () => {
        // Prepara
        const dados: DadosFechamentoNC = {
            ...dadosCompletos(),
            investigacoes: [
                { id: "1", codigo: null, estado: "FECHADO" },
                { id: "2", codigo: "IV-2026-0002", estado: "ABERTO" },
            ],
        };

        // Chama
        const resultado = avaliarFechamentoNC(dados);

        // Confere
        const item = resultado.find((i) => i.requisito === "INVESTIGACOES_FECHADAS");
        expect(item).toMatchObject({
            atendido: false,
            pendentes: [{ id: "2", codigo: "IV-2026-0002" }],
        });
    });

    it("investigação cancelada não conta, nem como fechada nem como pendente", () => {
        // Prepara
        const dados: DadosFechamentoNC = {
            ...dadosCompletos(),
            investigacoes: [
                { id: "1", codigo: null, estado: "FECHADO" },
                { id: "2", codigo: "IV-2026-0002", estado: "CANCELADO" },
            ],
        };

        // Chama
        const resultado = avaliarFechamentoNC(dados);

        // Confere
        const item = resultado.find((i) => i.requisito === "INVESTIGACOES_FECHADAS");
        expect(item).toMatchObject({
            atendido: true,
            pendentes: [],
        });
    });

    it("contenção aberta: CONTENCOES_RESOLVIDAS não atendida, com ela em pendentes", () => {
        // Prepara
        const dados: DadosFechamentoNC = {
            ...dadosCompletos(),
            contencoes: [
                { id: "1", codigo: "CT-2026-0001", estado: "ABERTO" },
                { id: "2", codigo: null, estado: "FECHADO" },
            ],
        };

        // Chama
        const resultado = avaliarFechamentoNC(dados);

        // Confere
        const item = resultado.find((i) => i.requisito === "CONTENCOES_RESOLVIDAS");
        expect(item).toMatchObject({
            atendido: false,
            pendentes: [{ id: "1", codigo: "CT-2026-0001" }],
        });
    });

    it("contenção cancelada ou fechada CONTENCOES_RESOLVIDAS atendida (RN-22)", () => {
        // Prepara
        const dados: DadosFechamentoNC = {
            ...dadosCompletos(),
            contencoes: [
                { id: "1", codigo: "CT-2026-0001", estado: "CANCELADO" },
                { id: "2", codigo: null, estado: "FECHADO" },
            ],
        };

        // Chama
        const resultado = avaliarFechamentoNC(dados);

        // Confere
        const item = resultado.find((i) => i.requisito === "CONTENCOES_RESOLVIDAS");
        expect(item).toMatchObject({
            atendido: true,
            pendentes: [],
        });
    });

    it("nenhuma contenção: CONTENCOES_RESOLVIDAS atendida (RN-22)", () => {
        // Prepara
        const dados: DadosFechamentoNC = {
            ...dadosCompletos(),
            contencoes: [],
        };

        // Chama
        const resultado = avaliarFechamentoNC(dados);

        // Confere
        const item = resultado.find((i) => i.requisito === "CONTENCOES_RESOLVIDAS");
        expect(item).toMatchObject({
            atendido: true,
            pendentes: [],
        });
    });

    // Envio
    it("riscos revisados e mudanças SGQ vazios: os dois itens não atendidos", () => {
        // Prepara
        const dados: DadosFechamentoNC = {
            ...dadosCompletos(),
            riscosRevisados: "     ",
            mudancasSGQ: null,
        };

        // Chama
        const resultado = avaliarFechamentoNC(dados);

        // Confere
        const item1 = resultado.find((i) => i.requisito === "RISCOS_REVISADOS");
        expect(item1).toMatchObject({
            atendido: false,
            pendentes: [],
        });
        const item2 = resultado.find((i) => i.requisito === "MUDANCAS_SGQ");
        expect(item2).toMatchObject({
            atendido: false,
            pendentes: [],
        });
    });

    it("sem aprovador: APROVADOR_DEFINIDO não atendido (RN-13)", () => {
        // Prepara
        const dados: DadosFechamentoNC = {
            ...dadosCompletos(),
            temAprovador: false,
        };

        // Chama
        const resultado = avaliarFechamentoNC(dados);

        // Confere
        const item = resultado.find((i) => i.requisito === "APROVADOR_DEFINIDO");
        expect(item).toMatchObject({
            atendido: false,
            pendentes: [],
        });
    });

    // A lista inteira
    it("tudo atendido: seis itens, todos atendidos, na ordem e no grupo certos", () => {
        // Prepara
        const dados: DadosFechamentoNC = {
            ...dadosCompletos(),
        };

        // Chama
        const resultado = avaliarFechamentoNC(dados);

        // Confere
        expect(resultado).toMatchObject([
            { requisito: "CLASSIFICACAO_FECHADA", grupo: "FILHOS", atendido: true },
            { requisito: "INVESTIGACOES_FECHADAS", grupo: "FILHOS", atendido: true },
            { requisito: "CONTENCOES_RESOLVIDAS", grupo: "FILHOS", atendido: true },
            { requisito: "RISCOS_REVISADOS", grupo: "ENVIO", atendido: true },
            { requisito: "MUDANCAS_SGQ", grupo: "ENVIO", atendido: true },
            { requisito: "APROVADOR_DEFINIDO", grupo: "ENVIO", atendido: true },
        ]);
    });
});
