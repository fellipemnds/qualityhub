import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { autenticar } from "../../middlewares/autenticar.js";
import { authController } from "./auth.controller.js";
import { alterarEuSchema, definirSenhaSchema, type LoginInput, loginSchema } from "./auth.schema.js";

export async function authRoutes(app: FastifyInstance) {
    app.withTypeProvider<ZodTypeProvider>().route({
        method: "POST",
        url: "/auth/definir-senha",
        schema: {
            body: definirSenhaSchema,
        },
        handler: authController.definirSenha,
    });
    app.withTypeProvider<ZodTypeProvider>().route({
        method: "POST",
        url: "/auth/login",
        // 5 tentativas por minuto por IP + e-mail (TRD §4.3). No preHandler, depois da validação, para o e-mail do corpo
        // já estar lá; em minúsculas, para "Ana@" e "ana@" contarem juntos
        config: {
            rateLimit: {
                max: 5,
                timeWindow: "1 minute",
                hook: "preHandler",
                keyGenerator: (request) => `${request.ip}:${(request.body as LoginInput).email.toLowerCase()}`,
                // O sinal de alguém tentando adivinhar uma senha: vai para o log, como as outras falhas (esquema, E1)
                onExceeded: (request, chave) => request.log.warn({ chave }, "Limite de tentativas de login atingido"),
            },
        },
        schema: {
            body: loginSchema,
        },
        handler: authController.login,
    });
    app.withTypeProvider<ZodTypeProvider>().route({
        method: "GET",
        url: "/auth/eu",
        onRequest: [autenticar],
        handler: authController.eu,
    });
    app.withTypeProvider<ZodTypeProvider>().route({
        method: "PATCH",
        url: "/auth/eu",
        onRequest: [autenticar],
        schema: {
            body: alterarEuSchema,
        },
        handler: authController.alterarEu,
    });
    app.withTypeProvider<ZodTypeProvider>().route({
        method: "POST",
        url: "/auth/logout",
        onRequest: [autenticar],
        handler: authController.logout,
    });
    app.withTypeProvider<ZodTypeProvider>().route({
        method: "POST",
        url: "/auth/sair-de-todos",
        onRequest: [autenticar],
        handler: authController.sairDeTodos,
    });
}
