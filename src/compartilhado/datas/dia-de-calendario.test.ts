import { describe, expect, it } from "vitest";
import { diaDeCalendario } from "./dia-de-calendario.js";

describe("diaDeCalendario", () => {
    it("aceita AAAA-MM-DD e guarda a meia-noite UTC do dia (TRD §6)", () => {
        expect(diaDeCalendario().parse("2026-09-10")).toEqual(new Date("2026-09-10T00:00:00.000Z"));
    });

    it.each([
        { valor: "2026-09-10T10:00:00.000Z", caso: "data com hora" },
        { valor: "2026-09-10T22:00:00-03:00", caso: "data com hora e fuso" },
        { valor: "2026-02-30", caso: "dia que não existe" },
        { valor: "10/09/2026", caso: "formato brasileiro" },
        { valor: "", caso: "texto vazio" },
        { valor: 0, caso: "número (milissegundos)" },
        { valor: null, caso: "null" },
    ])("recusa $caso", ({ valor }) => {
        expect(diaDeCalendario().safeParse(valor).success).toBe(false);
    });
});
