import type { FastifyRequest, FastifyReply } from "fastify";
import { ncService } from "./nc.service.js";
import { criarNCSchema } from "./nc.schema.js";

export const ncController = {
    async listar(request: FastifyRequest, reply: FastifyReply) {
        return ncService.listar();
    },

    async buscarPorId(request: FastifyRequest, reply: FastifyReply) {
        const { id } = request.params as { id: string }

        return ncService.buscarPorId(Number(id));
    },

    async criar(request: FastifyRequest, reply: FastifyReply) {
        const dados = criarNCSchema.parse(request.body);

        const nc = await ncService.criar(dados);

        return reply.status(201).send(nc);
    }
}