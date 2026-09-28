import bcrypt from "bcrypt";
import { prisma } from "../compartilhado/prisma/cliente.js";

export async function criarUsuario({
    nome = "Usuário de Teste",
    email = "usuario@teste.com",
    senha = "SenhaDeTeste123!",
}: {
    nome?: string;
    email?: string;
    senha?: string | null;
} = {}) {
    const senhaHash = senha === null ? null : await bcrypt.hash(senha, 10);
    const usuario = await prisma.usuario.create({
        data: {
            nome,
            email,
            senhaHash,
            setor: {
                connectOrCreate: {
                    where: { nome: "Qualidade" },
                    create: { nome: "Qualidade" },
                },
            },
        },
    });

    return { usuario, senha };
}
