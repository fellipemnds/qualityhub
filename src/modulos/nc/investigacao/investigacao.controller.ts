import { FastifyReply, FastifyRequest } from "fastify";
import { EstadoRegistro } from "../../../compartilhado/entidades/estados.js";
import { DecisaoInput } from "../../../compartilhado/registro/decidir.schema.js";
import { InvestigacaoRascunhoInput } from "./investigacao.schema.js";
import { investigacaoService } from "./investigacao.service.js";

export const investigacaoController = {
    async criarRascunhoInvestigacao(
        request: FastifyRequest<{ Params: { naoConformidadeId: string }; Body: InvestigacaoRascunhoInput }>,
        reply: FastifyReply,
    ) {
        const dados = request.body;
        const ator = request.user;
        const naoConformidadeId = request.params.naoConformidadeId;

        const investigacaoRascunho = await investigacaoService.criarRascunhoInvestigacao(
            ator,
            naoConformidadeId,
            dados,
        );

        return reply.status(201).send(investigacaoRascunho);
    },

    async atualizarInvestigacao(
        request: FastifyRequest<{ Params: { id: string }; Body: InvestigacaoRascunhoInput }>,
        reply: FastifyReply,
    ) {
        const dados = request.body;
        const ator = request.user;
        const id = request.params.id;

        const investigacaoSalva = await investigacaoService.atualizarInvestigacao(id, ator, dados);

        return reply.status(200).send(investigacaoSalva);
    },

    async excluirRascunhoInvestigacao(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
        const id = request.params.id;
        const ator = request.user;

        await investigacaoService.excluirRascunhoInvestigacao(id, ator);

        return reply.status(204).send();
    },

    async publicarInvestigacao(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
        const id = request.params.id;
        const ator = request.user;

        const investigacaoPublicada = await investigacaoService.publicarInvestigacao(id, ator);

        return reply.status(200).send(investigacaoPublicada);
    },

    async submeterInvestigacao(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
        const id = request.params.id;
        const ator = request.user;

        const investigacaoSubmetida = await investigacaoService.submeterInvestigacao(id, ator);

        return reply.status(200).send(investigacaoSubmetida);
    },

    async decidirInvestigacao(
        request: FastifyRequest<{ Params: { id: string }; Body: DecisaoInput }>,
        reply: FastifyReply,
    ) {
        const id = request.params.id;
        const ator = request.user;
        const dados = request.body;

        const investigacaoDecidida = await investigacaoService.decidirInvestigacao(id, ator, dados);

        return reply.status(200).send(investigacaoDecidida);
    },

    async cancelarInvestigacao(
        request: FastifyRequest<{ Params: { id: string }; Body: { motivo: string } }>,
        reply: FastifyReply,
    ) {
        const id = request.params.id;
        const ator = request.user;
        const dados = request.body.motivo;

        const investigacaoCancelada = await investigacaoService.cancelarInvestigacao(id, ator, dados);

        return reply.status(200).send(investigacaoCancelada);
    },

    async buscarPorIdInvestigacao(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
        const id = request.params.id;
        const ator = request.user;

        const investigacaoBuscada = await investigacaoService.buscarPorIdInvestigacao(id, ator);

        return reply.status(200).send(investigacaoBuscada);
    },

    async listarInvestigacoes(
        request: FastifyRequest<{ Querystring: { naoConformidadeId?: string; estado?: EstadoRegistro } }>,
        reply: FastifyReply,
    ) {
        const ator = request.user;
        const filtros = request.query;

        const investigacoesListadas = await investigacaoService.listarInvestigacoes(ator, filtros);

        return reply.status(200).send(investigacoesListadas);
    },
};
