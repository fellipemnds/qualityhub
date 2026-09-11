import { auditoriaRepository } from "../auditoria/auditoria.repository.js"
import { EntidadeAuditada } from "../auditoria/entidades-auditadas.js"
import { Papel } from "../entidades/papeis.js"
import { TipoRegistro } from "../entidades/tipos-registro.js"
import { NaoEncontradoError, SemPermissaoError, TransicaoInvalidaError, ValidacaoError } from "../errors/errors.js"
import { podeExecutar } from "../permissoes/pode-executar.js"
import { ClientePrisma } from "../prisma/tipos.js"
import { sequenciaService } from "../sequencia/sequencia.service.js"
import { prefixoPorTipo } from "./prefixos.js"
import { registroRepository } from "./registro.repository.js"

export const cicloVidaService = {
    async criarRascunho(tx: ClientePrisma, dados: {
        tipo: TipoRegistro,
        criadoPorId: string
    }) {
        const registro = await registroRepository.criar(tx, dados);
        await auditoriaRepository.registrar(tx, {
            entidade: EntidadeAuditada[registro.tipo],
            entidadeId: registro.id,
            acao: "CRIAR_RASCUNHO",
            usuarioId: registro.criadoPorId,
            antes: undefined,
            depois: registro
        });
        return registro;
    },

    async publicar(tx: ClientePrisma, registroId: string, ator: { id: string, papeis: Papel[] }, dados: unknown, validador: (dados: unknown) => unknown) {
        const registro = await registroRepository.buscarPorId(tx, registroId);

        if (registro === null) {
            throw new NaoEncontradoError("Item não encontrado");
        }

        if (registro.estado !== "RASCUNHO") {
            throw new TransicaoInvalidaError("Apenas itens em rascunho podem ser publicados!");
        }

        const podeEditar = await podeExecutar(tx, ator, "PUBLICAR", registroId);

        if (!podeEditar) {
            throw new SemPermissaoError("Você não pode realizar esta ação pois não está atribuido neste item.")
        }

        const dadoValidado = validador(dados);

        const prefixo = prefixoPorTipo[registro.tipo];
        const anoAtual = new Date().getFullYear();

        const codigo = await sequenciaService.proximoCodigo(tx, prefixo, anoAtual);

        const registroAtualizado = await registroRepository.atualizar(tx, registroId, { estado: "ABERTO", codigo });

        await auditoriaRepository.registrar(tx, {
            entidade: EntidadeAuditada[registro.tipo],
            entidadeId: registroAtualizado.id,
            acao: "PUBLICAR",
            usuarioId: ator.id,
            antes: registro,
            depois: registroAtualizado
        })

        return registroAtualizado
    }
}