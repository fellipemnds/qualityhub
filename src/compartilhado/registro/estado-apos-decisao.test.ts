import { describe, expect, it } from "vitest";

import { estadoAposDecisao } from "./estado-apos-decisao.js";

// Teste de função pura: sem banco, sem login, sem chamar a API
describe("estadoAposDecisao", () => {
    it("reprovado: volta a ABERTO, feche ou não ao aprovar", () => {
        expect(estadoAposDecisao("REPROVADO", { fecharAoAprovar: true })).toBe("ABERTO");
        expect(estadoAposDecisao("REPROVADO", { fecharAoAprovar: false })).toBe("ABERTO");
    });

    it("aprovado, fechando ao aprovar (NC, contenção, classificação, investigação): FECHADO", () => {
        expect(estadoAposDecisao("APROVADO", { fecharAoAprovar: true })).toBe("FECHADO");
    });

    it("aprovado, sem fechar ao aprovar (plano da Ação Corretiva): volta a ABERTO", () => {
        expect(estadoAposDecisao("APROVADO", { fecharAoAprovar: false })).toBe("ABERTO");
    });
});
