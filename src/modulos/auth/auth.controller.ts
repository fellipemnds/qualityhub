import type { FastifyRequest, FastifyReply } from "fastify";
import { authService } from "./auth.service.js";
import { loginSchema, definirSenhaSchema } from "./auth.schema.js";

export const authController = {
    // Pega os dados enviados do navegador e joga para as funções do auth.service
    async definirSenha(request: FastifyRequest, reply: FastifyReply) {
        // Separa os dados e faz a validação do tipo
        const info = definirSenhaSchema.parse(request.body);

        // Chama a função de definir a senha no primeiro cadastro
        await authService.definirSenha(info.email, info.senha);

        // Retorna o sucesso (Se fracassar, a função definirSenha do authService já barra)
        return reply.status(204).send();
    },

    async login(request: FastifyRequest, reply: FastifyReply) {
        // Separa os dados e faz a validação do tipo
        const info = loginSchema.parse(request.body);

        // Faz a verificação e retorna o usuário, se sucesso
        const usuario = await authService.fazerLogin(info.email, info.senha);

        // Cria e assina o token digital do usuário
        const token = await reply.jwtSign(
            { id: usuario.id, perfil: usuario.perfil },
            { expiresIn: "5h" });

        // Retorna o status 200 e envia o Token como JSON.
        return reply.status(200).send({ token });
    }
}