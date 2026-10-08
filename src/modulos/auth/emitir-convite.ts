import crypto from "node:crypto";
import type { ClientePrisma } from "../../compartilhado/prisma/tipos.js";
import { tokenAcessoRepository } from "./token-acesso.repository.js";

const VALIDADE_DO_CONVITE_MS = 72 * 60 * 60 * 1000;

// O único lugar que emite convite (F5): revoga os pendentes da pessoa e cria o novo, que sai em claro uma vez só (no
// banco, só o hash). Quem chama já travou a linha do usuário na mesma transação (o UPDATE condicional): dois convites ao
// mesmo tempo esperam um pelo outro, e o segundo já enxerga e revoga o do primeiro
export async function emitirConvite(tx: ClientePrisma, usuarioId: string) {
    await tokenAcessoRepository.revogarPendentes(tx, usuarioId);

    const token = crypto.randomBytes(32).toString("hex");
    const convite = await tokenAcessoRepository.criar(tx, {
        usuarioId,
        tipo: "CONVITE",
        tokenHash: crypto.createHash("sha256").update(token).digest("hex"),
        expiraEm: new Date(Date.now() + VALIDADE_DO_CONVITE_MS),
    });

    return { token, convite };
}
