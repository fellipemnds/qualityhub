import crypto from "node:crypto";
import { auditoriaRepository } from "../../compartilhado/auditoria/auditoria.repository.js";
import { EntidadeAuditada } from "../../compartilhado/auditoria/entidades-auditadas.js";
import type { Ator } from "../../compartilhado/entidades/ator.js";
import type { Papel } from "../../compartilhado/entidades/papeis.js";
import { NaoEncontradoError, SemPermissaoError, ValidacaoError } from "../../compartilhado/errors/errors.js";
import { temPapel } from "../../compartilhado/permissoes/pode-executar.js";
import { prisma } from "../../compartilhado/prisma/cliente.js";
import type { ClientePrisma } from "../../compartilhado/prisma/tipos.js";
import { LIMITE_PADRAO_PAGINACAO, paginar } from "../../compartilhado/registro/paginacao-cursor.js";
import { tokenAcessoRepository } from "../auth/token-acesso.repository.js";
import { conferirSetor } from "../setor/conferir-setor.js";
import { usuarioRepository } from "./usuario.repository.js";
import type { CriarUsuarioInput, EditarUsuarioInput, UsuarioFiltrosListagemInput } from "./usuario.schema.js";
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

async function buscarParaAdminOuFalhar(tx: ClientePrisma, id: string) {
    const usuario = await usuarioRepository.buscarParaAdmin(tx, id);
    if (usuario === null) {
        throw new NaoEncontradoError("Usuário não encontrado.");
    }

    return usuario;
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

        return comPapeis(await buscarParaAdminOuFalhar(prisma, id));
    },

    // Conceder o que a pessoa já tem não é erro: responde como ela está, sem nada na auditoria (como os colaboradores)
    async concederPapel(ator: Ator, id: string, papel: Papel) {
        exigirGerenciarUsuarios(ator);

        return prisma.$transaction(async (tx) => {
            const antes = await buscarParaAdminOuFalhar(tx, id);
            if (antes.papeisRecebidos.some((recebido) => recebido.papel === papel)) {
                return comPapeis(antes);
            }

            await usuarioPapelRepository.concederPapel(tx, { usuarioId: id, papel, concedidoPorId: ator.id });
            const depois = await buscarParaAdminOuFalhar(tx, id);

            await auditoriaRepository.registrar(tx, {
                entidade: EntidadeAuditada.USUARIO,
                entidadeId: id,
                acao: "CONCEDER_PAPEL",
                usuarioId: ator.id,
                antes: { papeis: comPapeis(antes).papeis },
                depois: { papeis: comPapeis(depois).papeis },
            });

            return comPapeis(depois);
        });
    },

    // Revogar o que a pessoa não tem também não é erro. O papel deixa de valer na próxima requisição dela (B7)
    async revogarPapel(ator: Ator, id: string, papel: Papel) {
        exigirGerenciarUsuarios(ator);

        return prisma.$transaction(async (tx) => {
            const antes = await buscarParaAdminOuFalhar(tx, id);
            if (!antes.papeisRecebidos.some((recebido) => recebido.papel === papel)) {
                return comPapeis(antes);
            }

            await usuarioPapelRepository.revogarPapel(tx, id, papel);
            const depois = await buscarParaAdminOuFalhar(tx, id);

            await auditoriaRepository.registrar(tx, {
                entidade: EntidadeAuditada.USUARIO,
                entidadeId: id,
                acao: "REVOGAR_PAPEL",
                usuarioId: ator.id,
                antes: { papeis: comPapeis(antes).papeis },
                depois: { papeis: comPapeis(depois).papeis },
            });

            return comPapeis(depois);
        });
    },

    // Vale também para o usuário inativo: corrigir o cadastro de quem saiu não traz risco (Matthew, 2026-10-08)
    async editarUsuario(ator: Ator, id: string, dados: EditarUsuarioInput) {
        exigirGerenciarUsuarios(ator);

        return prisma.$transaction(async (tx) => {
            const antes = await buscarParaAdminOuFalhar(tx, id);
            await conferirSetor(tx, dados.setorId);

            const depois = await usuarioRepository.atualizar(tx, id, dados);

            // Na trilha, só o que a edição muda: o usuário inteiro levaria a senha junto
            await auditoriaRepository.registrar(tx, {
                entidade: EntidadeAuditada.USUARIO,
                entidadeId: id,
                acao: "EDITAR",
                usuarioId: ator.id,
                antes: { nome: antes.nome, setorId: antes.setor.id },
                depois: { nome: depois.nome, setorId: depois.setor.id },
            });

            return comPapeis(depois);
        });
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
