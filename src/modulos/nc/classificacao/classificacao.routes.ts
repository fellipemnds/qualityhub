import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";
import { EstadoRegistro } from "../../../compartilhado/entidades/estados.js";
import { erroSchema } from "../../../compartilhado/errors/erro.schema.js";
import { decisaoSchema } from "../../../compartilhado/registro/decidir.schema.js";
import { autenticar } from "../../../middlewares/autenticar.js";
import { classificacaoController } from "./classificacao.controller.js";
import {
    classificacaoDetalheRespostaSchema,
    classificacaoRascunhoSchema,
    classificacaoRespostaSchema,
} from "./classificacao.schema.js";

export async function classificacaoRoutes(app: FastifyInstance) {
    app.withTypeProvider<ZodTypeProvider>().route({
        method: "POST",
        url: "/nc/:naoConformidadeId/classificacoes",
        onRequest: [autenticar],
        schema: {
            params: z.object({ naoConformidadeId: z.uuid() }),
            body: classificacaoRascunhoSchema,
            response: { 201: classificacaoRespostaSchema, "4xx": erroSchema },
        },
        handler: classificacaoController.criarRascunhoClassificacao,
    });

    app.withTypeProvider<ZodTypeProvider>().route({
        method: "PATCH",
        url: "/classificacoes/:id",
        onRequest: [autenticar],
        schema: {
            params: z.object({ id: z.uuid() }),
            body: classificacaoRascunhoSchema,
            response: { 200: classificacaoRespostaSchema, "4xx": erroSchema },
        },
        handler: classificacaoController.atualizarClassificacao,
    });

    app.withTypeProvider<ZodTypeProvider>().route({
        method: "DELETE",
        url: "/classificacoes/:id",
        onRequest: [autenticar],
        schema: {
            params: z.object({ id: z.uuid() }),
            response: { 204: z.null(), "4xx": erroSchema },
        },
        handler: classificacaoController.excluirRascunhoClassificacao,
    });

    app.withTypeProvider<ZodTypeProvider>().route({
        method: "POST",
        url: "/classificacoes/:id/publicar",
        onRequest: [autenticar],
        schema: {
            params: z.object({ id: z.uuid() }),
            response: { 200: classificacaoRespostaSchema, "4xx": erroSchema },
        },
        handler: classificacaoController.publicarClassificacao,
    });

    app.withTypeProvider<ZodTypeProvider>().route({
        method: "POST",
        url: "/classificacoes/:id/submeter",
        onRequest: [autenticar],
        schema: {
            params: z.object({ id: z.uuid() }),
            response: { 200: classificacaoRespostaSchema, "4xx": erroSchema },
        },
        handler: classificacaoController.submeterClassificacao,
    });

    app.withTypeProvider<ZodTypeProvider>().route({
        method: "POST",
        url: "/classificacoes/:id/retirar",
        onRequest: [autenticar],
        schema: {
            params: z.object({ id: z.uuid() }),
            response: { 200: classificacaoRespostaSchema, "4xx": erroSchema },
        },
        handler: classificacaoController.retirarClassificacao,
    });

    app.withTypeProvider<ZodTypeProvider>().route({
        method: "POST",
        url: "/classificacoes/:id/decidir",
        onRequest: [autenticar],
        schema: {
            params: z.object({ id: z.uuid() }),
            body: decisaoSchema,
            response: { 200: classificacaoRespostaSchema, "4xx": erroSchema },
        },
        handler: classificacaoController.decidirClassificacao,
    });

    app.withTypeProvider<ZodTypeProvider>().route({
        method: "GET",
        url: "/classificacoes/:id",
        onRequest: [autenticar],
        schema: {
            params: z.object({ id: z.uuid() }),
            response: { 200: classificacaoDetalheRespostaSchema, "4xx": erroSchema },
        },
        handler: classificacaoController.buscarPorIdClassificacao,
    });

    app.withTypeProvider<ZodTypeProvider>().route({
        method: "GET",
        url: "/classificacoes",
        onRequest: [autenticar],
        schema: {
            querystring: z.object({
                naoConformidadeId: z.string().min(1).optional(),
                estado: z.enum(EstadoRegistro).optional(),
            }),
            response: { 200: z.array(classificacaoRespostaSchema), "4xx": erroSchema },
        },
        handler: classificacaoController.listarClassificacoes,
    });
}
