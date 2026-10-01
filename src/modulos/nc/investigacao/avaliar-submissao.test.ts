import { describe, expect, it } from "vitest";

import { type AcaoNaGuarda, avaliarSubmissaoInvestigacao } from "./avaliar-submissao.js";

function acao(dados: Partial<AcaoNaGuarda>): AcaoNaGuarda {
    return { id: "1", codigo: "AC-2026-0001", estado: "ABERTO", planoAprovado: true, ...dados };
}

// Teste de função pura, como o da guarda da NC: monta as ações, chama a função, confere a lista
describe("avaliarSubmissaoInvestigacao", () => {
    it("sem nenhuma ação: PLANOS_APROVADOS atendido (PRD Q17)", () => {
        // Chama
        const resultado = avaliarSubmissaoInvestigacao({ acoes: [] });

        // Confere
        expect(resultado).toMatchObject([{ requisito: "PLANOS_APROVADOS", atendido: true, pendentes: [] }]);
    });

    it("todas as ações com plano aprovado, mesmo já executadas: atendido", () => {
        // Prepara
        const acoes = [acao({ id: "1" }), acao({ id: "2", codigo: "AC-2026-0002", estado: "FECHADO" })];

        // Chama
        const resultado = avaliarSubmissaoInvestigacao({ acoes });

        // Confere
        expect(resultado).toMatchObject([{ requisito: "PLANOS_APROVADOS", atendido: true, pendentes: [] }]);
    });

    it("ação sem plano aprovado: não atendido, com ela em pendentes (RN-24)", () => {
        // Prepara: uma aprovada e uma ainda em aprovação
        const acoes = [
            acao({ id: "1" }),
            acao({ id: "2", codigo: "AC-2026-0002", estado: "EM_APROVACAO", planoAprovado: false }),
        ];

        // Chama
        const resultado = avaliarSubmissaoInvestigacao({ acoes });

        // Confere
        expect(resultado).toMatchObject([
            { requisito: "PLANOS_APROVADOS", atendido: false, pendentes: [{ id: "2", codigo: "AC-2026-0002" }] },
        ]);
    });

    it("ação em rascunho conta como pendente, mesmo sem código", () => {
        // Prepara
        const acoes = [acao({ id: "1", codigo: null, estado: "RASCUNHO", planoAprovado: false })];

        // Chama
        const resultado = avaliarSubmissaoInvestigacao({ acoes });

        // Confere
        expect(resultado).toMatchObject([{ atendido: false, pendentes: [{ id: "1", codigo: null }] }]);
    });

    it("ação cancelada não conta", () => {
        // Prepara
        const acoes = [acao({ id: "1", estado: "CANCELADO", planoAprovado: false })];

        // Chama
        const resultado = avaliarSubmissaoInvestigacao({ acoes });

        // Confere
        expect(resultado).toMatchObject([{ atendido: true, pendentes: [] }]);
    });
});
