import type { FastifyRequest } from "fastify";
import { NaoAutenticadoError } from "../compartilhado/errors/errors.js";
import { prisma } from "../compartilhado/prisma/cliente.js";
import { usuarioRepository } from "../modulos/usuario/usuario.repository.js";

export async function autenticar(request: FastifyRequest) {
    let conteudo: { id: string; sv?: number };

    try {
        conteudo = await request.jwtVerify<{ id: string; sv?: number }>();
    } catch {
        throw new NaoAutenticadoError();
    }

    const usuario = await usuarioRepository.buscarPorId(prisma, conteudo.id);

    if (
        usuario === null ||
        usuario.desativadoEm !== null ||
        // A versão das sessões que o login leu tem de ser a de agora: derrubar as sessões soma 1, e todo token de antes,
        // inclusive o de um login em voo naquele momento, para de valer (B27). Token sem versão também não vale
        conteudo.sv !== usuario.versaoSessao
    ) {
        throw new NaoAutenticadoError();
    }

    request.user = { id: usuario.id, papeis: usuario.papeisRecebidos.map((usuarioPapel) => usuarioPapel.papel) };
}
