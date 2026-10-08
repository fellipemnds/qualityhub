import "@fastify/jwt";
import type { Ator } from "../compartilhado/entidades/ator.js";

// O token carrega o id e a versão das sessões lida no login (sv, B27); o request.user é o Ator que o middleware autenticar
// monta com os papéis atuais, lidos do banco (B7)

declare module "@fastify/jwt" {
    interface FastifyJWT {
        payload: { id: string; sv: number };
        user: Ator;
    }
}
