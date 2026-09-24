import type { FastifyReply, FastifyRequest } from "fastify";
import { NaoAutenticadoError } from "../compartilhado/errors/errors.js";

export async function autenticar(request: FastifyRequest, reply: FastifyReply) {
    try {
        await request.jwtVerify();
    } catch (error) {
        throw new NaoAutenticadoError();
    }
}
