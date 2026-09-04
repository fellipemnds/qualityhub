import { prisma } from "../../lib/prisma.js"
import type { Prisma } from "../../generated/prisma/client.js"

export const usuarioRepository = {
    async buscarPorEmail(email: string) {
        return prisma.usuario.findUnique({
            where: { email }
        })
    },

    async buscarPorId(id: number) {
        return prisma.usuario.findUnique({
            where: { id }
        })
    },

    async definirSenha(id: number, senhaHash: string) {
        return prisma.usuario.update({
            where: { id },
            data: { senhaHash }
        })
    },

    async criar(dados: Prisma.UsuarioCreateInput) {
        return prisma.usuario.create({ data: dados })
    }
};