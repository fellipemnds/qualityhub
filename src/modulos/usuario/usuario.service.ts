import crypto from "node:crypto";
import { auditoriaRepository } from "../../compartilhado/auditoria/auditoria.repository.js";
import { EntidadeAuditada } from "../../compartilhado/auditoria/entidades-auditadas.js";
import type { Ator } from "../../compartilhado/entidades/ator.js";
import type { Papel } from "../../compartilhado/entidades/papeis.js";
import { NaoEncontradoError, SemPermissaoError, ValidacaoError } from "../../compartilhado/errors/errors.js";
import { temPapel } from "../../compartilhado/permissoes/pode-executar.js";
import { prisma } from "../../compartilhado/prisma/cliente.js";
import { LIMITE_PADRAO_PAGINACAO, paginar } from "../../compartilhado/registro/paginacao-cursor.js";
import { tokenAcessoRepository } from "../auth/token-acesso.repository.js";
import { conferirSetor } from "../setor/conferir-setor.js";
import { usuarioRepository } from "./usuario.repository.js";
import type { CriarUsuarioInput, UsuarioFiltrosListagemInput } from "./usuario.schema.js";
import { usuarioPapelRepository } from "./usuario-papel.repository.js";

// Os papéis saem como lista de nomes, não como as linhas da tabela UsuarioPapel
function comPapeis<T>({ papeisRecebidos, ...usuario }: T & { papeisRecebidos: { papel: Papel }[] }) {
    return { ...usuario, papeis: papeisRecebidos.map(({ papel }) => papel) };
}

// Gerir usuários é só do ADMIN, e a permissão vem antes de qualquer busca: quem não pode não aprende nem se o
// usuário existe (como a L5)
function exigirGerenciarUsuarios(ator: Ator) {
    if (!temPapel(ator, "GERENCIAR_USUARIOS")) {
        throw new SemPermissaoError("Você não possui os privilégios necessários para esta ação.");
    }
}

export const usuarioService = {
    async listarUsuarios(ator: Ator, filtros: UsuarioFiltrosListagemInput) {
        exigirGerenciarUsuarios(ator);

        const limit = filtros.limit ?? LIMITE_PADRAO_PAGINACAO;
        const usuarios = await usuarioRepository.listar(prisma, { ...filtros, limit });

        return paginar(usuarios.map(comPapeis), limit);
    },

    async buscarUsuario(ator: Ator, id: string) {
        exigirGerenciarUsuarios(ator);

        const usuario = await usuarioRepository.buscarParaAdmin(prisma, id);
        if (usuario === null) {
            throw new NaoEncontradoError("Usuário não encontrado.");
        }

        return comPapeis(usuario);
    },

    async criarUsuario(ator: Ator, dados: CriarUsuarioInput) {
        return prisma.$transaction(async (tx) => {
            exigirGerenciarUsuarios(ator);

            const usuarioExistente = await usuarioRepository.buscarPorEmail(tx, dados.email);

            if (usuarioExistente !== null) {
                throw new ValidacaoError("Este usuário já está cadastrado");
            }

            await conferirSetor(tx, dados.setorId);

            const { papeis, ...dadosUsuario } = dados;

            const usuario = await usuarioRepository.criar(tx, dadosUsuario);

            for (const papel of papeis) {
                await usuarioPapelRepository.concederPapel(tx, {
                    usuarioId: usuario.id,
                    papel,
                    concedidoPorId: ator.id,
                });
            }

            await auditoriaRepository.registrar(tx, {
                entidade: EntidadeAuditada.USUARIO,
                entidadeId: usuario.id,
                acao: "CRIAR_USUARIO",
                usuarioId: ator.id,
                antes: undefined,
                depois: usuario,
            });

            const token = crypto.randomBytes(32).toString("hex");
            const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

            await tokenAcessoRepository.criar(tx, {
                usuarioId: usuario.id,
                tipo: "CONVITE",
                tokenHash,
                expiraEm: new Date(Date.now() + 72 * 60 * 60 * 1000),
            });

            return { usuario, token };
        });
    },
};
