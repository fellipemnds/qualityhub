import type { FastifyInstance } from "fastify";
import { ncController } from "./nc.controller.js";
import { autenticar } from "../../middlewares/autenticar.js"

export async function ncRoutes(app: FastifyInstance) {
    app.get("/nao-conformidades", { onRequest: [autenticar] }, ncController.listar);
    app.get("/nao-conformidades/:id", { onRequest: [autenticar] }, ncController.buscarPorId);
    app.post("/nao-conformidades", { onRequest: [autenticar] }, ncController.criar);
    app.patch("/nao-conformidades/:id/classificar", { onRequest: [autenticar] }, ncController.classificar);
}