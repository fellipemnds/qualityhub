import type { FastifyReply, FastifyRequest } from "fastify";
import type { CriarSetorInput, EditarSetorInput, SetorFiltrosListagemInput } from "./setor.schema.js";
import { setorService } from "./setor.service.js";

export const setorController = {
    async listar(request: FastifyRequest<{ Querystring: SetorFiltrosListagemInput }>, reply: FastifyReply) {
        const setores = await setorService.listarSetores(request.user, request.query);

        return reply.status(200).send(setores);
    },

    async criar(request: FastifyRequest<{ Body: CriarSetorInput }>, reply: FastifyReply) {
        const setor = await setorService.criarSetor(request.user, request.body);

        return reply.status(201).send(setor);
    },

    async desativar(request: FastifyRequest<{ Params: { id: number } }>, reply: FastifyReply) {
        const setor = await setorService.desativarSetor(request.user, request.params.id);

        return reply.status(200).send(setor);
    },

    async reativar(request: FastifyRequest<{ Params: { id: number } }>, reply: FastifyReply) {
        const setor = await setorService.reativarSetor(request.user, request.params.id);

        return reply.status(200).send(setor);
    },

    async renomear(request: FastifyRequest<{ Params: { id: number }; Body: EditarSetorInput }>, reply: FastifyReply) {
        const setor = await setorService.renomearSetor(request.user, request.params.id, request.body);

        return reply.status(200).send(setor);
    },
};
