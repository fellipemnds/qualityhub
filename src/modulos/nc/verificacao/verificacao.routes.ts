import type { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";
import { EstadoRegistro } from "../../../compartilhado/entidades/estados.js";
import { motivoSchema } from "../../../compartilhado/registro/motivo.schema.js";
import { autenticar } from "../../../middlewares/autenticar.js";
import { verificacaoController } from "./verificacao.controller.js";
import { verificacaoRascunhoSchema } from "./verificacao.schema.js";

export async function verificacaoRoutes(app: FastifyInstance) {
    app.withTypeProvider<ZodTypeProvider>().route({
        method: "PATCH",
        url: "/verificacoes/:id",
        onRequest: [autenticar],
        schema: { params: z.object({ id: z.uuid() }), body: verificacaoRascunhoSchema },
        handler: verificacaoController.atualizarVerificacao,
    });

    app.withTypeProvider<ZodTypeProvider>().route({
        method: "POST",
        url: "/verificacoes/:id/concluir",
        onRequest: [autenticar],
        schema: { params: z.object({ id: z.uuid() }) },
        handler: verificacaoController.concluirVerificacao,
    });

    app.withTypeProvider<ZodTypeProvider>().route({
        method: "DELETE",
        url: "/verificacoes/:id",
        onRequest: [autenticar],
        schema: { params: z.object({ id: z.uuid() }) },
        handler: verificacaoController.excluirRascunhoVerificacao,
    });

    app.withTypeProvider<ZodTypeProvider>().route({
        method: "POST",
        url: "/verificacoes/:id/cancelar",
        onRequest: [autenticar],
        schema: { params: z.object({ id: z.uuid() }), body: motivoSchema },
        handler: verificacaoController.cancelarVerificacao,
    });

    app.withTypeProvider<ZodTypeProvider>().route({
        method: "GET",
        url: "/verificacoes/:id",
        onRequest: [autenticar],
        schema: { params: z.object({ id: z.uuid() }) },
        handler: verificacaoController.buscarPorIdVerificacao,
    });

    app.withTypeProvider<ZodTypeProvider>().route({
        method: "GET",
        url: "/verificacoes",
        onRequest: [autenticar],
        schema: {
            querystring: z.object({
                acaoCorretivaId: z.string().min(1).optional(),
                estado: z.enum(EstadoRegistro).optional(),
            }),
        },
        handler: verificacaoController.listarVerificacoes,
    });
}
