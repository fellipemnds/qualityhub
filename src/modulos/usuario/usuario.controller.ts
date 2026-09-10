import type { FastifyRequest, FastifyReply } from 'fastify';
import { usuarioService } from './usuario.service.js';
import { criarUsuarioSchema } from './usuario.schema.js';

export const usuarioController = {
    async criar(request: FastifyRequest, reply: FastifyReply) {
        const dados = criarUsuarioSchema.parse(request.body);

        const usuario = await usuarioService.criar(dados, request.user.perfil);

        return reply.status(201).send(usuario);
    }
}