import { auditoriaRepository } from "../../compartilhado/auditoria/auditoria.repository.js";
import { EntidadeAuditada } from "../../compartilhado/auditoria/entidades-auditadas.js";
import type { Ator } from "../../compartilhado/entidades/ator.js";
import { NaoEncontradoError, SemPermissaoError, TransicaoInvalidaError } from "../../compartilhado/errors/errors.js";
import { temPapel } from "../../compartilhado/permissoes/pode-executar.js";
import { prisma } from "../../compartilhado/prisma/cliente.js";
import type { ClientePrisma } from "../../compartilhado/prisma/tipos.js";
import { setorRepository } from "./setor.repository.js";
import type { CriarSetorInput, EditarSetorInput, SetorFiltrosListagemInput } from "./setor.schema.js";

function exigirGerenciarSetores(ator: Ator) {
    if (!temPapel(ator, "GERENCIAR_SETORES")) {
        throw new SemPermissaoError("Você não possui os privilégios necessários para esta ação.");
    }
}

// O nome é único entre todos os setores, ativos ou não. Se o dono do nome está desativado, o caminho é reativá-lo, e
// não criar outro com o mesmo nome
async function conferirNomeLivre(tx: ClientePrisma, nome: string, idProprio?: number) {
    const dono = await setorRepository.buscarPorNome(tx, nome);
    if (dono === null || dono.id === idProprio) return;

    throw new TransicaoInvalidaError(
        dono.desativadoEm === null
            ? "Já existe um setor com este nome."
            : "Já existe um setor desativado com este nome: reative-o em vez de criar outro.",
    );
}

async function buscarOuFalhar(tx: ClientePrisma, id: number) {
    const setor = await setorRepository.buscarPorId(tx, id);
    if (setor === null) {
        throw new NaoEncontradoError("O setor não existe ou não foi encontrado.");
    }
    return { id: setor.id, nome: setor.nome, desativadoEm: setor.desativadoEm };
}

// Desativar e reativar só vão para a trilha quando mudam algo: repetir não grava de novo
async function registrarSituacao(
    tx: ClientePrisma,
    ator: Ator,
    id: number,
    acao: "DESATIVAR_SETOR" | "REATIVAR_SETOR",
    desativadoEmAntes: Date | null,
) {
    const depois = await setorRepository.buscarPorId(tx, id);
    await auditoriaRepository.registrar(tx, {
        entidade: EntidadeAuditada.SETOR,
        entidadeId: String(id),
        acao,
        usuarioId: ator.id,
        antes: { desativadoEm: desativadoEmAntes },
        depois: { desativadoEm: depois?.desativadoEm ?? null },
    });
}

export const setorService = {
    // Qualquer pessoa logada vê os setores ativos (as opções de escolha); só o ADMIN pede os desativados (RN-44)
    async listarSetores(ator: Ator, filtros: SetorFiltrosListagemInput) {
        if (filtros.situacao !== "ATIVO") {
            exigirGerenciarSetores(ator);
        }

        return setorRepository.listar(prisma, filtros.situacao);
    },

    async criarSetor(ator: Ator, dados: CriarSetorInput) {
        exigirGerenciarSetores(ator);

        return prisma.$transaction(async (tx) => {
            await conferirNomeLivre(tx, dados.nome);
            const setor = await setorRepository.criar(tx, dados.nome);

            await auditoriaRepository.registrar(tx, {
                entidade: EntidadeAuditada.SETOR,
                entidadeId: String(setor.id),
                acao: "CRIAR_SETOR",
                usuarioId: ator.id,
                antes: undefined,
                depois: { nome: setor.nome },
            });

            return setor;
        });
    },

    // Some das opções de escolha; as NCs e as pessoas inativas que estão nele continuam (RN-44). Recusa enquanto houver
    // pessoa ativa, com a lista, para o ADMIN mudá-las antes
    async desativarSetor(ator: Ator, id: number) {
        exigirGerenciarSetores(ator);

        return prisma.$transaction(async (tx) => {
            // Trava o setor antes de listar as pessoas: quem escolhe este setor no meio espera e o vê desativado (B35)
            await setorRepository.travar(tx, id);
            const antes = await buscarOuFalhar(tx, id);

            const pessoasAtivas = await setorRepository.listarPessoasAtivas(tx, id);
            if (pessoasAtivas.length > 0) {
                throw new TransicaoInvalidaError(
                    "Ainda há pessoas ativas neste setor: mude o setor delas antes de desativar.",
                    pessoasAtivas,
                );
            }

            if (await setorRepository.desativar(tx, id)) {
                await registrarSituacao(tx, ator, id, "DESATIVAR_SETOR", antes.desativadoEm);
            }

            return buscarOuFalhar(tx, id);
        });
    },

    async reativarSetor(ator: Ator, id: number) {
        exigirGerenciarSetores(ator);

        return prisma.$transaction(async (tx) => {
            const antes = await buscarOuFalhar(tx, id);

            if (await setorRepository.reativar(tx, id)) {
                await registrarSituacao(tx, ator, id, "REATIVAR_SETOR", antes.desativadoEm);
            }

            return buscarOuFalhar(tx, id);
        });
    },

    async renomearSetor(ator: Ator, id: number, dados: EditarSetorInput) {
        exigirGerenciarSetores(ator);

        return prisma.$transaction(async (tx) => {
            const antes = await buscarOuFalhar(tx, id);
            if (dados.nome === undefined || dados.nome === antes.nome) {
                return { id: antes.id, nome: antes.nome, desativadoEm: antes.desativadoEm };
            }

            await conferirNomeLivre(tx, dados.nome, id);
            const depois = await setorRepository.renomear(tx, id, dados.nome);

            await auditoriaRepository.registrar(tx, {
                entidade: EntidadeAuditada.SETOR,
                entidadeId: String(id),
                acao: "RENOMEAR_SETOR",
                usuarioId: ator.id,
                antes: { nome: antes.nome },
                depois: { nome: depois.nome },
            });

            return depois;
        });
    },
};
