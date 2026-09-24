import { FastifyReply, FastifyRequest } from "fastify";
import { atribuicaoService } from "./atribuicao.service.js";

export const atribuicaoController = {
    async definirAprovador(
        request: FastifyRequest<{ Params: { id: string }; Body: { usuarioId: string } }>,
        reply: FastifyReply,
    ) {
        const registroId = request.params.id;
        const aprovadorId = request.body.usuarioId;
        const ator = request.user;

        const aprovador = await atribuicaoService.definirAprovador(registroId, aprovadorId, ator);

        return reply.status(200).send(aprovador);
    },

    async adicionarColaboradores(
        request: FastifyRequest<{ Params: { id: string }; Body: { colaboradores: string[] } }>,
        reply: FastifyReply,
    ) {
        const registroId = request.params.id;
        const colaboradoresId = request.body.colaboradores;
        const ator = request.user;

        const colaboradoresAdicionados = await atribuicaoService.adicionarColaboradores(
            registroId,
            colaboradoresId,
            ator,
        );

        return reply.status(200).send(colaboradoresAdicionados);
    },

    async removerColaboradores(
        request: FastifyRequest<{ Params: { id: string }; Body: { colaboradores: string[] } }>,
        reply: FastifyReply,
    ) {
        const registroId = request.params.id;
        const colaboradoresId = request.body.colaboradores;
        const ator = request.user;

        const colaboradoresRemovidos = await atribuicaoService.removerColaboradores(registroId, colaboradoresId, ator);

        return reply.status(200).send(colaboradoresRemovidos);
    },
};
