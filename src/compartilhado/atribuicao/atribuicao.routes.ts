import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";
import { autenticar } from "../../middlewares/autenticar.js";
import { atribuicaoController } from "./atribuicao.controller.js";
import { colaboradoresSchema, definirAprovadorSchema } from "./atribuicao.schema.js";

export async function atribuicaoRoutes(app: FastifyInstance) {
    app.withTypeProvider<ZodTypeProvider>().route({
        method: "PUT",
        url: "/registros/:id/aprovador",
        onRequest: [autenticar],
        schema: {
            params: z.object({ id: z.uuid() }),
            body: definirAprovadorSchema,
        },
        handler: atribuicaoController.definirAprovador,
    });

    app.withTypeProvider<ZodTypeProvider>().route({
        method: "POST",
        url: "/registros/:id/colaboradores",
        onRequest: [autenticar],
        schema: {
            params: z.object({ id: z.uuid() }),
            body: colaboradoresSchema,
        },
        handler: atribuicaoController.adicionarColaboradores,
    });

    app.withTypeProvider<ZodTypeProvider>().route({
        method: "DELETE",
        url: "/registros/:id/colaboradores",
        onRequest: [autenticar],
        schema: {
            params: z.object({ id: z.uuid() }),
            body: colaboradoresSchema,
        },
        handler: atribuicaoController.removerColaboradores,
    });
}
