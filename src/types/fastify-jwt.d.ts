import "@fastify/jwt";
import { Papel } from "../compartilhado/entidades/papeis.js";

// Declara os itens do Token gerado na função Login do auth.controller.ts, pra não falhar a tipagem do request.user 

declare module "@fastify/jwt" {
    interface FastifyJWT {
        user: {
            id: string;
            papeis: Papel[];
        };
    }
}