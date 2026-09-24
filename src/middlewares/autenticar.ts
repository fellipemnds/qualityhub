import type { FastifyRequest } from "fastify";
import { NaoAutenticadoError } from "../compartilhado/errors/errors.js";

export async function autenticar(request: FastifyRequest) {
    try {
        await request.jwtVerify();
    } catch {
        throw new NaoAutenticadoError();
    }
}
