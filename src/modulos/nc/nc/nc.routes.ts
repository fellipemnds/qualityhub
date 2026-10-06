import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";
import { erroSchema } from "../../../compartilhado/errors/erro.schema.js";
import { decisaoSchema } from "../../../compartilhado/registro/decidir.schema.js";
import { motivoSchema } from "../../../compartilhado/registro/motivo.schema.js";
import { paginaSchema } from "../../../compartilhado/registro/paginacao-cursor.js";
import { autenticar } from "../../../middlewares/autenticar.js";
import { ncController } from "./nc.controller.js";
import {
    checklistFechamentoRespostaSchema,
    ncFiltrosListagemSchema,
    ncRascunhoSchema,
    ncRespostaSchema,
} from "./nc.schema.js";

export async function ncRoutes(app: FastifyInstance) {
    app.withTypeProvider<ZodTypeProvider>().route({
        method: "POST",
        url: "/nc",
        onRequest: [autenticar],
        schema: {
            body: ncRascunhoSchema,
            response: { 201: ncRespostaSchema, "4xx": erroSchema },
        },
        handler: ncController.criarRascunhoNC,
    });

    app.withTypeProvider<ZodTypeProvider>().route({
        method: "PATCH",
        url: "/nc/:id",
        onRequest: [autenticar],
        schema: {
            params: z.object({ id: z.uuid() }),
            body: ncRascunhoSchema,
        },
        handler: ncController.atualizarNC,
    });

    app.withTypeProvider<ZodTypeProvider>().route({
        method: "DELETE",
        url: "/nc/:id",
        onRequest: [autenticar],
        schema: {
            params: z.object({ id: z.uuid() }),
            response: { 204: z.null(), "4xx": erroSchema },
        },
        handler: ncController.excluirRascunhoNC,
    });

    app.withTypeProvider<ZodTypeProvider>().route({
        method: "POST",
        url: "/nc/:id/publicar",
        onRequest: [autenticar],
        schema: {
            params: z.object({ id: z.uuid() }),
            response: { 200: ncRespostaSchema, "4xx": erroSchema },
        },
        handler: ncController.publicarNC,
    });

    app.withTypeProvider<ZodTypeProvider>().route({
        method: "POST",
        url: "/nc/:id/submeter",
        onRequest: [autenticar],
        schema: {
            params: z.object({ id: z.uuid() }),
            response: { 200: ncRespostaSchema, "4xx": erroSchema },
        },
        handler: ncController.submeterNC,
    });

    app.withTypeProvider<ZodTypeProvider>().route({
        method: "POST",
        url: "/nc/:id/retirar",
        onRequest: [autenticar],
        schema: {
            params: z.object({ id: z.uuid() }),
            response: { 200: ncRespostaSchema, "4xx": erroSchema },
        },
        handler: ncController.retirarNC,
    });

    app.withTypeProvider<ZodTypeProvider>().route({
        method: "GET",
        url: "/nc/:id/checklist-fechamento",
        onRequest: [autenticar],
        schema: {
            params: z.object({ id: z.uuid() }),
            response: { 200: checklistFechamentoRespostaSchema, "4xx": erroSchema },
        },
        handler: ncController.checklistFechamentoNC,
    });

    app.withTypeProvider<ZodTypeProvider>().route({
        method: "POST",
        url: "/nc/:id/decidir",
        onRequest: [autenticar],
        schema: {
            params: z.object({ id: z.uuid() }),
            body: decisaoSchema,
            response: { 200: ncRespostaSchema, "4xx": erroSchema },
        },
        handler: ncController.decidirNC,
    });

    app.withTypeProvider<ZodTypeProvider>().route({
        method: "POST",
        url: "/nc/:id/reabrir",
        onRequest: [autenticar],
        schema: {
            params: z.object({ id: z.uuid() }),
            body: motivoSchema,
            response: { 200: ncRespostaSchema, "4xx": erroSchema },
        },
        handler: ncController.reabrirNC,
    });

    app.withTypeProvider<ZodTypeProvider>().route({
        method: "POST",
        url: "/nc/:id/cancelar",
        onRequest: [autenticar],
        schema: {
            params: z.object({ id: z.uuid() }),
            body: motivoSchema,
            response: { 200: ncRespostaSchema, "4xx": erroSchema },
        },
        handler: ncController.cancelarNC,
    });

    app.withTypeProvider<ZodTypeProvider>().route({
        method: "GET",
        url: "/nc/:id",
        onRequest: [autenticar],
        schema: {
            params: z.object({ id: z.uuid() }),
            response: { 200: ncRespostaSchema, "4xx": erroSchema },
        },
        handler: ncController.buscarPorIdNC,
    });

    app.withTypeProvider<ZodTypeProvider>().route({
        method: "GET",
        url: "/nc",
        onRequest: [autenticar],
        schema: {
            querystring: ncFiltrosListagemSchema,
            response: { 200: paginaSchema(ncRespostaSchema), "4xx": erroSchema },
        },
        handler: ncController.listarNC,
    });
}
