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
    // 4 para diminuir o custo dos testes. Produção é 12 (definir-senha)
    const senhaHash = senha === null ? null : await bcrypt.hash(senha, 4);
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

let loginsFeitos = 0;

export async function loginComo(perfil: Perfil) {
    const { usuario, senha } = await criarUsuario({ nome: perfil, email: `${perfil}@teste.com` });
    const papeis: Papel[] = PERFIS[perfil];

    // Com o banco vazio não há quem conceda o papel: o usuário concede a si mesmo, como o admin do setup-usuarios-teste.sql
    await prisma.usuarioPapel.createMany({
        data: papeis.map((papel) => ({ usuarioId: usuario.id, papel, concedidoPorId: usuario.id })),
    });

    // Um IP por login: o limite de 5 tentativas por minuto (IP + e-mail) vale de verdade nos testes, e o mesmo perfil
    // entra dezenas de vezes por minuto
    loginsFeitos++;
    const resposta = await app.inject({
        method: "POST",
        url: "/auth/login",
        remoteAddress: `10.0.${Math.floor(loginsFeitos / 250)}.${(loginsFeitos % 250) + 1}`,
        payload: { email: usuario.email, senha },
    });

    // Falha no Prepara, e não um token undefined que só quebraria lá na frente, longe da causa
    if (resposta.statusCode !== 204) {
        throw new Error(`loginComo("${perfil}") falhou: ${resposta.statusCode} ${resposta.body}`);
    }

    const cookie = resposta.cookies.find((c) => c.name === "qh_sessao");

    if (cookie === undefined) {
        throw new Error(`loginComo("${perfil}"): o login não devolveu o cookie qh_sessao`);
    }
    const token = cookie.value;

    return { usuario, token, autenticacao: { cookie: `qh_sessao=${token}` } };
}
