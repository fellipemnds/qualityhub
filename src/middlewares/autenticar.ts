import type { FastifyReply, FastifyRequest } from "fastify";
import { NaoAutenticadoError } from "../lib/errors.js";

export async function autenticar(request: FastifyRequest, reply: FastifyReply) {
    try {
        await request.jwtVerify();
    } catch (error) {
        throw new NaoAutenticadoError();
    }
}