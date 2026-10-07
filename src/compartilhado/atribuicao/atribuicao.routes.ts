import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";
import { autenticar } from "../../middlewares/autenticar.js";
import { erroSchema } from "../errors/erro.schema.js";
import { atribuicaoController } from "./atribuicao.controller.js";
import {
    atribuicaoRespostaSchema,
    colaboradoresAdicionadosRespostaSchema,
    colaboradoresRemovidosRespostaSchema,
    colaboradoresSchema,
    definirAprovadorSchema,
} from "./atribuicao.schema.js";

export async function atribuicaoRoutes(app: FastifyInstance) {
    app.withTypeProvider<ZodTypeProvider>().route({
        method: "PUT",
        url: "/registros/:id/aprovador",
        onRequest: [autenticar],
        schema: {
            params: z.object({ id: z.uuid() }),
            body: definirAprovadorSchema,
            response: { 200: atribuicaoRespostaSchema, "4xx": erroSchema },
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
            response: { 200: colaboradoresAdicionadosRespostaSchema, "4xx": erroSchema },
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
            response: { 200: colaboradoresRemovidosRespostaSchema, "4xx": erroSchema },
        },
        handler: atribuicaoController.removerColaboradores,
    });
}
