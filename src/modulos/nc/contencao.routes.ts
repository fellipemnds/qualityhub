import type { FastifyInstance } from "fastify";
import { contencaoController } from "./contencao.controller.js";
import { autenticar } from "../../middlewares/autenticar.js";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";
import { contencaoRascunhoSchema } from "./contencao.schema.js";
import { decisaoSchema } from "../../compartilhado/registro/decidir.schema.js";
import { motivoSchema } from "../../compartilhado/registro/motivo.schema.js";
import { EstadoRegistro } from "../../compartilhado/entidades/estados.js";

export async function contencaoRoutes(app: FastifyInstance) {

    app.withTypeProvider<ZodTypeProvider>().route({
        method: "POST",
        url: "/nc/:naoConformidadeId/contencoes",
        onRequest: [autenticar],
        schema: {
            params: z.object({ naoConformidadeId: z.uuid() }),
            body: contencaoRascunhoSchema
        },
        handler: contencaoController.criarRascunhoContencao
    });

    app.withTypeProvider<ZodTypeProvider>().route({
        method: "PATCH",
        url: "/contencoes/:id",
        onRequest: [autenticar],
        schema: {
            params: z.object({ id: z.uuid() }),
            body: contencaoRascunhoSchema
        },
        handler: contencaoController.atualizarContencao
    });

    app.withTypeProvider<ZodTypeProvider>().route({
        method: "DELETE",
        url: "/contencoes/:id",
        onRequest: [autenticar],
        schema: {
            params: z.object({ id: z.uuid() }),
        },
        handler: contencaoController.excluirRascunhoContencao
    });

    app.withTypeProvider<ZodTypeProvider>().route({
        method: "POST",
        url: "/contencoes/:id/publicar",
        onRequest: [autenticar],
        schema: {
            params: z.object({ id: z.uuid() }),
        },
        handler: contencaoController.publicarContencao
    });

    app.withTypeProvider<ZodTypeProvider>().route({
        method: "POST",
        url: "/contencoes/:id/submeter",
        onRequest: [autenticar],
        schema: {
            params: z.object({ id: z.uuid() }),
        },
        handler: contencaoController.submeterContencao
    });

    app.withTypeProvider<ZodTypeProvider>().route({
        method: "POST",
        url: "/contencoes/:id/decidir",
        onRequest: [autenticar],
        schema: {
            params: z.object({ id: z.uuid() }),
            body: decisaoSchema
        },
        handler: contencaoController.decidirContencao
    });

    app.withTypeProvider<ZodTypeProvider>().route({
        method: "POST",
        url: "/contencoes/:id/cancelar",
        onRequest: [autenticar],
        schema: {
            params: z.object({ id: z.uuid() }),
            body: motivoSchema
        },
        handler: contencaoController.cancelarContencao
    });

    app.withTypeProvider<ZodTypeProvider>().route({
        method: "GET",
        url: "/contencoes/:id",
        onRequest: [autenticar],
        schema: {
            params: z.object({ id: z.uuid() }),
        },
        handler: contencaoController.buscarPorIdContencao
    });

    app.withTypeProvider<ZodTypeProvider>().route({
        method: "GET",
        url: "/contencoes",
        onRequest: [autenticar],
        schema: {
            querystring: z.object({
                naoConformidadeId: z.string().min(1).optional(),
                estado: z.enum(EstadoRegistro).optional()
            })
        },
        handler: contencaoController.listarContencoes
    });
}