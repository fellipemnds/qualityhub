import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";
import { erroSchema } from "../../../compartilhado/errors/erro.schema.js";
import { decisaoSchema } from "../../../compartilhado/registro/decidir.schema.js";
import { motivoSchema } from "../../../compartilhado/registro/motivo.schema.js";
import { paginaSchema } from "../../../compartilhado/registro/paginacao-cursor.js";
import { autenticar } from "../../../middlewares/autenticar.js";
import { contencaoController } from "./contencao.controller.js";
import {
    contencaoDetalheRespostaSchema,
    contencaoFiltrosListagemSchema,
    contencaoRascunhoSchema,
    contencaoRespostaSchema,
} from "./contencao.schema.js";

export async function contencaoRoutes(app: FastifyInstance) {
    app.withTypeProvider<ZodTypeProvider>().route({
        method: "POST",
        url: "/nc/:naoConformidadeId/contencoes",
        onRequest: [autenticar],
        schema: {
            params: z.object({ naoConformidadeId: z.uuid() }),
            body: contencaoRascunhoSchema,
            response: { 201: contencaoRespostaSchema, "4xx": erroSchema },
        },
        handler: contencaoController.criarRascunhoContencao,
    });

    app.withTypeProvider<ZodTypeProvider>().route({
        method: "PATCH",
        url: "/contencoes/:id",
        onRequest: [autenticar],
        schema: {
            params: z.object({ id: z.uuid() }),
            body: contencaoRascunhoSchema,
            response: { 200: contencaoRespostaSchema, "4xx": erroSchema },
        },
        handler: contencaoController.atualizarContencao,
    });

    app.withTypeProvider<ZodTypeProvider>().route({
        method: "DELETE",
        url: "/contencoes/:id",
        onRequest: [autenticar],
        schema: {
            params: z.object({ id: z.uuid() }),
            response: { 204: z.null(), "4xx": erroSchema },
        },
        handler: contencaoController.excluirRascunhoContencao,
    });

    app.withTypeProvider<ZodTypeProvider>().route({
        method: "POST",
        url: "/contencoes/:id/publicar",
        onRequest: [autenticar],
        schema: {
            params: z.object({ id: z.uuid() }),
            response: { 200: contencaoRespostaSchema, "4xx": erroSchema },
        },
        handler: contencaoController.publicarContencao,
    });

    app.withTypeProvider<ZodTypeProvider>().route({
        method: "POST",
        url: "/contencoes/:id/submeter",
        onRequest: [autenticar],
        schema: {
            params: z.object({ id: z.uuid() }),
            response: { 200: contencaoRespostaSchema, "4xx": erroSchema },
        },
        handler: contencaoController.submeterContencao,
    });

    app.withTypeProvider<ZodTypeProvider>().route({
        method: "POST",
        url: "/contencoes/:id/retirar",
        onRequest: [autenticar],
        schema: {
            params: z.object({ id: z.uuid() }),
            response: { 200: contencaoRespostaSchema, "4xx": erroSchema },
        },
        handler: contencaoController.retirarContencao,
    });

    app.withTypeProvider<ZodTypeProvider>().route({
        method: "POST",
        url: "/contencoes/:id/decidir",
        onRequest: [autenticar],
        schema: {
            params: z.object({ id: z.uuid() }),
            body: decisaoSchema,
            response: { 200: contencaoRespostaSchema, "4xx": erroSchema },
        },
        handler: contencaoController.decidirContencao,
    });

    app.withTypeProvider<ZodTypeProvider>().route({
        method: "POST",
        url: "/contencoes/:id/cancelar",
        onRequest: [autenticar],
        schema: {
            params: z.object({ id: z.uuid() }),
            body: motivoSchema,
            response: { 200: contencaoRespostaSchema, "4xx": erroSchema },
        },
        handler: contencaoController.cancelarContencao,
    });

    app.withTypeProvider<ZodTypeProvider>().route({
        method: "GET",
        url: "/contencoes/:id",
        onRequest: [autenticar],
        schema: {
            params: z.object({ id: z.uuid() }),
            response: { 200: contencaoDetalheRespostaSchema, "4xx": erroSchema },
        },
        handler: contencaoController.buscarPorIdContencao,
    });

    app.withTypeProvider<ZodTypeProvider>().route({
        method: "GET",
        url: "/contencoes",
        onRequest: [autenticar],
        schema: {
            querystring: contencaoFiltrosListagemSchema,
            response: { 200: paginaSchema(contencaoRespostaSchema), "4xx": erroSchema },
        },
        handler: contencaoController.listarContencoes,
    });
}
