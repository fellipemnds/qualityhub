import type { FastifyReply, FastifyRequest } from "fastify";
import type { DefinirSenhaInput, LoginInput } from "./auth.schema.js";
import { authService } from "./auth.service.js";

export const authController = {
    async definirSenha(request: FastifyRequest<{ Body: DefinirSenhaInput }>, reply: FastifyReply) {
        const { token, senha } = request.body;

        await authService.definirSenha(token, senha);

        return reply.status(204).send();
    },

    async login(request: FastifyRequest<{ Body: LoginInput }>, reply: FastifyReply) {
        const { email, senha, manterConectado } = request.body;

        const usuario = await authService.fazerLogin(email, senha);
        const papeis = usuario.papeisRecebidos.map((usuarioPapel) => usuarioPapel.papel);

        const token = await reply.jwtSign({ id: usuario.id, papeis }, { expiresIn: manterConectado ? "30d" : "12h" });

        return reply
            .setCookie("qh_sessao", token, {
                httpOnly: true,
                secure: true,
                sameSite: "strict",
                path: "/",
                maxAge: manterConectado ? 30 * 24 * 60 * 60 : undefined,
            })
            .status(204)
            .send();
    },
};
