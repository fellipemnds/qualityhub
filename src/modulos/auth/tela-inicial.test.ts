import { describe, expect, it } from "vitest";
import { Papel } from "../../compartilhado/entidades/papeis.js";
import { telaInicial } from "./tela-inicial.js";

// Teste de função pura: sem banco, sem login, sem chamar a API (fluxo-app.md §2.1 e §3)
describe("telaInicial", () => {
    it("gestor da qualidade (editor, aprovador e gerente): começa nas pendências, pode escolher relatórios", () => {
        expect(telaInicial([Papel.EDITOR, Papel.APROVADOR, Papel.GERENTE], null)).toEqual({
            telaInicial: "PENDENCIAS",
            telasIniciais: ["PENDENCIAS", "NCS", "RELATORIOS"],
        });
    });

    it("só gerente: começa nos relatórios", () => {
        expect(telaInicial([Papel.GERENTE], null)).toEqual({
            telaInicial: "RELATORIOS",
            telasIniciais: ["PENDENCIAS", "NCS", "RELATORIOS"],
        });
    });

    it("só visualizador: a lista de NCs, sem outra opção", () => {
        expect(telaInicial([Papel.VISUALIZADOR], null)).toEqual({ telaInicial: "NCS", telasIniciais: ["NCS"] });
    });

    it("só admin: usuários, a única área dele", () => {
        expect(telaInicial([Papel.ADMIN], null)).toEqual({ telaInicial: "USUARIOS", telasIniciais: ["USUARIOS"] });
    });

    it("sem papel: nenhuma tela", () => {
        expect(telaInicial([], null)).toEqual({ telaInicial: null, telasIniciais: [] });
    });

    it("a preferência vale enquanto os papéis a permitem", () => {
        expect(telaInicial([Papel.EDITOR, Papel.GERENTE], "RELATORIOS").telaInicial).toBe("RELATORIOS");
    });

    it("perdeu o papel da tela escolhida: volta para o padrão", () => {
        expect(telaInicial([Papel.EDITOR], "RELATORIOS").telaInicial).toBe("PENDENCIAS");
    });
});
