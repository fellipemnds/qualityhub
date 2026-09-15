import crypto from "node:crypto";
import { Papel } from "../../compartilhado/entidades/papeis.js";
import { SemPermissaoError, ValidacaoError } from "../../compartilhado/errors/errors.js";
import { temPapel } from "../../compartilhado/permissoes/pode-executar.js";
import { prisma } from "../../compartilhado/prisma/cliente.js";
import { usuarioPapelRepository } from "./usuario-papel.repository.js";
import { usuarioRepository } from "./usuario.repository.js";
import { CriarUsuarioInput } from "./usuario.schema.js";
import { tokenAcessoRepository } from "../auth/token-acesso.repository.js";

export const usuarioService = {
    async criarUsuario(ator: { id: string, papeis: Papel[] }, dados: CriarUsuarioInput) {
        return prisma.$transaction(async (tx) => {
            const podeGerir = temPapel(ator, "GERENCIAR_USUARIOS");

            if (!podeGerir) {
                throw new SemPermissaoError("Você não possui os privilégios necessários para esta ação.");
            }

            const usuarioExistente = await usuarioRepository.buscarPorEmail(tx, dados.email);

            if (usuarioExistente !== null) {
                throw new ValidacaoError("Este usuário já está cadastrado");
            }

            const { papeis, ...dadosUsuario } = dados;

            const usuario = await usuarioRepository.criar(tx, dadosUsuario);

            for (const papel of papeis) {
                await usuarioPapelRepository.concederPapel(tx, {
                    usuarioId: usuario.id,
                    papel,
                    concedidoPorId: ator.id
                })
            }

            const token = crypto.randomBytes(32).toString("hex");
            const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

            const registraToken = await tokenAcessoRepository.criar(tx, {
                usuarioId: usuario.id,
                tipo: "CONVITE",
                tokenHash,
                expiraEm: new Date(Date.now() + (72 * 60 * 60 * 1000))
            })

            return {usuario, token};
        });
    }
}