import { usuarioRepository } from "./usuario.repository.js";
import { podeGerenciarUsuarios } from "../../lib/permissoes.js";
import type { CriarUsuarioInput } from "./usuario.schema.js";
import type { PerfilUsuario } from "../../generated/prisma/enums.js";
import { SemPermissaoError, ValidacaoError } from "../../lib/errors.js";

export const usuarioService = {
    async criar(dados: CriarUsuarioInput, perfilAutor: PerfilUsuario) {
        if (!podeGerenciarUsuarios(perfilAutor)) {
            throw new SemPermissaoError();
        }

        const usuarioExistente = await usuarioRepository.buscarPorEmail(dados.email)

        if (usuarioExistente) {
            throw new ValidacaoError("Este e-mail já está cadastrado");
        }

        const { setorId, ...info } = dados;

        const usuario = await usuarioRepository.criar({
            ...info,
            setor: { connect: { id: setorId } }
        });

        const { senhaHash, ...dadosUsuario } = usuario;

        return dadosUsuario;
    }
}