import type { FastifyInstance } from "fastify";
import { ncController } from "./nc.controller.js";

export async function ncRoutes(app: FastifyInstance) {
    app.get("/nao-conformidades", ncController.listar);
    app.get("/nao-conformidades/:id", ncController.buscarPorId)
    app.post("/nao-conformidades", ncController.criar)
}