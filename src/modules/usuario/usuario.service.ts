import { usuarioRepository } from "./usuario.repository.js";
import { ValidacaoError } from "../../lib/errors.js";
import bcrypt from "bcrypt";

export const usuarioService = {
    async definirSenha(email: string, senha: string) {
        const usuario = await usuarioRepository.buscarPorEmail(email);

        if (!usuario) {
            throw new ValidacaoError("Não foi possível processar a solicitação");
        }

        if (usuario.senhaHash) {
            throw new ValidacaoError("O acesso deste e-mail já foi feito no sistema");
        }

        const senhaHash = await bcrypt.hash(senha, 10);

        await usuarioRepository.definirSenha(usuario.id, senhaHash);
    },

    async fazerLogin(email: string, senha: string) {
        const usuario = await usuarioRepository.buscarPorEmail(email);

        if (!usuario) {
            throw new ValidacaoError("Não foi possível processar a solicitação");
        }

        if (!usuario.senhaHash) {
            throw new ValidacaoError("O primeiro acesso ainda não foi realizado");
        }

        const senhaConfere = await bcrypt.compare(senha, usuario.senhaHash);

        if (!senhaConfere) {
            throw new ValidacaoError("Não foi possível processar a solicitação");
        }

        return usuario;
    }
}