import type { FastifyInstance } from "fastify";
import { usuarioController } from "./usuario.controller.js";
import { autenticar } from "../../middlewares/autenticar.js";

export async function usuarioRoutes(app: FastifyInstance) {
    app.post("/usuarios", { onRequest: [autenticar] }, usuarioController.criar);
}