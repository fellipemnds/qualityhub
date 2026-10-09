import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { erroSchema } from "../../compartilhado/errors/erro.schema.js";
import { paginaSchema } from "../../compartilhado/registro/paginacao-cursor.js";
import { autenticar } from "../../middlewares/autenticar.js";
import { usuarioController } from "./usuario.controller.js";
import {
    buscarUsuarioIdSchema,
    conviteRespostaSchema,
    criarUsuarioSchema,
    editarUsuarioSchema,
    papelDoUsuarioParamsSchema,
    papelSchema,
    pessoaFiltrosListagemSchema,
    pessoaRespostaSchema,
    usuarioCriadoRespostaSchema,
    usuarioFiltrosListagemSchema,
    usuarioRespostaSchema,
} from "./usuario.schema.js";

export async function usuarioRoutes(app: FastifyInstance) {
    app.withTypeProvider<ZodTypeProvider>().route({
        method: "POST",
        url: "/usuarios",
        onRequest: [autenticar],
        schema: {
            body: criarUsuarioSchema,
            response: { 201: usuarioCriadoRespostaSchema, "4xx": erroSchema },
        },
        handler: usuarioController.criar,
    });

    app.withTypeProvider<ZodTypeProvider>().route({
        method: "GET",
        url: "/usuarios",
        onRequest: [autenticar],
        schema: {
            querystring: usuarioFiltrosListagemSchema,
            response: { 200: paginaSchema(usuarioRespostaSchema), "4xx": erroSchema },
        },
        handler: usuarioController.listar,
    });

    app.withTypeProvider<ZodTypeProvider>().route({
        method: "GET",
        url: "/pessoas",
        onRequest: [autenticar],
        schema: {
            querystring: pessoaFiltrosListagemSchema,
            response: { 200: paginaSchema(pessoaRespostaSchema), "4xx": erroSchema },
        },
        handler: usuarioController.listarPessoas,
    });

    app.withTypeProvider<ZodTypeProvider>().route({
        method: "GET",
        url: "/usuarios/:id",
        onRequest: [autenticar],
        schema: {
            params: buscarUsuarioIdSchema,
            response: { 200: usuarioRespostaSchema, "4xx": erroSchema },
        },
        handler: usuarioController.buscarPorId,
    });

    app.withTypeProvider<ZodTypeProvider>().route({
        method: "PATCH",
        url: "/usuarios/:id",
        onRequest: [autenticar],
        schema: {
            params: buscarUsuarioIdSchema,
            body: editarUsuarioSchema,
            response: { 200: usuarioRespostaSchema, "4xx": erroSchema },
        },
        handler: usuarioController.editar,
    });

    app.withTypeProvider<ZodTypeProvider>().route({
        method: "POST",
        url: "/usuarios/:id/convite",
        onRequest: [autenticar],
        schema: {
            params: buscarUsuarioIdSchema,
            response: { 200: conviteRespostaSchema, "4xx": erroSchema },
        },
        handler: usuarioController.gerarConvite,
    });

    app.withTypeProvider<ZodTypeProvider>().route({
        method: "POST",
        url: "/usuarios/:id/inativar",
        onRequest: [autenticar],
        schema: {
            params: buscarUsuarioIdSchema,
            response: { 200: usuarioRespostaSchema, "4xx": erroSchema },
        },
        handler: usuarioController.inativar,
    });

    app.withTypeProvider<ZodTypeProvider>().route({
        method: "POST",
        url: "/usuarios/:id/reativar",
        onRequest: [autenticar],
        schema: {
            params: buscarUsuarioIdSchema,
            response: { 200: usuarioRespostaSchema, "4xx": erroSchema },
        },
        handler: usuarioController.reativar,
    });

    app.withTypeProvider<ZodTypeProvider>().route({
        method: "POST",
        url: "/usuarios/:id/papeis",
        onRequest: [autenticar],
        schema: {
            params: buscarUsuarioIdSchema,
            body: papelSchema,
            response: { 200: usuarioRespostaSchema, "4xx": erroSchema },
        },
        handler: usuarioController.concederPapel,
    });

    app.withTypeProvider<ZodTypeProvider>().route({
        method: "DELETE",
        url: "/usuarios/:id/papeis/:papel",
        onRequest: [autenticar],
        schema: {
            params: papelDoUsuarioParamsSchema,
            response: { 200: usuarioRespostaSchema, "4xx": erroSchema },
        },
        handler: usuarioController.revogarPapel,
    });
}
