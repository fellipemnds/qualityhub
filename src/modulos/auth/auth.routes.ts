import { FastifyInstance } from "fastify";
import { authController } from "./auth.controller.js";

export async function authRoutes(app: FastifyInstance) {
    app.post("/auth/definir-senha", authController.definirSenha);
    app.post("/auth/login", authController.login);
}