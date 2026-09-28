import { describe, expect, it } from "vitest";
import { paginar } from "./paginacao-cursor.js";

describe("paginar", () => {
    it("devolve página vazia e sem cursor quando não há itens", () => {
        // Prepara
        const listaSemItens: Array<{ id: string }> = [];
        const limite = 2;

        // Chama
        const resultado = paginar(listaSemItens, limite);

        // Confere
        expect(resultado).toEqual({ itensDaPagina: [], proximoCursor: null });
    });

    it("não devolve cursor quando há menos itens que o limite", () => {
        // Prepara
        const lista = [{ id: "a" }];
        const limite = 2;

        // Chama
        const resultado = paginar(lista, limite);

        // Confere
        expect(resultado).toEqual({ itensDaPagina: [{ id: "a" }], proximoCursor: null });
    });

    it("não devolve cursor quando há exatamente o limite", () => {
        // Prepara
        const lista = [{ id: "a" }, { id: "b" }];
        const limite = 2;

        // Chama
        const resultado = paginar(lista, limite);

        // Confere
        expect(resultado).toEqual({ itensDaPagina: [{ id: "a" }, { id: "b" }], proximoCursor: null });
    });

    it("corta no limite e usa o último item da página como cursor quando há mais itens", () => {
        // Prepara
        const lista = [{ id: "a" }, { id: "b" }, { id: "c" }];
        const limite = 2;

        // Chama
        const resultado = paginar(lista, limite);

        // Confere
        expect(resultado).toEqual({ itensDaPagina: [{ id: "a" }, { id: "b" }], proximoCursor: "b" });
    });
});
