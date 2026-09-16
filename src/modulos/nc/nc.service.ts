import { prisma } from "../../compartilhado/prisma/cliente.js"
import { atribuicaoRepository } from "../../compartilhado/atribuicao/atribuicao.repository.js"
import { Papel } from "../../compartilhado/entidades/papeis.js"
import { NaoEncontradoError, SemPermissaoError, TransicaoInvalidaError } from "../../compartilhado/errors/errors.js"
import { temPapel } from "../../compartilhado/permissoes/pode-executar.js"
import { cicloVidaService } from "../../compartilhado/registro/ciclo-vida.service.js"
import { ncRepository } from "./nc.repository.js"
import { ncPublicacaoSchema, NCRascunhoInput } from "./nc.schema.js"
import { DecisaoInput } from "../../compartilhado/registro/decidir.schema.js"
import { registroRepository } from "../../compartilhado/registro/registro.repository.js"

export const ncService = {
    async criarRascunhoNC(ator: { id: string, papeis: Papel[] }, dados: NCRascunhoInput) {
        return prisma.$transaction(async (tx) => {
            const papel = temPapel(ator, "GERENCIAR_RASCUNHO");

            if (!papel) {
                throw new SemPermissaoError("Você não tem permissões suficientes para criar um novo rascunho.");
            }

            const registro = await cicloVidaService.criarRascunho(tx, { tipo: "NAO_CONFORMIDADE", criadoPorId: ator.id });

            const nc = await ncRepository.criar(tx, { id: registro.id, ...dados });

            await atribuicaoRepository.adicionarColaboradores(tx, registro.id, [ator.id], ator.id);

            return { ...registro, ...nc };
        })
    },

    async salvarRascunhoNC(registroId: string, ator: { id: string, papeis: Papel[] }, dados: NCRascunhoInput) {
        return prisma.$transaction(async (tx) => {
            const registro = await registroRepository.buscarPorId(tx, registroId);

            if (registro === null) {
                throw new NaoEncontradoError("Item não encontrado.");
            }

            if (registro.estado !== "RASCUNHO") {
                throw new TransicaoInvalidaError('O item precisa estar no status "Rascunho".')
            }

            const papel = temPapel(ator, "GERENCIAR_RASCUNHO");
            const atribuicao = await atribuicaoRepository.ehColaborador(tx, registroId, ator.id);

            if (!papel || !atribuicao) {
                throw new SemPermissaoError("Você não tem permissões suficientes para atualizar este rascunho.");
            }

            const ncAtualizada = await ncRepository.atualizar(tx, registroId, dados);

            return ncAtualizada;
        })
    },

    async excluirRascunhoNC(registroId: string, ator: { id: string, papeis: Papel[] }) {
        return prisma.$transaction(async (tx) => {
            const registroExcluido = await cicloVidaService.excluirRascunho(tx, registroId, ator);

            return registroExcluido;
        })
    },

    async publicarNC(registroId: string, ator: { id: string, papeis: Papel[] }) {
        return prisma.$transaction(async (tx) => {
            const nc = await ncRepository.buscarPorId(tx, registroId);

            if (nc === null) {
                throw new NaoEncontradoError("Item não encontrado.");
            }

            const registroPublicado = await cicloVidaService.publicar(tx, registroId, ator, nc, (dadosParaValidar) => ncPublicacaoSchema.parse(dadosParaValidar));

            return { ...registroPublicado, ...nc };
        })
    },

    async submeterNC(registroId: string, ator: { id: string, papeis: Papel[] }) {
        return prisma.$transaction(async (tx) => {
            const nc = await ncRepository.buscarPorId(tx, registroId);

            if (nc === null) {
                throw new NaoEncontradoError("Item não encontrado.");
            }

            const registroSubmetido = await cicloVidaService.submeter(tx, registroId, ator, nc, (dadosParaValidar) => ncPublicacaoSchema.parse(dadosParaValidar));

            return { ...registroSubmetido, ...nc };
        })
    },

    async decidirNC(registroId: string, ator: { id: string, papeis: Papel[] }, dados: DecisaoInput) {
        return prisma.$transaction(async (tx) => {
            const registroDecidido = await cicloVidaService.decidir(tx, registroId, ator, dados);
            const nc = await ncRepository.buscarPorId(tx, registroId);

            return { ...registroDecidido, ...nc };
        })
    },

    async reabrirNC(registroId: string, ator: { id: string, papeis: Papel[] }, motivo: string) {
        return prisma.$transaction(async (tx) => {
            const registroReaberto = await cicloVidaService.reabrir(tx, registroId, ator, motivo);
            const nc = await ncRepository.buscarPorId(tx, registroId);

            return { ...registroReaberto, ...nc };
        })
    },

    async cancelarNC(registroId: string, ator: { id: string, papeis: Papel[] }, motivo: string) {
        return prisma.$transaction(async (tx) => {
            const registroCancelado = await cicloVidaService.cancelar(tx, registroId, ator, motivo);
            const nc = await ncRepository.buscarPorId(tx, registroId);

            return { ...registroCancelado, ...nc };
        })
    },

    async buscarPorIdNC(registroId: string, ator: { id: string, papeis: Papel[] }) {
        const registro = await registroRepository.buscarPorId(prisma, registroId);

        if (registro === null) {
            throw new NaoEncontradoError("Item não encontrado.")
        }

        const nc = await ncRepository.buscarPorId(prisma, registroId);

        const papel = temPapel(ator, "VISUALIZAR");

        if (!papel) {
            throw new SemPermissaoError("Você não tem permissões suficientes para visualizar.");
        }

        return { ...registro, ...nc };
    },

    async listarNC(ator: { id: string, papeis: Papel[] }) {
        const papel = temPapel(ator, "VISUALIZAR");

        if (!papel) {
            throw new SemPermissaoError("Você não tem permissões suficientes para visualizar.");
        }

        const registros = await registroRepository.listar(prisma, { tipo: "NAO_CONFORMIDADE" });

        const ncCompleta = registros.map((item) => {
            const { naoConformidade, ...resto } = item;
            return { ...naoConformidade, ...resto };
        });

        return ncCompleta;
    }
}