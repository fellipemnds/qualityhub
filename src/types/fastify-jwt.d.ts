import "@fastify/jwt";
import type { Ator } from "../compartilhado/entidades/ator.js";

// O token carrega só o id (payload); o request.user é o Ator que o middleware autenticar monta com os papéis atuais, lidos do banco (B7)

declare module "@fastify/jwt" {
    interface FastifyJWT {
        payload: { id: string };
        user: Ator;
    }
}
