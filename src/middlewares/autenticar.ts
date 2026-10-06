import type { FastifyRequest } from "fastify";
import { NaoAutenticadoError } from "../compartilhado/errors/errors.js";
import { prisma } from "../compartilhado/prisma/cliente.js";
import { usuarioRepository } from "../modulos/usuario/usuario.repository.js";

export async function autenticar(request: FastifyRequest) {
    let conteudo: { id: string; iat: number };

    try {
        conteudo = await request.jwtVerify<{ id: string; iat: number }>();
    } catch {
        throw new NaoAutenticadoError();
    }

    const usuario = await usuarioRepository.buscarPorId(prisma, conteudo.id);

    if (
        usuario === null ||
        usuario.desativadoEm !== null ||
        // O iat vem em segundos, arredondado para baixo; o sessaoValidaDesde, em milissegundos. Comparar no mesmo grão
        // evita recusar o login feito no mesmo segundo da criação do usuário. O preço: um token emitido no mesmo
        // segundo de um "sair de todos" ainda passa
        conteudo.iat < Math.floor(usuario.sessaoValidaDesde.getTime() / 1000)
    ) {
        throw new NaoAutenticadoError();
    }

    request.user = { id: usuario.id, papeis: usuario.papeisRecebidos.map((usuarioPapel) => usuarioPapel.papel) };
}
