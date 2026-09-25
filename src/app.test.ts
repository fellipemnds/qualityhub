import { describe, expect, it } from "vitest";
import { app } from "./app.js";

describe("GET /", () => {
    it("responde que o servidor está online", async () => {
        // Chama
        const resposta = await app.inject({ method: "GET", url: "/" });

        // Confere
        expect(resposta.statusCode).toBe(200);
        expect(resposta.json()).toEqual({ status: "Servidor online" });
    });
});
