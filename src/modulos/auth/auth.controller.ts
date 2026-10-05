import type { FastifyReply, FastifyRequest } from "fastify";
import type { DefinirSenhaInput, LoginInput } from "./auth.schema.js";
import { authService } from "./auth.service.js";
import { COOKIE_SESSAO, OPCOES_COOKIE_SESSAO } from "./cookie-sessao.js";

export const authController = {
    async definirSenha(request: FastifyRequest<{ Body: DefinirSenhaInput }>, reply: FastifyReply) {
        const { token, senha } = request.body;

        await authService.definirSenha(token, senha);

        return reply.status(204).send();
    },

    async login(request: FastifyRequest<{ Body: LoginInput }>, reply: FastifyReply) {
        const { email, senha, manterConectado } = request.body;

        const usuario = await authService.fazerLogin(email, senha);

        const token = await reply.jwtSign({ id: usuario.id }, { expiresIn: manterConectado ? "30d" : "12h" });

        return reply
            .setCookie(COOKIE_SESSAO, token, {
                ...OPCOES_COOKIE_SESSAO,
                maxAge: manterConectado ? 30 * 24 * 60 * 60 : undefined,
            })
            .status(204)
            .send();
    },

    // Apaga o cookie deste navegador. As outras sessões continuam: para elas, o sair-de-todos
    async logout(_request: FastifyRequest, reply: FastifyReply) {
        return reply.clearCookie(COOKIE_SESSAO, OPCOES_COOKIE_SESSAO).status(204).send();
    },

    // Derruba toda sessão já emitida, em qualquer aparelho (perdeu o celular, por exemplo), e apaga a deste navegador
    async sairDeTodos(request: FastifyRequest, reply: FastifyReply) {
        await authService.sairDeTodos(request.user);

        return reply.clearCookie(COOKIE_SESSAO, OPCOES_COOKIE_SESSAO).status(204).send();
    },
};
