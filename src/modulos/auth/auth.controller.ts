import type { FastifyRequest, FastifyReply } from "fastify";
import { authService } from "./auth.service.js";
import { loginSchema, definirSenhaSchema } from "./auth.schema.js";

export const authController = {
    async definirSenha(request: FastifyRequest, reply: FastifyReply) {
        const info = definirSenhaSchema.parse(request.body);

        await authService.definirSenha(info.token, info.senha);

        return reply.status(204).send();
    },

    async login(request: FastifyRequest, reply: FastifyReply) {
        const login = loginSchema.parse(request.body);

        const usuario = await authService.fazerLogin(login.email, login.senha);
        const papeis = usuario.papeisRecebidos.map((usuarioPapel) => usuarioPapel.papel);

        const token = await reply.jwtSign(
            { id: usuario.id, papeis },
            { expiresIn: "5h" });

        return reply.status(200).send({ token });
    }
}