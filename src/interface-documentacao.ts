import type { FastifyInstance } from "fastify";

// A página navegável do OpenAPI em /api/docs, com o JSON em /api/docs/json (TRD §7.2). Só em desenvolvimento: o Orval roda
// contra o servidor local, e produção não publica o mapa da API para quem não tem login. O pacote é dependência de
// desenvolvimento, por isso o import() fica depois do if: desligada, ele nem precisa estar instalado
export async function interfaceDaDocumentacao(app: FastifyInstance, opcoes: { ligada: boolean }) {
    if (!opcoes.ligada) return;

    const { default: fastifySwaggerUi } = await import("@fastify/swagger-ui");
    await app.register(fastifySwaggerUi, { routePrefix: "/api/docs" });
}
