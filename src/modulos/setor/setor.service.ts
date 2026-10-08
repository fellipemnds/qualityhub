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

    async renomearSetor(ator: Ator, id: number, dados: EditarSetorInput) {
        exigirGerenciarSetores(ator);

        return prisma.$transaction(async (tx) => {
            const antes = await setorRepository.buscarPorId(tx, id);
            if (antes === null) {
                throw new NaoEncontradoError("O setor não existe ou não foi encontrado.");
            }
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
