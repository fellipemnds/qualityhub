import bcrypt from "bcrypt";
import { app } from "../app.js";
import { Papel } from "../compartilhado/entidades/papeis.js";
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

// Os perfis de testes/setup-usuarios-teste.sql
export const PERFIS = {
    admin: [Papel.ADMIN],
    editor: [Papel.EDITOR],
    aprovador: [Papel.APROVADOR],
    qa: [Papel.EDITOR, Papel.APROVADOR],
    gerente: [Papel.EDITOR, Papel.APROVADOR, Papel.GERENTE],
    visualizador: [Papel.VISUALIZADOR],
    semPapel: [],
} satisfies Record<string, Papel[]>;

export type Perfil = keyof typeof PERFIS;

// O único helper de autenticação dos testes: na A4 o login passa a devolver cookie, e só ele muda
export async function loginComo(perfil: Perfil) {
    const { usuario, senha } = await criarUsuario({ nome: perfil, email: `${perfil}@teste.com` });
    const papeis: Papel[] = PERFIS[perfil];

    // Com o banco vazio não há quem conceda o papel: o usuário concede a si mesmo, como o admin do setup-usuarios-teste.sql
    await prisma.usuarioPapel.createMany({
        data: papeis.map((papel) => ({ usuarioId: usuario.id, papel, concedidoPorId: usuario.id })),
    });

    const resposta = await app.inject({
        method: "POST",
        url: "/auth/login",
        payload: { email: usuario.email, senha },
    });

    // Falha no Prepara, e não um token undefined que só quebraria lá na frente, longe da causa
    if (resposta.statusCode !== 200) {
        throw new Error(`loginComo("${perfil}") falhou: ${resposta.statusCode} ${resposta.body}`);
    }

    const { token } = resposta.json<{ token: string }>();

    // O cabeçalho pronto: o formato mora só aqui (na A4 vira cookie)
    return { usuario, token, autenticacao: { authorization: `Bearer ${token}` } };
}
