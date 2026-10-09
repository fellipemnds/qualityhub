import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { erroSchema } from "../../compartilhado/errors/erro.schema.js";
import { autenticar } from "../../middlewares/autenticar.js";
import { setorController } from "./setor.controller.js";
import {
    criarSetorSchema,
    editarSetorSchema,
    setorFiltrosListagemSchema,
    setorIdSchema,
    setorRespostaSchema,
} from "./setor.schema.js";

export async function setorRoutes(app: FastifyInstance) {
    app.withTypeProvider<ZodTypeProvider>().route({
        method: "GET",
        url: "/setores",
        onRequest: [autenticar],
        schema: {
            querystring: setorFiltrosListagemSchema,
            response: { 200: z.array(setorRespostaSchema), "4xx": erroSchema },
        },
        handler: setorController.listar,
    });

    app.withTypeProvider<ZodTypeProvider>().route({
        method: "POST",
        url: "/setores",
        onRequest: [autenticar],
        schema: {
            body: criarSetorSchema,
            response: { 201: setorRespostaSchema, "4xx": erroSchema },
        },
        handler: setorController.criar,
    });

    app.withTypeProvider<ZodTypeProvider>().route({
        method: "PATCH",
        url: "/setores/:id",
        onRequest: [autenticar],
        schema: {
            params: setorIdSchema,
            body: editarSetorSchema,
            response: { 200: setorRespostaSchema, "4xx": erroSchema },
        },
        handler: setorController.renomear,
    });

    app.withTypeProvider<ZodTypeProvider>().route({
        method: "POST",
        url: "/setores/:id/desativar",
        onRequest: [autenticar],
        schema: {
            params: setorIdSchema,
            response: { 200: setorRespostaSchema, "4xx": erroSchema },
        },
        handler: setorController.desativar,
    });

    app.withTypeProvider<ZodTypeProvider>().route({
        method: "POST",
        url: "/setores/:id/reativar",
        onRequest: [autenticar],
        schema: {
            params: setorIdSchema,
            response: { 200: setorRespostaSchema, "4xx": erroSchema },
        },
        handler: setorController.reativar,
    });
}
