import fastifySwagger from "@fastify/swagger";
import Fastify from "fastify";
import { describe, expect, it } from "vitest";
import { app } from "./app.js";
import { interfaceDaDocumentacao } from "./interface-documentacao.js";

describe("Interface da documentação (/api/docs)", () => {
    it("fora do desenvolvimento, não existe: nem a página nem o JSON", async () => {
        // Chama (os testes rodam com NODE_ENV=test)
        const pagina = await app.inject({ method: "GET", url: "/api/docs" });
        const json = await app.inject({ method: "GET", url: "/api/docs/json" });

        // Confere
        expect(pagina.statusCode).toBe(404);
        expect(json.statusCode).toBe(404);
    });

    it("ligada, publica a página e o OpenAPI em /api/docs/json", async () => {
        // Prepara: um app só deste teste, com o documento montado e a interface ligada
        const comInterface = Fastify();
        await comInterface.register(fastifySwagger, {
            openapi: { openapi: "3.1.0", info: { title: "Teste", version: "1.0.0" } },
        });
        await comInterface.register(interfaceDaDocumentacao, { ligada: true });

        // Chama
        const pagina = await comInterface.inject({ method: "GET", url: "/api/docs" });
        const json = await comInterface.inject({ method: "GET", url: "/api/docs/json" });

        // Confere (a página pode redirecionar para o index dela)
        expect(pagina.statusCode).toBeLessThan(400);
        expect(json.statusCode).toBe(200);
        expect(json.json()).toMatchObject({ openapi: "3.1.0" });
    });
});
