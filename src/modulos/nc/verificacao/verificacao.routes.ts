import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";
import { erroSchema } from "../../../compartilhado/errors/erro.schema.js";
import { motivoSchema } from "../../../compartilhado/registro/motivo.schema.js";
import { paginaSchema } from "../../../compartilhado/registro/paginacao-cursor.js";
import { autenticar } from "../../../middlewares/autenticar.js";
import { verificacaoController } from "./verificacao.controller.js";
import {
    verificacaoFiltrosListagemSchema,
    verificacaoRascunhoSchema,
    verificacaoRespostaSchema,
} from "./verificacao.schema.js";

export async function verificacaoRoutes(app: FastifyInstance) {
    app.withTypeProvider<ZodTypeProvider>().route({
        method: "PATCH",
        url: "/verificacoes/:id",
        onRequest: [autenticar],
        schema: {
            params: z.object({ id: z.uuid() }),
            body: verificacaoRascunhoSchema,
            response: { 200: verificacaoRespostaSchema, "4xx": erroSchema },
        },
        handler: verificacaoController.atualizarVerificacao,
    });

    app.withTypeProvider<ZodTypeProvider>().route({
        method: "POST",
        url: "/verificacoes/:id/concluir",
        onRequest: [autenticar],
        schema: { params: z.object({ id: z.uuid() }), response: { 200: verificacaoRespostaSchema, "4xx": erroSchema } },
        handler: verificacaoController.concluirVerificacao,
    });

    app.withTypeProvider<ZodTypeProvider>().route({
        method: "POST",
        url: "/verificacoes/:id/cancelar",
        onRequest: [autenticar],
        schema: {
            params: z.object({ id: z.uuid() }),
            body: motivoSchema,
            response: { 200: verificacaoRespostaSchema, "4xx": erroSchema },
        },
        handler: verificacaoController.cancelarVerificacao,
    });

    app.withTypeProvider<ZodTypeProvider>().route({
        method: "GET",
        url: "/verificacoes/:id",
        onRequest: [autenticar],
        schema: { params: z.object({ id: z.uuid() }), response: { 200: verificacaoRespostaSchema, "4xx": erroSchema } },
        handler: verificacaoController.buscarPorIdVerificacao,
    });

    app.withTypeProvider<ZodTypeProvider>().route({
        method: "GET",
        url: "/verificacoes",
        onRequest: [autenticar],
        schema: {
            querystring: verificacaoFiltrosListagemSchema,
            response: { 200: paginaSchema(verificacaoRespostaSchema), "4xx": erroSchema },
        },
        handler: verificacaoController.listarVerificacoes,
    });
}
