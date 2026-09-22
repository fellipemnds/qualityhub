import { atribuicaoRepository } from "../../compartilhado/atribuicao/atribuicao.repository.js";
import { auditoriaRepository } from "../../compartilhado/auditoria/auditoria.repository.js";
import { EntidadeAuditada } from "../../compartilhado/auditoria/entidades-auditadas.js";
import { EstadoRegistro } from "../../compartilhado/entidades/estados.js";
import { Papel } from "../../compartilhado/entidades/papeis.js";
import { NaoEncontradoError, SemPermissaoError, TransicaoInvalidaError } from "../../compartilhado/errors/errors.js";
import { temPapel } from "../../compartilhado/permissoes/pode-executar.js";
import { prisma } from "../../compartilhado/prisma/cliente.js";
import { cicloVidaService } from "../../compartilhado/registro/ciclo-vida.service.js";
import { ESTADOS_EDITAVEIS } from "../../compartilhado/registro/estados-editaveis.js";
import { registroRepository } from "../../compartilhado/registro/registro.repository.js";
import { verificacaoRepository } from "./verificacao.repository.js";
import { verificacaoConclusaoSchema, VerificacaoRascunhoInput } from "./verificacao.schema.js";

export const verificacaoService = {
    async atualizarVerificacao(registroId: string, ator: { id: string, papeis: Papel[] }, dados: VerificacaoRascunhoInput) {
        return prisma.$transaction(async (tx) => {
            const registro = await registroRepository.buscarPorId(tx, registroId);
            if (registro === null) throw new NaoEncontradoError("Item não encontrado.");
            if (!ESTADOS_EDITAVEIS.includes(registro.estado)) {
                throw new TransicaoInvalidaError('Este item não pode mais ser editado neste estado.');
            }

            const papel = temPapel(ator, "CONCLUIR_VERIFICACAO");
            const atribuicao = await atribuicaoRepository.ehColaborador(tx, registroId, ator.id);
            if (!papel || !atribuicao) {
                throw new SemPermissaoError("Você não tem permissões suficientes para atualizar este item.");
            }

            const antes = await verificacaoRepository.buscarPorId(tx, registroId);
            const atualizada = await verificacaoRepository.atualizar(tx, registroId, dados);

            await auditoriaRepository.registrar(tx, {
                entidade: EntidadeAuditada[registro.tipo],
                entidadeId: registro.id,
                acao: "SALVAR_RASCUNHO",
                usuarioId: ator.id,
                antes,
                depois: atualizada
            });

            return atualizada;
        });
    },

    // Sem portao (VERIFICACAO: [] no catalogo) — conclui direto, exige
    // colaborador com papel APROVADOR (analogo a RN-20, o Effectiveness
    // Check do ETQ Reliance exigia QA).
    async concluirVerificacao(registroId: string, ator: { id: string, papeis: Papel[] }) {
        return prisma.$transaction(async (tx) => {
            const verificacao = await verificacaoRepository.buscarPorId(tx, registroId);
            if (verificacao === null) throw new NaoEncontradoError("Item não encontrado.");

            const registroConcluido = await cicloVidaService.concluir(tx, registroId, ator, verificacao, (d) => verificacaoConclusaoSchema.parse(d));
            return { ...registroConcluido, ...verificacao };
        });
    },

    async excluirRascunhoVerificacao(registroId: string, ator: { id: string, papeis: Papel[] }) {
        return prisma.$transaction(async (tx) => {
            return cicloVidaService.excluirRascunho(tx, registroId, ator);
        });
    },

    async cancelarVerificacao(registroId: string, ator: { id: string, papeis: Papel[] }, motivo: string) {
        return prisma.$transaction(async (tx) => {
            const registroCancelado = await cicloVidaService.cancelar(tx, registroId, ator, motivo);
            const verificacao = await verificacaoRepository.buscarPorId(tx, registroId);
            return { ...registroCancelado, ...verificacao };
        });
    },

    async buscarPorIdVerificacao(registroId: string, ator: { id: string, papeis: Papel[] }) {
        const registro = await registroRepository.buscarPorId(prisma, registroId);
        if (registro === null) throw new NaoEncontradoError("Item não encontrado.");

        const papel = temPapel(ator, "VISUALIZAR");
        if (!papel) throw new SemPermissaoError("Você não tem permissões suficientes para visualizar.");

        const verificacao = await verificacaoRepository.buscarPorId(prisma, registroId);
        return { ...registro, ...verificacao };
    },

    async listarVerificacoes(ator: { id: string, papeis: Papel[] }, filtros: { acaoCorretivaId?: string, estado?: EstadoRegistro }) {
        const papel = temPapel(ator, "VISUALIZAR");
        if (!papel) throw new SemPermissaoError("Você não tem permissões suficientes para visualizar.");

        const registros = await verificacaoRepository.listar(prisma, filtros);
        return registros.map((item) => {
            const { registro, ...resto } = item;
            return { ...registro, ...resto };
        });
    }
}