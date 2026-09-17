import { prisma } from "../prisma/cliente.js"
import { Papel } from "../entidades/papeis.js"
import { atribuicaoRepository } from "./atribuicao.repository.js"
import { registroRepository } from "../registro/registro.repository.js"
import { temPapel } from "../permissoes/pode-executar.js"
import { NaoEncontradoError, SemPermissaoError, TransicaoInvalidaError, ValidacaoError } from "../errors/errors.js"
import { auditoriaRepository } from "../auditoria/auditoria.repository.js"
import { EntidadeAuditada } from "../auditoria/entidades-auditadas.js"
import { usuarioRepository } from "../../modulos/usuario/usuario.repository.js"

export const atribuicaoService = {
    async adicionarColaboradores(registroId: string, colaboradoresId: string[], ator: { id: string, papeis: Papel[] }) {
        return prisma.$transaction(async (tx) => {
            const registro = await registroRepository.buscarPorId(tx, registroId);

            if (registro === null) {
                throw new NaoEncontradoError("Item não encontrado.");
            }

            const papel = temPapel(ator, "GERENCIAR_COLABORADORES");

            if (!papel) {
                throw new SemPermissaoError("Você não tem permissões suficientes para incluir colaboradores.");
            }

            const colaboradoresExistentes = [];
            const colaboradoresNovos = [];
            for (const colaboradorId of colaboradoresId) {
                const colaboradorEsta = await atribuicaoRepository.ehColaborador(tx, registroId, colaboradorId);
                if (colaboradorEsta) {
                    colaboradoresExistentes.push(colaboradorId);
                }
                else {
                    colaboradoresNovos.push(colaboradorId);
                }
            }

            const colaboradoresAdicionados = [];
            for (const colaboradorId of colaboradoresNovos) {
                colaboradoresAdicionados.push(await atribuicaoRepository.inserirAtribuicao(tx, registroId, colaboradorId, ator.id, "COLABORADOR"));
            }

            await auditoriaRepository.registrar(tx, {
                entidade: EntidadeAuditada[registro.tipo],
                entidadeId: registro.id,
                acao: "ADICIONAR_COLABORADORES",
                usuarioId: ator.id,
                antes: undefined,
                depois: colaboradoresAdicionados
            })

            return { adicionados: colaboradoresAdicionados, jaEramColaboradores: colaboradoresExistentes };
        })
    },

    async removerColaboradores(registroId: string, colaboradoresId: string[], ator: { id: string, papeis: Papel[] }) {
        return prisma.$transaction(async (tx) => {
            const registro = await registroRepository.buscarPorId(tx, registroId);

            if (registro === null) {
                throw new NaoEncontradoError("Item não encontrado.");
            }

            const papel = temPapel(ator, "GERENCIAR_COLABORADORES");

            if (!papel) {
                throw new SemPermissaoError("Você não tem permissões suficientes para remover colaboradores.");
            }

            const colaboradoresRemoviveis = [];
            const naoSaoColaboradores = [];

            for (const colaboradorId of colaboradoresId) {
                const colaboradorEsta = await atribuicaoRepository.ehColaborador(tx, registroId, colaboradorId);
                if (colaboradorEsta) {
                    colaboradoresRemoviveis.push(colaboradorId);
                }
                else {
                    naoSaoColaboradores.push(colaboradorId);
                }
            }

            const contagemColaboradores = await atribuicaoRepository.contarColaboradores(tx, registroId);

            if (contagemColaboradores - colaboradoresRemoviveis.length <= 0) {
                throw new TransicaoInvalidaError("A atribuição dos colaboradores não pode estar vazia!")
            }

            const colaboradoresRemovidos = [];
            for (const colaboradorId of colaboradoresRemoviveis) {
                colaboradoresRemovidos.push(await atribuicaoRepository.removerAtribuicao(tx, registroId, colaboradorId, "COLABORADOR"));
            }

            await auditoriaRepository.registrar(tx, {
                entidade: EntidadeAuditada[registro.tipo],
                entidadeId: registro.id,
                acao: "REMOVER_COLABORADOR",
                usuarioId: ator.id,
                antes: colaboradoresRemovidos,
                depois: undefined
            })

            return { removidos: colaboradoresRemovidos, naoEramColaboradores: naoSaoColaboradores };
        })
    },

    async definirAprovador(registroId: string, aprovadorId: string, ator: { id: string, papeis: Papel[] }) {
        return prisma.$transaction(async (tx) => {
            const registro = await registroRepository.buscarPorId(tx, registroId);

            if (registro === null) {
                throw new NaoEncontradoError("Item não encontrado.");
            }

            const dadosAprovador = await usuarioRepository.buscarPorId(tx, aprovadorId);

            if (dadosAprovador === null) {
                throw new NaoEncontradoError("O usuário a ser atribuido não foi encontrado");
            }

            const temPapelAprovador = dadosAprovador.papeisRecebidos.some(
                (usuarioPapel) => usuarioPapel.papel === "APROVADOR"
            );

            if (!temPapelAprovador) {
                throw new ValidacaoError('Este usuário não pode ser atribuído pois não tem o papel "APROVADOR".')
            }

            const papelAtor = temPapel(ator, "DEFINIR_APROVADOR");

            if (!papelAtor) {
                throw new SemPermissaoError("Você não tem permissões suficientes para gerenciar aprovadores.");
            }

            const aprovadorAtual = await atribuicaoRepository.buscarAprovador(tx, registroId);
            let aprovadorAntigo;
            if (aprovadorAtual !== null) {
                aprovadorAntigo = await atribuicaoRepository.removerAtribuicao(tx, registroId, aprovadorAtual.usuarioId, "APROVADOR");
            }

            const novoAprovador = await atribuicaoRepository.inserirAtribuicao(tx, registroId, aprovadorId, ator.id, "APROVADOR");

            await auditoriaRepository.registrar(tx, {
                entidade: EntidadeAuditada[registro.tipo],
                entidadeId: registro.id,
                acao: "DEFINIR_APROVADOR",
                usuarioId: ator.id,
                antes: aprovadorAntigo,
                depois: novoAprovador
            });

            return novoAprovador;
        })
    }
}