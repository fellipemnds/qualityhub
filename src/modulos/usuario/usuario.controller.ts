import type { FastifyRequest, FastifyReply } from 'fastify';
import { usuarioService } from './usuario.service.js';
import { CriarUsuarioInput } from './usuario.schema.js';

export const usuarioController = {
    async criar(request: FastifyRequest<{ Body: CriarUsuarioInput }>, reply: FastifyReply) {
        const dados = request.body;
        const { id, papeis } = request.user;

        const registro = await usuarioService.criarUsuario({ id, papeis }, dados);

        const contrato = { id: registro.usuario.id, tokenConvite: registro.token }

        return reply.status(201).send(contrato);
    }
}