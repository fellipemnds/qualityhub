import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";
import { EstadoRegistro } from "../../../compartilhado/entidades/estados.js";
import { erroSchema } from "../../../compartilhado/errors/erro.schema.js";
import { decisaoSchema } from "../../../compartilhado/registro/decidir.schema.js";
import { motivoSchema } from "../../../compartilhado/registro/motivo.schema.js";
import { autenticar } from "../../../middlewares/autenticar.js";
import { investigacaoController } from "./investigacao.controller.js";
import {
    investigacaoDetalheRespostaSchema,
    investigacaoRascunhoSchema,
    investigacaoRespostaSchema,
} from "./investigacao.schema.js";

export async function investigacaoRoutes(app: FastifyInstance) {
    app.withTypeProvider<ZodTypeProvider>().route({
        method: "POST",
        url: "/nc/:naoConformidadeId/investigacoes",
        onRequest: [autenticar],
        schema: {
            params: z.object({ naoConformidadeId: z.uuid() }),
            body: investigacaoRascunhoSchema,
            response: { 201: investigacaoRespostaSchema, "4xx": erroSchema },
        },
        handler: investigacaoController.criarRascunhoInvestigacao,
    });

    app.withTypeProvider<ZodTypeProvider>().route({
        method: "PATCH",
        url: "/investigacoes/:id",
        onRequest: [autenticar],
        schema: {
            params: z.object({ id: z.uuid() }),
            body: investigacaoRascunhoSchema,
            response: { 200: investigacaoRespostaSchema, "4xx": erroSchema },
        },
        handler: investigacaoController.atualizarInvestigacao,
    });

    app.withTypeProvider<ZodTypeProvider>().route({
        method: "DELETE",
        url: "/investigacoes/:id",
        onRequest: [autenticar],
        schema: {
            params: z.object({ id: z.uuid() }),
            response: { 204: z.null(), "4xx": erroSchema },
        },
        handler: investigacaoController.excluirRascunhoInvestigacao,
    });

    app.withTypeProvider<ZodTypeProvider>().route({
        method: "POST",
        url: "/investigacoes/:id/publicar",
        onRequest: [autenticar],
        schema: {
            params: z.object({ id: z.uuid() }),
            response: { 200: investigacaoRespostaSchema, "4xx": erroSchema },
        },
        handler: investigacaoController.publicarInvestigacao,
    });

    app.withTypeProvider<ZodTypeProvider>().route({
        method: "POST",
        url: "/investigacoes/:id/submeter",
        onRequest: [autenticar],
        schema: {
            params: z.object({ id: z.uuid() }),
            response: { 200: investigacaoRespostaSchema, "4xx": erroSchema },
        },
        handler: investigacaoController.submeterInvestigacao,
    });

    app.withTypeProvider<ZodTypeProvider>().route({
        method: "POST",
        url: "/investigacoes/:id/retirar",
        onRequest: [autenticar],
        schema: {
            params: z.object({ id: z.uuid() }),
            response: { 200: investigacaoRespostaSchema, "4xx": erroSchema },
        },
        handler: investigacaoController.retirarInvestigacao,
    });

    app.withTypeProvider<ZodTypeProvider>().route({
        method: "POST",
        url: "/investigacoes/:id/decidir",
        onRequest: [autenticar],
        schema: {
            params: z.object({ id: z.uuid() }),
            body: decisaoSchema,
            response: { 200: investigacaoRespostaSchema, "4xx": erroSchema },
        },
        handler: investigacaoController.decidirInvestigacao,
    });

    app.withTypeProvider<ZodTypeProvider>().route({
        method: "POST",
        url: "/investigacoes/:id/cancelar",
        onRequest: [autenticar],
        schema: {
            params: z.object({ id: z.uuid() }),
            body: motivoSchema,
            response: { 200: investigacaoRespostaSchema, "4xx": erroSchema },
        },
        handler: investigacaoController.cancelarInvestigacao,
    });

    app.withTypeProvider<ZodTypeProvider>().route({
        method: "GET",
        url: "/investigacoes/:id",
        onRequest: [autenticar],
        schema: {
            params: z.object({ id: z.uuid() }),
            response: { 200: investigacaoDetalheRespostaSchema, "4xx": erroSchema },
        },
        handler: investigacaoController.buscarPorIdInvestigacao,
    });

    app.withTypeProvider<ZodTypeProvider>().route({
        method: "GET",
        url: "/investigacoes",
        onRequest: [autenticar],
        schema: {
            querystring: z.object({
                naoConformidadeId: z.string().min(1).optional(),
                estado: z.enum(EstadoRegistro).optional(),
            }),
            response: { 200: z.array(investigacaoRespostaSchema), "4xx": erroSchema },
        },
        handler: investigacaoController.listarInvestigacoes,
    });
}
