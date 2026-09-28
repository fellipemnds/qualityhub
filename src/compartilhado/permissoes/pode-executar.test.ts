import { describe, expect, it } from "vitest";
import type { Ator } from "../entidades/ator.js";
import { temPapel } from "./pode-executar.js";

describe("temPapel", () => {
    it("permite quando o ator tem um papel exigido pela ação", () => {
        // Prepara
        const editor: Ator = { id: "1", papeis: ["EDITOR"] };

        // Chama
        const resultado = temPapel(editor, "PUBLICAR");

        // Confere
        expect(resultado).toBe(true);
    });

    it("nega quando nenhum papel do ator é exigido pela ação", () => {
        // Prepara
        const editor: Ator = { id: "1", papeis: ["EDITOR"] };

        // Chama
        const resultado = temPapel(editor, "APROVAR");

        // Confere
        expect(resultado).toBe(false);
    });

    it("nega quando o ator não tem papel nenhum", () => {
        // Prepara
        const semPapel: Ator = { id: "1", papeis: [] };

        // Chama
        const resultado = temPapel(semPapel, "VISUALIZAR");

        // Confere
        expect(resultado).toBe(false);
    });

    it("permite quando só um dos vários papéis do ator é exigido", () => {
        // Prepara
        const qa: Ator = { id: "1", papeis: ["EDITOR", "APROVADOR"] };

        // Chama
        const resultado = temPapel(qa, "APROVAR");

        // Confere
        expect(resultado).toBe(true);
    });

    it("não trata ADMIN como superusuário", () => {
        // Prepara
        const admin: Ator = { id: "1", papeis: ["ADMIN"] };

        // Chama
        const resultado = temPapel(admin, "APROVAR");

        // Confere
        expect(resultado).toBe(false);
    });
});
