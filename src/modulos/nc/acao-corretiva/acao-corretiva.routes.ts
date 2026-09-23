import type { FastifyInstance } from "fastify";
import { acaoCorretivaController } from "./acao-corretiva.controller.js";
import { autenticar } from "../../middlewares/autenticar.js";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";
import { acaoCorretivaRascunhoSchema, finalizarExecucaoSchema } from "./acao-corretiva.schema.js";
import { decisaoSchema } from "../../compartilhado/registro/decidir.schema.js";
import { motivoSchema } from "../../compartilhado/registro/motivo.schema.js";
import { EstadoRegistro } from "../../compartilhado/entidades/estados.js";

export async function acaoCorretivaRoutes(app: FastifyInstance) {
    app.withTypeProvider<ZodTypeProvider>().route({
        method: "POST",
        url: "/nc/:naoConformidadeId/acoes-corretivas",
        onRequest: [autenticar],
        schema: { params: z.object({ naoConformidadeId: z.uuid() }), body: acaoCorretivaRascunhoSchema },
        handler: acaoCorretivaController.criarRascunhoAcaoCorretiva
    });

    app.withTypeProvider<ZodTypeProvider>().route({
        method: "PATCH",
        url: "/acoes-corretivas/:id",
        onRequest: [autenticar],
        schema: { params: z.object({ id: z.uuid() }), body: acaoCorretivaRascunhoSchema },
        handler: acaoCorretivaController.atualizarAcaoCorretiva
    });

    app.withTypeProvider<ZodTypeProvider>().route({
        method: "DELETE",
        url: "/acoes-corretivas/:id",
        onRequest: [autenticar],
        schema: { params: z.object({ id: z.uuid() }) },
        handler: acaoCorretivaController.excluirRascunhoAcaoCorretiva
    });

    app.withTypeProvider<ZodTypeProvider>().route({
        method: "POST",
        url: "/acoes-corretivas/:id/publicar",
        onRequest: [autenticar],
        schema: { params: z.object({ id: z.uuid() }) },
        handler: acaoCorretivaController.publicarAcaoCorretiva
    });

    app.withTypeProvider<ZodTypeProvider>().route({
        method: "POST",
        url: "/acoes-corretivas/:id/submeter",
        onRequest: [autenticar],
        schema: { params: z.object({ id: z.uuid() }) },
        handler: acaoCorretivaController.submeterAcaoCorretiva
    });

    app.withTypeProvider<ZodTypeProvider>().route({
        method: "POST",
        url: "/acoes-corretivas/:id/decidir",
        onRequest: [autenticar],
        schema: { params: z.object({ id: z.uuid() }), body: decisaoSchema },
        handler: acaoCorretivaController.decidirAcaoCorretiva
    });

    app.withTypeProvider<ZodTypeProvider>().route({
        method: "POST",
        url: "/acoes-corretivas/:id/finalizar-execucao",
        onRequest: [autenticar],
        schema: { params: z.object({ id: z.uuid() }), body: finalizarExecucaoSchema },
        handler: acaoCorretivaController.finalizarExecucaoAcaoCorretiva
    });

    app.withTypeProvider<ZodTypeProvider>().route({
        method: "POST",
        url: "/acoes-corretivas/:id/cancelar",
        onRequest: [autenticar],
        schema: { params: z.object({ id: z.uuid() }), body: motivoSchema },
        handler: acaoCorretivaController.cancelarAcaoCorretiva
    });

    app.withTypeProvider<ZodTypeProvider>().route({
        method: "GET",
        url: "/acoes-corretivas/:id",
        onRequest: [autenticar],
        schema: { params: z.object({ id: z.uuid() }) },
        handler: acaoCorretivaController.buscarPorIdAcaoCorretiva
    });

    app.withTypeProvider<ZodTypeProvider>().route({
        method: "GET",
        url: "/acoes-corretivas",
        onRequest: [autenticar],
        schema: { querystring: z.object({ naoConformidadeId: z.string().min(1).optional(), estado: z.enum(EstadoRegistro).optional() }) },
        handler: acaoCorretivaController.listarAcoesCorretivas
    });
}