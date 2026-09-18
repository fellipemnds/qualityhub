import { FastifyRequest, FastifyReply } from "fastify";
import { contencaoService } from "./contencao.service.js";
import { ContencaoRascunhoInput } from "./contencao.schema.js";
import { EstadoRegistro } from "../../compartilhado/entidades/estados.js";
import { DecisaoInput } from "../../compartilhado/registro/decidir.schema.js";

export const contencaoController = {
    async criarRascunhoContencao(request: FastifyRequest<{ Params: { naoConformidadeId: string }, Body: ContencaoRascunhoInput }>, reply: FastifyReply) {
        const dados = request.body;
        const ator = request.user;
        const naoConformidadeId = request.params.naoConformidadeId;

        const contencaoRascunho = await contencaoService.criarRascunhoContencao(ator, naoConformidadeId, dados);

        return reply.status(201).send(contencaoRascunho);
    },

    async salvarRascunhoContencao(request: FastifyRequest<{ Params: { id: string }, Body: ContencaoRascunhoInput }>, reply: FastifyReply) {
        const dados = request.body;
        const id = request.params.id;
        const ator = request.user;

        const contencaoSalva = await contencaoService.salvarRascunhoContencao(id, ator, dados);

        return reply.status(200).send(contencaoSalva);
    },

    async excluirRascunhoContencao(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
        const id = request.params.id;
        const ator = request.user;

        await contencaoService.excluirRascunhoContencao(id, ator);

        return reply.status(204).send();
    },

    async publicarContencao(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
        const id = request.params.id;
        const ator = request.user;

        const contencaoPublicada = await contencaoService.publicarContencao(id, ator);

        return reply.status(200).send(contencaoPublicada);
    },

    async submeterContencao(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
        const id = request.params.id;
        const ator = request.user;

        const contencaoSubmetida = await contencaoService.submeterContencao(id, ator);

        return reply.status(200).send(contencaoSubmetida);
    },

    async decidirContencao(request: FastifyRequest<{ Params: { id: string }, Body: DecisaoInput }>, reply: FastifyReply) {
        const id = request.params.id;
        const ator = request.user;
        const dados = request.body;

        const contencaoDecidida = await contencaoService.decidirContencao(id, ator, dados);

        return reply.status(200).send(contencaoDecidida);
    },

    async cancelarContencao(request: FastifyRequest<{ Params: { id: string }, Body: { motivo: string } }>, reply: FastifyReply) {
        const id = request.params.id;
        const ator = request.user;
        const motivo = request.body.motivo;

        const contencaoCancelada = await contencaoService.cancelarContencao(id, ator, motivo);

        return reply.status(200).send(contencaoCancelada);
    },

    async buscarPorIdContencao(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
        const id = request.params.id;
        const ator = request.user;

        const contencaoBuscada = await contencaoService.buscarPorIdContencao(id, ator);

        return reply.status(200).send(contencaoBuscada);
    },

    async listarContencoes(request: FastifyRequest<{ Querystring: { naoConformidadeId?: string, estado?: EstadoRegistro } }>, reply: FastifyReply) {
        const ator = request.user;
        const filtros = request.query;

        const contencoesListadas = await contencaoService.listarContencoes(ator, filtros);

        return reply.status(200).send(contencoesListadas);
    }
}