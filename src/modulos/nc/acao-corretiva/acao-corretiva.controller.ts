import { FastifyRequest, FastifyReply } from "fastify";
import { acaoCorretivaService } from "./acao-corretiva.service.js";
import { AcaoCorretivaRascunhoInput, FinalizarExecucaoInput } from "./acao-corretiva.schema.js";
import { DecisaoInput } from "../../../compartilhado/registro/decidir.schema.js";
import { EstadoRegistro } from "../../../compartilhado/entidades/estados.js";

export const acaoCorretivaController = {
    async criarRascunhoAcaoCorretiva(request: FastifyRequest<{ Params: { naoConformidadeId: string }, Body: AcaoCorretivaRascunhoInput & { investigacaoId?: string } }>, reply: FastifyReply) {
        const acaoCorretiva = await acaoCorretivaService.criarRascunhoAcaoCorretiva(request.user, request.params.naoConformidadeId, request.body);
        return reply.status(201).send(acaoCorretiva);
    },

    async atualizarAcaoCorretiva(request: FastifyRequest<{ Params: { id: string }, Body: AcaoCorretivaRascunhoInput }>, reply: FastifyReply) {
        const acaoCorretiva = await acaoCorretivaService.atualizarAcaoCorretiva(request.params.id, request.user, request.body);
        return reply.status(200).send(acaoCorretiva);
    },

    async excluirRascunhoAcaoCorretiva(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
        await acaoCorretivaService.excluirRascunhoAcaoCorretiva(request.params.id, request.user);
        return reply.status(204).send();
    },

    async publicarAcaoCorretiva(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
        const acaoCorretiva = await acaoCorretivaService.publicarAcaoCorretiva(request.params.id, request.user);
        return reply.status(200).send(acaoCorretiva);
    },

    async submeterAcaoCorretiva(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
        const acaoCorretiva = await acaoCorretivaService.submeterAcaoCorretiva(request.params.id, request.user);
        return reply.status(200).send(acaoCorretiva);
    },

    async decidirAcaoCorretiva(request: FastifyRequest<{ Params: { id: string }, Body: DecisaoInput }>, reply: FastifyReply) {
        const acaoCorretiva = await acaoCorretivaService.decidirAcaoCorretiva(request.params.id, request.user, request.body);
        return reply.status(200).send(acaoCorretiva);
    },

    async finalizarExecucaoAcaoCorretiva(request: FastifyRequest<{ Params: { id: string }, Body: FinalizarExecucaoInput }>, reply: FastifyReply) {
        const acaoCorretiva = await acaoCorretivaService.finalizarExecucaoAcaoCorretiva(request.params.id, request.user, request.body.diasParaVerificar);
        return reply.status(200).send(acaoCorretiva);
    },

    async cancelarAcaoCorretiva(request: FastifyRequest<{ Params: { id: string }, Body: { motivo: string } }>, reply: FastifyReply) {
        const acaoCorretiva = await acaoCorretivaService.cancelarAcaoCorretiva(request.params.id, request.user, request.body.motivo);
        return reply.status(200).send(acaoCorretiva);
    },

    async buscarPorIdAcaoCorretiva(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
        const acaoCorretiva = await acaoCorretivaService.buscarPorIdAcaoCorretiva(request.params.id, request.user);
        return reply.status(200).send(acaoCorretiva);
    },

    async listarAcoesCorretivas(request: FastifyRequest<{ Querystring: { naoConformidadeId?: string, estado?: EstadoRegistro } }>, reply: FastifyReply) {
        const acoesCorretivas = await acaoCorretivaService.listarAcoesCorretivas(request.user, request.query);
        return reply.status(200).send(acoesCorretivas);
    }
}