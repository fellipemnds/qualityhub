import "@fastify/jwt";
import type { PerfilUsuario } from "../generated/prisma/client.js";

// Declara os itens do Token gerado na função Login do auth.controller.ts, pra não falhar a tipagem do request.user 


declare module "@fastify/jwt" {
    interface FastifyJWT {
        user: {
            id: number;
            perfil: PerfilUsuario;
        };
    }
}
