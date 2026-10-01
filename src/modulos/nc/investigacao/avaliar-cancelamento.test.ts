import { describe, expect, it } from "vitest";

import { avaliarCancelamentoInvestigacao } from "./avaliar-cancelamento.js";

describe("avaliarCancelamentoInvestigacao", () => {
    it("sem nenhuma ação: ACOES_RESOLVIDAS atendido", () => {
        // Chama
        const resultado = avaliarCancelamentoInvestigacao({ acoes: [] });

        // Confere
        expect(resultado).toMatchObject([{ requisito: "ACOES_RESOLVIDAS", atendido: true, pendentes: [] }]);
    });

    it("ações canceladas ou fechadas: atendido (RN-50)", () => {
        // Prepara
        const acoes = [
            { id: "1", codigo: "AC-2026-0001", estado: "CANCELADO" as const },
            { id: "2", codigo: "AC-2026-0002", estado: "FECHADO" as const },
        ];

        // Chama
        const resultado = avaliarCancelamentoInvestigacao({ acoes });

        // Confere
        expect(resultado).toMatchObject([{ atendido: true, pendentes: [] }]);
    });

    it("ação ainda em andamento: não atendido, com ela em pendentes (RN-50)", () => {
        // Prepara
        const acoes = [
            { id: "1", codigo: "AC-2026-0001", estado: "FECHADO" as const },
            { id: "2", codigo: "AC-2026-0002", estado: "ABERTO" as const },
        ];

        // Chama
        const resultado = avaliarCancelamentoInvestigacao({ acoes });

        // Confere
        expect(resultado).toMatchObject([{ atendido: false, pendentes: [{ id: "2", codigo: "AC-2026-0002" }] }]);
    });
});
