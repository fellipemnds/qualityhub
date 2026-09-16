import type { FastifyInstance } from "fastify";
import { ncController } from "./nc.controller.js";
import { autenticar } from "../../middlewares/autenticar.js"
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { ncRascunhoSchema } from "./nc.schema.js";
import { decisaoSchema } from "../../compartilhado/registro/decidir.schema.js";
import { motivoSchema } from "../../compartilhado/registro/motivo.schema.js";
import z from "zod";

export async function ncRoutes(app: FastifyInstance) {

    app.withTypeProvider<ZodTypeProvider>().route({
        method: "POST",
        url: "/nc",
        onRequest: [autenticar],
        schema: {
            body: ncRascunhoSchema
        },
        handler: ncController.criarRascunhoNC
    });

    app.withTypeProvider<ZodTypeProvider>().route({
        method: "PATCH",
        url: "/nc/:id",
        onRequest: [autenticar],
        schema: {
            params: z.object({ id: z.uuid() }),
            body: ncRascunhoSchema
        },
        handler: ncController.salvarRascunhoNC
    });

    app.withTypeProvider<ZodTypeProvider>().route({
        method: "DELETE",
        url: "/nc/:id",
        onRequest: [autenticar],
        schema: {
            params: z.object({ id: z.uuid() })
        },
        handler: ncController.excluirRascunhoNC
    });

    app.withTypeProvider<ZodTypeProvider>().route({
        method: "POST",
        url: "/nc/:id/publicar",
        onRequest: [autenticar],
        schema: {
            params: z.object({ id: z.uuid() })
        },
        handler: ncController.publicarNC
    });

    app.withTypeProvider<ZodTypeProvider>().route({
        method: "POST",
        url: "/nc/:id/submeter",
        onRequest: [autenticar],
        schema: {
            params: z.object({ id: z.uuid() })
        },
        handler: ncController.submeterNC
    });

    app.withTypeProvider<ZodTypeProvider>().route({
        method: "POST",
        url: "/nc/:id/decidir",
        onRequest: [autenticar],
        schema: {
            params: z.object({ id: z.uuid() }),
            body: decisaoSchema
        },
        handler: ncController.decidirNC
    });

    app.withTypeProvider<ZodTypeProvider>().route({
        method: "POST",
        url: "/nc/:id/reabrir",
        onRequest: [autenticar],
        schema: {
            params: z.object({ id: z.uuid() }),
            body: motivoSchema
        },
        handler: ncController.reabrirNC
    });

    app.withTypeProvider<ZodTypeProvider>().route({
        method: "POST",
        url: "/nc/:id/cancelar",
        onRequest: [autenticar],
        schema: {
            params: z.object({ id: z.uuid() }),
            body: motivoSchema
        },
        handler: ncController.cancelarNC
    });

    app.withTypeProvider<ZodTypeProvider>().route({
        method: "GET",
        url: "/nc/:id",
        onRequest: [autenticar],
        schema: {
            params: z.object({ id: z.uuid() })
        },
        handler: ncController.buscarPorIdNC
    });

    app.withTypeProvider<ZodTypeProvider>().route({
        method: "GET",
        url: "/nc",
        onRequest: [autenticar],
        handler: ncController.listarNC
    });
}