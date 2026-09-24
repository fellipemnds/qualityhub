import type { FastifyReply, FastifyRequest } from "fastify";
import type { DecisaoInput } from "../../../compartilhado/registro/decidir.schema.js";
import type { MotivoInput } from "../../../compartilhado/registro/motivo.schema.js";
import type { NCFiltrosListagemInput, NCRascunhoInput } from "./nc.schema.js";
import { ncService } from "./nc.service.js";

export const ncController = {
    async criarRascunhoNC(request: FastifyRequest<{ Body: NCRascunhoInput }>, reply: FastifyReply) {
        const dados = request.body;
        const ator = request.user;

        const ncRascunho = await ncService.criarRascunhoNC(ator, dados);

        return reply.status(201).send(ncRascunho);
    },

    async atualizarNC(request: FastifyRequest<{ Params: { id: string }; Body: NCRascunhoInput }>, reply: FastifyReply) {
        const dados = request.body;
        const id = request.params.id;
        const ator = request.user;

        const ncSalva = await ncService.atualizarNC(id, ator, dados);

        return reply.status(200).send(ncSalva);
    },

    async excluirRascunhoNC(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
        const id = request.params.id;
        const ator = request.user;

        await ncService.excluirRascunhoNC(id, ator);

        return reply.status(204).send();
    },

    async publicarNC(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
        const id = request.params.id;
        const ator = request.user;

        const ncPublicada = await ncService.publicarNC(id, ator);

        return reply.status(200).send(ncPublicada);
    },

    async submeterNC(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
        const id = request.params.id;
        const ator = request.user;

        const ncSubmetida = await ncService.submeterNC(id, ator);

        return reply.status(200).send(ncSubmetida);
    },

    async decidirNC(request: FastifyRequest<{ Params: { id: string }; Body: DecisaoInput }>, reply: FastifyReply) {
        const id = request.params.id;
        const ator = request.user;
        const dados = request.body;

        const ncDecidida = await ncService.decidirNC(id, ator, dados);

        return reply.status(200).send(ncDecidida);
    },

    async reabrirNC(request: FastifyRequest<{ Params: { id: string }; Body: MotivoInput }>, reply: FastifyReply) {
        const id = request.params.id;
        const ator = request.user;
        const motivo = request.body.motivo;

        const ncReaberta = await ncService.reabrirNC(id, ator, motivo);

        return reply.status(200).send(ncReaberta);
    },

    async cancelarNC(request: FastifyRequest<{ Params: { id: string }; Body: MotivoInput }>, reply: FastifyReply) {
        const id = request.params.id;
        const ator = request.user;
        const motivo = request.body.motivo;

        const ncCancelada = await ncService.cancelarNC(id, ator, motivo);

        return reply.status(200).send(ncCancelada);
    },

    async buscarPorIdNC(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
        const id = request.params.id;
        const ator = request.user;

        const ncBuscada = await ncService.buscarPorIdNC(id, ator);

        return reply.status(200).send(ncBuscada);
    },

    async listarNC(request: FastifyRequest<{ Querystring: NCFiltrosListagemInput }>, reply: FastifyReply) {
        const ator = request.user;
        const filtros = request.query;

        const ncListada = await ncService.listarNC(ator, filtros);

        return reply.status(200).send(ncListada);
    },
};
