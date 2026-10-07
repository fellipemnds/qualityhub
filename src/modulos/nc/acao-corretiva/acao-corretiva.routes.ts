import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";
import { EstadoRegistro } from "../../../compartilhado/entidades/estados.js";
import { erroSchema } from "../../../compartilhado/errors/erro.schema.js";
import { decisaoSchema } from "../../../compartilhado/registro/decidir.schema.js";
import { motivoSchema } from "../../../compartilhado/registro/motivo.schema.js";
import { autenticar } from "../../../middlewares/autenticar.js";
import { acaoCorretivaController } from "./acao-corretiva.controller.js";
import {
    acaoCorretivaCriacaoSchema,
    acaoCorretivaDetalheRespostaSchema,
    acaoCorretivaRascunhoSchema,
    acaoCorretivaRespostaSchema,
    finalizarExecucaoRespostaSchema,
    finalizarExecucaoSchema,
} from "./acao-corretiva.schema.js";

export async function acaoCorretivaRoutes(app: FastifyInstance) {
    app.withTypeProvider<ZodTypeProvider>().route({
        method: "POST",
        url: "/nc/:naoConformidadeId/acoes-corretivas",
        onRequest: [autenticar],
        schema: {
            params: z.object({ naoConformidadeId: z.uuid() }),
            body: acaoCorretivaCriacaoSchema,
            response: { 201: acaoCorretivaRespostaSchema, "4xx": erroSchema },
        },
        handler: acaoCorretivaController.criarRascunhoAcaoCorretiva,
    });

    app.withTypeProvider<ZodTypeProvider>().route({
        method: "PATCH",
        url: "/acoes-corretivas/:id",
        onRequest: [autenticar],
        schema: {
            params: z.object({ id: z.uuid() }),
            body: acaoCorretivaRascunhoSchema,
            response: { 200: acaoCorretivaRespostaSchema, "4xx": erroSchema },
        },
        handler: acaoCorretivaController.atualizarAcaoCorretiva,
    });

    app.withTypeProvider<ZodTypeProvider>().route({
        method: "DELETE",
        url: "/acoes-corretivas/:id",
        onRequest: [autenticar],
        schema: { params: z.object({ id: z.uuid() }), response: { 204: z.null(), "4xx": erroSchema } },
        handler: acaoCorretivaController.excluirRascunhoAcaoCorretiva,
    });

    app.withTypeProvider<ZodTypeProvider>().route({
        method: "POST",
        url: "/acoes-corretivas/:id/publicar",
        onRequest: [autenticar],
        schema: {
            params: z.object({ id: z.uuid() }),
            response: { 200: acaoCorretivaRespostaSchema, "4xx": erroSchema },
        },
        handler: acaoCorretivaController.publicarAcaoCorretiva,
    });

    app.withTypeProvider<ZodTypeProvider>().route({
        method: "POST",
        url: "/acoes-corretivas/:id/submeter",
        onRequest: [autenticar],
        schema: {
            params: z.object({ id: z.uuid() }),
            response: { 200: acaoCorretivaRespostaSchema, "4xx": erroSchema },
        },
        handler: acaoCorretivaController.submeterAcaoCorretiva,
    });

    app.withTypeProvider<ZodTypeProvider>().route({
        method: "POST",
        url: "/acoes-corretivas/:id/retirar",
        onRequest: [autenticar],
        schema: {
            params: z.object({ id: z.uuid() }),
            response: { 200: acaoCorretivaRespostaSchema, "4xx": erroSchema },
        },
        handler: acaoCorretivaController.retirarAcaoCorretiva,
    });

    app.withTypeProvider<ZodTypeProvider>().route({
        method: "POST",
        url: "/acoes-corretivas/:id/decidir",
        onRequest: [autenticar],
        schema: {
            params: z.object({ id: z.uuid() }),
            body: decisaoSchema,
            response: { 200: acaoCorretivaRespostaSchema, "4xx": erroSchema },
        },
        handler: acaoCorretivaController.decidirAcaoCorretiva,
    });

    app.withTypeProvider<ZodTypeProvider>().route({
        method: "POST",
        url: "/acoes-corretivas/:id/finalizar-execucao",
        onRequest: [autenticar],
        schema: {
            params: z.object({ id: z.uuid() }),
            body: finalizarExecucaoSchema,
            response: { 200: finalizarExecucaoRespostaSchema, "4xx": erroSchema },
        },
        handler: acaoCorretivaController.finalizarExecucaoAcaoCorretiva,
    });

    app.withTypeProvider<ZodTypeProvider>().route({
        method: "POST",
        url: "/acoes-corretivas/:id/cancelar",
        onRequest: [autenticar],
        schema: {
            params: z.object({ id: z.uuid() }),
            body: motivoSchema,
            response: { 200: acaoCorretivaRespostaSchema, "4xx": erroSchema },
        },
        handler: acaoCorretivaController.cancelarAcaoCorretiva,
    });

    app.withTypeProvider<ZodTypeProvider>().route({
        method: "GET",
        url: "/acoes-corretivas/:id",
        onRequest: [autenticar],
        schema: {
            params: z.object({ id: z.uuid() }),
            response: { 200: acaoCorretivaDetalheRespostaSchema, "4xx": erroSchema },
        },
        handler: acaoCorretivaController.buscarPorIdAcaoCorretiva,
    });

    app.withTypeProvider<ZodTypeProvider>().route({
        method: "GET",
        url: "/acoes-corretivas",
        onRequest: [autenticar],
        schema: {
            querystring: z.object({
                naoConformidadeId: z.string().min(1).optional(),
                estado: z.enum(EstadoRegistro).optional(),
            }),
            response: { 200: z.array(acaoCorretivaRespostaSchema), "4xx": erroSchema },
        },
        handler: acaoCorretivaController.listarAcoesCorretivas,
    });
}
