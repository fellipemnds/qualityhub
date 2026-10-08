import type { FastifyReply, FastifyRequest } from "fastify";
import type { VerificacaoFiltrosListagemInput, VerificacaoRascunhoInput } from "./verificacao.schema.js";
import { verificacaoService } from "./verificacao.service.js";

export const verificacaoController = {
    async atualizarVerificacao(
        request: FastifyRequest<{ Params: { id: string }; Body: VerificacaoRascunhoInput }>,
        reply: FastifyReply,
    ) {
        const verificacao = await verificacaoService.atualizarVerificacao(
            request.params.id,
            request.user,
            request.body,
        );
        return reply.status(200).send(verificacao);
    },

    async concluirVerificacao(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
        const verificacao = await verificacaoService.concluirVerificacao(request.params.id, request.user);
        return reply.status(200).send(verificacao);
    },

    async cancelarVerificacao(
        request: FastifyRequest<{ Params: { id: string }; Body: { motivo: string } }>,
        reply: FastifyReply,
    ) {
        const verificacao = await verificacaoService.cancelarVerificacao(
            request.params.id,
            request.user,
            request.body.motivo,
        );
        return reply.status(200).send(verificacao);
    },

    async buscarPorIdVerificacao(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
        const verificacao = await verificacaoService.buscarPorIdVerificacao(request.params.id, request.user);
        return reply.status(200).send(verificacao);
    },

    async listarVerificacoes(
        request: FastifyRequest<{ Querystring: VerificacaoFiltrosListagemInput }>,
        reply: FastifyReply,
    ) {
        const verificacoes = await verificacaoService.listarVerificacoes(request.user, request.query);
        return reply.status(200).send(verificacoes);
    },
};
