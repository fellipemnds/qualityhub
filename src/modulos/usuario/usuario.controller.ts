import type { FastifyRequest, FastifyReply } from 'fastify';
import { usuarioService } from './usuario.service.js';
import { criarUsuarioSchema } from './usuario.schema.js';

export const usuarioController = {
    async criar(request: FastifyRequest, reply: FastifyReply) {
        const dados = criarUsuarioSchema.parse(request.body);

        const registro = await usuarioService.criarUsuario({ id: request.user.id, papeis: request.user.papeis }, dados);

        const contrato = { id: registro.usuario.id, tokenConvite: registro.token }

        return reply.status(201).send(contrato);
    }
}