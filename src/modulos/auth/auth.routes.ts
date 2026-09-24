import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { authController } from "./auth.controller.js";
import { definirSenhaSchema, loginSchema } from "./auth.schema.js";

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
}
