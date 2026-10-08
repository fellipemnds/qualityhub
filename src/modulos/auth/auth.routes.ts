import crypto from "node:crypto";
import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";
import { erroSchema } from "../../compartilhado/errors/erro.schema.js";
import { autenticar } from "../../middlewares/autenticar.js";
import { authController } from "./auth.controller.js";
import { alterarEuSchema, definirSenhaSchema, euRespostaSchema, type LoginInput, loginSchema } from "./auth.schema.js";

export async function authRoutes(app: FastifyInstance) {
    app.withTypeProvider<ZodTypeProvider>().route({
        method: "POST",
        url: "/auth/definir-senha",
        // 5 tentativas por minuto para o mesmo link (F5): o que pesa é o bcrypt de um link válido, e o link inválido é
        // recusado antes dele. Por link, e não por IP: não junta pessoas atrás da mesma rede. A chave é o hash, para o
        // token não ficar guardado no limitador
        config: {
            rateLimit: {
                max: 5,
                timeWindow: "1 minute",
                hook: "preHandler",
                keyGenerator: (request) =>
                    `definir-senha:${crypto
                        .createHash("sha256")
                        .update((request.body as { token: string }).token)
                        .digest("hex")}`,
            },
        },
        schema: {
            body: definirSenhaSchema,
            response: { 204: z.null(), "4xx": erroSchema },
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
        // O token vai só no cookie (HttpOnly), nunca no corpo: o 204 não tem corpo
        schema: {
            body: loginSchema,
            response: { 204: z.null(), "4xx": erroSchema },
        },
        handler: authController.login,
    });
    app.withTypeProvider<ZodTypeProvider>().route({
        method: "GET",
        url: "/auth/eu",
        onRequest: [autenticar],
        schema: { response: { 200: euRespostaSchema, "4xx": erroSchema } },
        handler: authController.eu,
    });
    app.withTypeProvider<ZodTypeProvider>().route({
        method: "PATCH",
        url: "/auth/eu",
        onRequest: [autenticar],
        schema: {
            body: alterarEuSchema,
            response: { 200: euRespostaSchema, "4xx": erroSchema },
        },
        handler: authController.alterarEu,
    });
    app.withTypeProvider<ZodTypeProvider>().route({
        method: "POST",
        url: "/auth/logout",
        onRequest: [autenticar],
        schema: { response: { 204: z.null(), "4xx": erroSchema } },
        handler: authController.logout,
    });
    app.withTypeProvider<ZodTypeProvider>().route({
        method: "POST",
        url: "/auth/sair-de-todos",
        onRequest: [autenticar],
        schema: { response: { 204: z.null(), "4xx": erroSchema } },
        handler: authController.sairDeTodos,
    });
}
