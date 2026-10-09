import { atribuicaoRepository } from "../../compartilhado/atribuicao/atribuicao.repository.js";
import { auditoriaRepository } from "../../compartilhado/auditoria/auditoria.repository.js";
import { EntidadeAuditada } from "../../compartilhado/auditoria/entidades-auditadas.js";
import type { Ator } from "../../compartilhado/entidades/ator.js";
import type { Papel } from "../../compartilhado/entidades/papeis.js";
import {
    NaoEncontradoError,
    SemPermissaoError,
    TransicaoInvalidaError,
    ValidacaoError,
} from "../../compartilhado/errors/errors.js";
import { temPapel } from "../../compartilhado/permissoes/pode-executar.js";
import { prisma } from "../../compartilhado/prisma/cliente.js";
import type { ClientePrisma } from "../../compartilhado/prisma/tipos.js";
import { LIMITE_PADRAO_PAGINACAO, paginar } from "../../compartilhado/registro/paginacao-cursor.js";
import { emitirConvite } from "../auth/emitir-convite.js";
import { tokenAcessoRepository } from "../auth/token-acesso.repository.js";
import { conferirSetor } from "../setor/conferir-setor.js";
import { setorRepository } from "../setor/setor.repository.js";
import { usuarioRepository } from "./usuario.repository.js";
import type {
    CriarUsuarioInput,
    EditarUsuarioInput,
    PessoaFiltrosListagemInput,
    UsuarioFiltrosListagemInput,
} from "./usuario.schema.js";
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

// As travas da RN-43, para quem perde papéis (revogar um ou inativar, que tira todos): ninguém sai deixando item em
// aberto sem quem decida, nem o sistema sem ADMIN ativo. Recebe os papéis que saem; só o APROVADOR e o ADMIN travam
async function conferirSaida(tx: ClientePrisma, id: string, papeisQueSaem: Papel[]) {
    if (papeisQueSaem.includes("APROVADOR")) {
        const itens = (await atribuicaoRepository.listarItensAbertosDoAprovador(tx, id)).map(
            ({ registro }) => registro,
        );
        if (itens.length > 0) {
            throw new TransicaoInvalidaError(
                "Esta pessoa ainda é aprovadora dos itens da lista: reatribua o aprovador deles antes.",
                itens,
            );
        }
    }

    if (papeisQueSaem.includes("ADMIN")) {
        const outrosAdmins = await usuarioRepository.contarOutrosAdminsAtivos(tx, id);
        if (outrosAdmins === 0) {
            throw new TransicaoInvalidaError(
                "Esta pessoa é o último ADMIN ativo: conceda o papel ADMIN a outra pessoa antes.",
            );
        }
    }
}

// Na trilha, quem gerou e para quem, e o id do convite (o definir senha grava o mesmo id): nunca o token em claro
async function registrarConvite(
    tx: ClientePrisma,
    ator: Ator,
    usuarioId: string,
    convite: { id: string; expiraEm: Date },
) {
    await auditoriaRepository.registrar(tx, {
        entidade: EntidadeAuditada.USUARIO,
        entidadeId: usuarioId,
        acao: "GERAR_CONVITE",
        usuarioId: ator.id,
        antes: undefined,
        depois: { conviteId: convite.id, expiraEm: convite.expiraEm },
    });
}

export const usuarioService = {
    async listarUsuarios(ator: Ator, filtros: UsuarioFiltrosListagemInput) {
        exigirGerenciarUsuarios(ator);

        const limit = filtros.limit ?? LIMITE_PADRAO_PAGINACAO;
        const usuarios = await usuarioRepository.listar(prisma, { ...filtros, limit });

        return paginar(usuarios.map(comPapeis), limit);
    },

    // Aberta aos papéis de negócio (VISUALIZAR), não ao ADMIN: quem só administra contas não mexe em NC
    async listarPessoas(ator: Ator, filtros: PessoaFiltrosListagemInput) {
        if (!temPapel(ator, "VISUALIZAR")) {
            throw new SemPermissaoError("Você não tem permissões suficientes para visualizar.");
        }

        const limit = filtros.limit ?? LIMITE_PADRAO_PAGINACAO;
        const pessoas = await usuarioRepository.listarPessoas(prisma, { ...filtros, limit });

        return paginar(pessoas, limit);
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

            await conferirSaida(tx, id, [papel]);

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

    // Um link novo para definir a senha: o anterior se perdeu, expirou, ou a pessoa esqueceu a senha. Revoga os
    // pendentes e derruba as sessões (se o link vazou e alguém entrou por ele, sai). Inativo não recebe convite (F5)
    async gerarConvite(ator: Ator, id: string) {
        exigirGerenciarUsuarios(ator);

        return prisma.$transaction(async (tx) => {
            if (!(await usuarioRepository.travarAtivo(tx, id))) {
                await buscarParaAdminOuFalhar(tx, id);
                throw new TransicaoInvalidaError("Esta pessoa está inativa: reative antes de gerar um convite.");
            }

            const { token, convite } = await emitirConvite(tx, id);
            await usuarioRepository.encerrarSessoes(tx, id);
            await registrarConvite(tx, ator, id, convite);

            return { tokenConvite: token, expiraEm: convite.expiraEm };
        });
    },

    // Inativar quem já está inativo não é erro, e não mexe na data: responde como a pessoa está
    async inativarUsuario(ator: Ator, id: string) {
        exigirGerenciarUsuarios(ator);

        return prisma.$transaction(async (tx) => {
            const antes = await buscarParaAdminOuFalhar(tx, id);
            if (antes.desativadoEm !== null) {
                return comPapeis(antes);
            }

            await conferirSaida(tx, id, comPapeis(antes).papeis);

            // Outro inativar chegou antes (a trava esperou por ele): responde como a pessoa está, sem gravar de novo
            if (!(await usuarioRepository.inativar(tx, id))) {
                return comPapeis(await buscarParaAdminOuFalhar(tx, id));
            }
            // Um convite pendente não pode voltar a valer se a pessoa for reativada (F5)
            await tokenAcessoRepository.revogarPendentes(tx, id);
            const depois = await buscarParaAdminOuFalhar(tx, id);

            await auditoriaRepository.registrar(tx, {
                entidade: EntidadeAuditada.USUARIO,
                entidadeId: id,
                acao: "INATIVAR_USUARIO",
                usuarioId: ator.id,
                antes: { desativadoEm: antes.desativadoEm },
                depois: { desativadoEm: depois.desativadoEm },
            });

            return comPapeis(depois);
        });
    },

    // Reativar (E2): a pessoa volta a entrar e a aparecer nas opções; as sessões de antes continuam derrubadas
    async reativarUsuario(ator: Ator, id: string) {
        exigirGerenciarUsuarios(ator);

        return prisma.$transaction(async (tx) => {
            const antes = await buscarParaAdminOuFalhar(tx, id);
            if (antes.desativadoEm === null) {
                return comPapeis(antes);
            }
            // A pessoa voltaria para um setor que saiu das opções (RN-44): muda-se o setor dela antes
            if ((await setorRepository.buscarPorId(tx, antes.setor.id))?.desativadoEm != null) {
                throw new TransicaoInvalidaError(
                    "O setor desta pessoa está desativado: mude o setor dela antes de reativar.",
                );
            }

            const depois = await usuarioRepository.reativar(tx, id);

            await auditoriaRepository.registrar(tx, {
                entidade: EntidadeAuditada.USUARIO,
                entidadeId: id,
                acao: "REATIVAR_USUARIO",
                usuarioId: ator.id,
                antes: { desativadoEm: antes.desativadoEm },
                depois: { desativadoEm: depois.desativadoEm },
            });

            return comPapeis(depois);
        });
    },

    // Vale também para o usuário inativo: corrigir o cadastro de quem saiu não traz risco (Matthew, 2026-10-08)
    async editarUsuario(ator: Ator, id: string, dados: EditarUsuarioInput) {
        exigirGerenciarUsuarios(ator);

        return prisma.$transaction(async (tx) => {
            const antes = await buscarParaAdminOuFalhar(tx, id);
            await conferirSetor(tx, dados.setorId, antes.setor.id);

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

            // O usuário acabou de nascer nesta transação: ninguém mais tem o id dele para disputar a trava
            const { token, convite } = await emitirConvite(tx, usuario.id);
            await registrarConvite(tx, ator, usuario.id, convite);

            return { usuario, token };
        });
    },
};
