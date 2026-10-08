import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { erroSchema } from "../../compartilhado/errors/erro.schema.js";
import { autenticar } from "../../middlewares/autenticar.js";
import { usuarioController } from "./usuario.controller.js";
import { criarUsuarioSchema, usuarioCriadoRespostaSchema } from "./usuario.schema.js";

export async function usuarioRoutes(app: FastifyInstance) {
    app.withTypeProvider<ZodTypeProvider>().route({
        method: "POST",
        url: "/usuarios",
        onRequest: [autenticar],
        schema: {
            body: criarUsuarioSchema,
            response: { 201: usuarioCriadoRespostaSchema, "4xx": erroSchema },
        },
        handler: usuarioController.criar,
    });
}
