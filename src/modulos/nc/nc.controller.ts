import type { FastifyRequest, FastifyReply } from "fastify";
import { ncService } from "./nc.service.js";
import { criarNCSchema } from "./nc.schema.js";
import { buscarIdNCSchema } from "./nc.schema.js";
import { classificarNCSchema } from "./nc.schema.js";

export const ncController = {
    async listar(request: FastifyRequest, reply: FastifyReply) {
        return ncService.listar();
    },

    async buscarPorId(request: FastifyRequest, reply: FastifyReply) {
        const params = buscarIdNCSchema.parse(request.params);

        return ncService.buscarPorId(params.id);
    },

    async criar(request: FastifyRequest, reply: FastifyReply) {
        const dados = criarNCSchema.parse(request.body);

        const nc = await ncService.criar(dados);

        return reply.status(201).send(nc);
    },

    async classificar(request: FastifyRequest, reply: FastifyReply) {
        const { id } = buscarIdNCSchema.parse(request.params);
        const { classificacao } = classificarNCSchema.parse(request.body);

        const classificar = await ncService.classificar({
            id,
            classificacao,
            autorId: request.user.id,
            perfilAutor: request.user.perfil
        });

        return reply.status(204).send();
    }
}