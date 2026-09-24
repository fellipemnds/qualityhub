import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { autenticar } from "../../middlewares/autenticar.js";
import { usuarioController } from "./usuario.controller.js";
import { criarUsuarioSchema } from "./usuario.schema.js";

export async function usuarioRoutes(app: FastifyInstance) {
    app.withTypeProvider<ZodTypeProvider>().route({
        method: "POST",
        url: "/usuarios",
        onRequest: [autenticar],
        schema: {
            body: criarUsuarioSchema,
        },
        handler: usuarioController.criar,
    });
}
