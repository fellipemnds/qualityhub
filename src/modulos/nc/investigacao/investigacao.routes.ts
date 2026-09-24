import type { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";
import { EstadoRegistro } from "../../../compartilhado/entidades/estados.js";
import { decisaoSchema } from "../../../compartilhado/registro/decidir.schema.js";
import { motivoSchema } from "../../../compartilhado/registro/motivo.schema.js";
import { autenticar } from "../../../middlewares/autenticar.js";
import { investigacaoController } from "./investigacao.controller.js";
import { investigacaoRascunhoSchema } from "./investigacao.schema.js";

export async function investigacaoRoutes(app: FastifyInstance) {
    app.withTypeProvider<ZodTypeProvider>().route({
        method: "POST",
        url: "/nc/:naoConformidadeId/investigacoes",
        onRequest: [autenticar],
        schema: {
            params: z.object({ naoConformidadeId: z.uuid() }),
            body: investigacaoRascunhoSchema,
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
        },
        handler: investigacaoController.atualizarInvestigacao,
    });

    app.withTypeProvider<ZodTypeProvider>().route({
        method: "DELETE",
        url: "/investigacoes/:id",
        onRequest: [autenticar],
        schema: {
            params: z.object({ id: z.uuid() }),
        },
        handler: investigacaoController.excluirRascunhoInvestigacao,
    });

    app.withTypeProvider<ZodTypeProvider>().route({
        method: "POST",
        url: "/investigacoes/:id/publicar",
        onRequest: [autenticar],
        schema: {
            params: z.object({ id: z.uuid() }),
        },
        handler: investigacaoController.publicarInvestigacao,
    });

    app.withTypeProvider<ZodTypeProvider>().route({
        method: "POST",
        url: "/investigacoes/:id/submeter",
        onRequest: [autenticar],
        schema: {
            params: z.object({ id: z.uuid() }),
        },
        handler: investigacaoController.submeterInvestigacao,
    });

    app.withTypeProvider<ZodTypeProvider>().route({
        method: "POST",
        url: "/investigacoes/:id/decidir",
        onRequest: [autenticar],
        schema: {
            params: z.object({ id: z.uuid() }),
            body: decisaoSchema,
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
        },
        handler: investigacaoController.cancelarInvestigacao,
    });

    app.withTypeProvider<ZodTypeProvider>().route({
        method: "GET",
        url: "/investigacoes/:id",
        onRequest: [autenticar],
        schema: {
            params: z.object({ id: z.uuid() }),
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
        },
        handler: investigacaoController.listarInvestigacoes,
    });
}
