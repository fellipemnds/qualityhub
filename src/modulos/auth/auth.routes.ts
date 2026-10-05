import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { autenticar } from "../../middlewares/autenticar.js";
import { authController } from "./auth.controller.js";
import { alterarEuSchema, definirSenhaSchema, loginSchema } from "./auth.schema.js";

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
