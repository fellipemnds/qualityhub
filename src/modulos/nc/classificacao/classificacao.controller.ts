import { FastifyRequest, FastifyReply } from "fastify";
import { classificacaoService } from "./classificacao.service.js";
import { ClassificacaoRascunhoInput } from "./classificacao.schema.js";
import { DecisaoInput } from "../../../compartilhado/registro/decidir.schema.js";
import { EstadoRegistro } from "../../../compartilhado/entidades/estados.js";

export const classificacaoController = {
    async criarRascunhoClassificacao(request: FastifyRequest<{ Params: { naoConformidadeId: string }, Body: ClassificacaoRascunhoInput }>, reply: FastifyReply) {
        const dados = request.body;
        const ator = request.user;
        const naoConformidadeId = request.params.naoConformidadeId;

        const classificacaoRascunho = await classificacaoService.criarRascunhoClassificacao(ator, naoConformidadeId, dados);

        return reply.status(201).send(classificacaoRascunho);
    },

    async atualizarClassificacao(request: FastifyRequest<{ Params: { id: string }, Body: ClassificacaoRascunhoInput }>, reply: FastifyReply) {
        const dados = request.body;
        const id = request.params.id;
        const ator = request.user;

        const classificacaoSalva = await classificacaoService.atualizarClassificacao(id, ator, dados);

        return reply.status(200).send(classificacaoSalva);
    },

    async excluirRascunhoClassificacao(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
        const id = request.params.id;
        const ator = request.user;

        await classificacaoService.excluirRascunhoClassificacao(id, ator);

        return reply.status(204).send();
    },

    async publicarClassificacao(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
        const id = request.params.id;
        const ator = request.user;

        const classificacaoPublicada = await classificacaoService.publicarClassificacao(id, ator);

        return reply.status(200).send(classificacaoPublicada);
    },

    async submeterClassificacao(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
        const id = request.params.id;
        const ator = request.user;

        const classificacaoSubmetida = await classificacaoService.submeterClassificacao(id, ator);

        return reply.status(200).send(classificacaoSubmetida);
    },

    async decidirClassificacao(request: FastifyRequest<{ Params: { id: string }, Body: DecisaoInput }>, reply: FastifyReply) {
        const id = request.params.id;
        const ator = request.user;
        const dados = request.body;

        const classificacaoDecidida = await classificacaoService.decidirClassificacao(id, ator, dados);

        return reply.status(200).send(classificacaoDecidida);
    },

    async buscarPorIdClassificacao(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
        const id = request.params.id;
        const ator = request.user;

        const classificacaoBuscada = await classificacaoService.buscarPorIdClassificacao(id, ator);

        return reply.status(200).send(classificacaoBuscada);
    },

    async listarClassificacoes(request: FastifyRequest<{ Querystring: { naoConformidadeId?: string, estado?: EstadoRegistro } }>, reply: FastifyReply) {
        const ator = request.user;
        const filtros = request.query;

        const classificacoesListadas = await classificacaoService.listarClassificacoes(ator, filtros);

        return reply.status(200).send(classificacoesListadas);
    }
}