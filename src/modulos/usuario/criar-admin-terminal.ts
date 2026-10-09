import { createInterface } from "node:readline";
import type { Readable, Writable } from "node:stream";
import { z } from "zod";
import { AppError } from "../../compartilhado/errors/errors.js";
import { prisma } from "../../compartilhado/prisma/cliente.js";
import { EMAIL, TEXTO_CURTO } from "../../compartilhado/validacao/tetos.js";
import { garantirAdmin } from "./garantir-admin.js";

const dadosSchema = z.object({
    nome: z.string().min(1).max(TEXTO_CURTO),
    email: z.email().max(EMAIL),
    setor: z.string().min(1).max(TEXTO_CURTO),
});

export async function criarAdminPeloTerminal({
    entrada,
    saida,
    urlDoSistema,
}: {
    entrada: Readable;
    saida: Writable;
    urlDoSistema?: string;
}) {
    const leitor = createInterface({ input: entrada });
    const linhas = leitor[Symbol.asyncIterator]();

    async function perguntar(texto: string) {
        saida.write(texto);
        const { value } = await linhas.next();
        return (value ?? "").trim();
    }

    const nome = await perguntar("Nome: ");
    const email = await perguntar("E-mail: ");
    const setor = await perguntar("Setor: ");

    const dados = dadosSchema.safeParse({ nome, email, setor });

    if (!dados.success) {
        saida.write(`${z.prettifyError(dados.error)}\n`);
        return 1;
    }

    saida.write(
        `O e-mail ${dados.data.email} vai ser um ADMIN ativo (${dados.data.nome}, setor ${dados.data.setor}).\n`,
    );
    const confirmacao = (await perguntar("Confirma? (s/N) ")).toLowerCase();

    if (confirmacao !== "s") {
        saida.write("Nada foi feito.\n");
        return 0;
    }

    try {
        const { token, expiraEm } = await prisma.$transaction((tx) => garantirAdmin(tx, dados.data));
        saida.write(
            `Link para definir a senha (vale até ${expiraEm.toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" })}, uma vez só):\n${urlDoSistema ?? ""}/definir-senha#token=${token}\n`,
        );
        return 0;
    } catch (erro) {
        if (erro instanceof AppError) {
            saida.write(`${erro.message}\n`);
            return 1;
        }
        throw erro;
    }
}
