import crypto from "node:crypto";
import bcrypt from "bcrypt";
import { auditoriaRepository } from "../../compartilhado/auditoria/auditoria.repository.js";
import { EntidadeAuditada } from "../../compartilhado/auditoria/entidades-auditadas.js";
import { CredenciaisInvalidasError, ValidacaoError } from "../../compartilhado/errors/errors.js";
import { prisma } from "../../compartilhado/prisma/cliente.js";
import { usuarioRepository } from "../usuario/usuario.repository.js";
import { tokenAcessoRepository } from "./token-acesso.repository.js";

export const authService = {
    async definirSenha(token: string, senha: string) {
        return prisma.$transaction(async (tx) => {
            const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
            const tokenAcesso = await tokenAcessoRepository.buscarPorHash(tx, tokenHash);

            if (!tokenAcesso) {
                throw new ValidacaoError("Não foi possível processar a solicitação.");
            }

            if (tokenAcesso.usadoEm !== null) {
                throw new ValidacaoError("Este token já foi utilizado");
            }

            const agora = new Date(Date.now());
            if (tokenAcesso.expiraEm < agora) {
                throw new ValidacaoError("Token expirado.");
            }

            const senhaHash = await bcrypt.hash(senha, 10);

            await usuarioRepository.definirSenha(tx, tokenAcesso.usuarioId, senhaHash);
            await tokenAcessoRepository.marcarComoUsado(tx, tokenAcesso.id);

            await auditoriaRepository.registrar(tx, {
                entidade: EntidadeAuditada.USUARIO,
                entidadeId: tokenAcesso.usuarioId,
                acao: "DEFINIR_SENHA",
                usuarioId: tokenAcesso.usuarioId,
                antes: undefined,
                depois: undefined,
            });
        });
    },

    // Realiza o login, comparando o a senha com seu Hash e retorna o objeto usuário.
    async fazerLogin(email: string, senha: string) {
        // Busca do banco se o cadastro foi feito pelo Admin
        const usuario = await usuarioRepository.buscarPorEmail(prisma, email);

        // Verifica se não chegou vazio
        if (!usuario) {
            throw new CredenciaisInvalidasError();
        }

        // Verifica se a pessoa já realizou o primeiro acesso
        if (!usuario.senhaHash) {
            throw new CredenciaisInvalidasError();
        }

        const senhaConfere = await bcrypt.compare(senha, usuario.senhaHash);

        // Retorna se a senha não confere.
        if (!senhaConfere) {
            throw new CredenciaisInvalidasError();
        }

        return usuario;
    },
};
