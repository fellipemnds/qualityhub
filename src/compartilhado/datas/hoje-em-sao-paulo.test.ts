import { afterEach, describe, expect, it, vi } from "vitest";
import { hojeEmSaoPaulo } from "./hoje-em-sao-paulo.js";

afterEach(() => {
    vi.useRealTimers();
});

// Os testes rodam em UTC (vitest.config.ts): a partir das 21 h de Brasília, o relógio do servidor já está no dia seguinte
describe("hojeEmSaoPaulo", () => {
    it.each([
        { agora: "2026-09-30T20:59:59-03:00", dia: "2026-09-30", caso: "antes das 21 h" },
        { agora: "2026-09-30T21:00:00-03:00", dia: "2026-09-30", caso: "21 h, quando o UTC vira o dia" },
        { agora: "2026-09-30T23:59:59.999-03:00", dia: "2026-09-30", caso: "último instante do dia" },
        { agora: "2026-10-01T00:00:00-03:00", dia: "2026-10-01", caso: "meia-noite de Brasília" },
        { agora: "2026-12-31T23:00:00-03:00", dia: "2026-12-31", caso: "virada do ano" },
        { agora: "2028-02-29T22:00:00-03:00", dia: "2028-02-29", caso: "29 de fevereiro" },
        { agora: "2026-01-05T08:00:00-03:00", dia: "2026-01-05", caso: "mês e dia com zero à esquerda" },
    ])("$caso: $agora → $dia", ({ agora, dia }) => {
        vi.useFakeTimers({ toFake: ["Date"] });
        vi.setSystemTime(agora);

        expect(hojeEmSaoPaulo()).toBe(dia);
    });
});
