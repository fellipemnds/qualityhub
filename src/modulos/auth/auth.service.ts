import { usuarioRepository } from "../usuario/usuario.repository.js";
import { ValidacaoError } from "../../compartilhado/errors/errors.js";
import bcrypt from "bcrypt";

export const authService = {
    // Recebe o e-mail do usuário para verificar se é seu primeiro acesso, se sim, transforma a senha em um hash e a manda para o usuario.repository, que é quem salva no banco.
    async definirSenha(email: string, senha: string) {
        // Busca do banco se o cadastro foi feito pelo Admin
        const usuario = await usuarioRepository.buscarPorEmail(email);

        // Verifica se não chegou vazio
        if (!usuario) {
            throw new ValidacaoError("Não foi possível processar a solicitação");
        }

        // Verifica se o primeiro acesso já não foi feito
        if (usuario.senhaHash) {
            throw new ValidacaoError("O acesso deste e-mail já foi feito no sistema");
        }

        const senhaHash = await bcrypt.hash(senha, 10);

        await usuarioRepository.definirSenha(usuario.id, senhaHash);
    },

    // Realiza o login, comparando o a senha com seu Hash e retorna o objeto usuário.
    async fazerLogin(email: string, senha: string) {
        // Busca do banco se o cadastro foi feito pelo Admin
        const usuario = await usuarioRepository.buscarPorEmail(email);

        // Verifica se não chegou vazio
        if (!usuario) {
            throw new ValidacaoError("Não foi possível processar a solicitação");
        }

        // Verifica se a pessoa já realizou o primeiro acesso
        if (!usuario.senhaHash) {
            throw new ValidacaoError("O primeiro acesso ainda não foi realizado");
        }

        const senhaConfere = await bcrypt.compare(senha, usuario.senhaHash);

        // Retorna se a senha não confere.
        if (!senhaConfere) {
            throw new ValidacaoError("Não foi possível processar a solicitação");
        }

        return usuario;
    }
}