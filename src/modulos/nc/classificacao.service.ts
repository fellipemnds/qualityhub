import { atribuicaoRepository } from "../../compartilhado/atribuicao/atribuicao.repository.js";
import { auditoriaRepository } from "../../compartilhado/auditoria/auditoria.repository.js";
import { EntidadeAuditada } from "../../compartilhado/auditoria/entidades-auditadas.js";
import { Papel } from "../../compartilhado/entidades/papeis.js";
import { NaoEncontradoError, SemPermissaoError, TransicaoInvalidaError } from "../../compartilhado/errors/errors.js";
import { temPapel } from "../../compartilhado/permissoes/pode-executar.js";
import { prisma } from "../../compartilhado/prisma/cliente.js";
import { cicloVidaService } from "../../compartilhado/registro/ciclo-vida.service.js";
import { registroRepository } from "../../compartilhado/registro/registro.repository.js";
import { classificacaoRepository } from "./classificacao.repository.js";
import { ClassificacaoRascunhoInput } from "./classificacao.schema.js";
import { ncRepository } from "./nc.repository.js";

export const classificacaoService = {
    async criarRascunhoClassificacao(ator: { id: string, papeis: Papel[] }, naoConformidadeId: string, dados: ClassificacaoRascunhoInput) {
        return prisma.$transaction(async (tx) => {
            const papel = temPapel(ator, "CLASSIFICAR");

            if (!papel) {
                throw new SemPermissaoError("Você não tem permissões suficientes para criar um novo rascunho.");
            }

            const nc = await ncRepository.buscarPorId(tx, naoConformidadeId);

            if (nc === null) {
                throw new NaoEncontradoError("A Não Conformidade não existe ou não foi encontrada");
            }

            const registro = await cicloVidaService.criarRascunho(tx, { tipo: "CLASSIFICACAO", criadoPorId: ator.id });

            const classificacao = await classificacaoRepository.criar(tx, { id: registro.id, naoConformidadeId, ...dados });

            await atribuicaoRepository.inserirAtribuicao(tx, registro.id, ator.id, ator.id, "COLABORADOR");

            return { ...registro, ...classificacao };
        })
    },

    async salvarRascunhoClassificacao(registroId: string, ator: { id: string, papeis: Papel[] }, dados: ClassificacaoRascunhoInput) {
        return prisma.$transaction(async (tx) => {
            const registro = await registroRepository.buscarPorId(tx, registroId);

            if (registro === null) {
                throw new NaoEncontradoError("Item não encontrado.");
            }

            if (registro.estado !== "RASCUNHO") {
                throw new TransicaoInvalidaError('O item precisa estar no status "Rascunho".')
            }

            const papel = temPapel(ator, "CLASSIFICAR");
            const atribuicao = await atribuicaoRepository.ehColaborador(tx, registroId, ator.id);

            if (!papel || !atribuicao) {
                throw new SemPermissaoError("Você não tem permissões suficientes para atualizar este rascunho.");
            }

            const classificacaoAntes = await classificacaoRepository.buscarPorId(tx, registroId);
            const classificacaoAtualizada = await classificacaoRepository.atualizar(tx, registroId, dados);

            await auditoriaRepository.registrar(tx, {
                entidade: EntidadeAuditada[registro.tipo],
                entidadeId: registro.id,
                acao: "SALVAR_RASCUNHO", 
                usuarioId: ator.id, 
                antes: classificacaoAntes,
                depois: classificacaoAtualizada
            })

            return classificacaoAtualizada;
        })
    },

    
}