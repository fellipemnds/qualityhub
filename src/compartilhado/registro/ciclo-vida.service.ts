import { Registro } from "../../generated/prisma/client.js"
import { auditoriaRepository } from "../auditoria/auditoria.repository.js"
import { EntidadeAuditada } from "../auditoria/entidades-auditadas.js"
import { TipoRegistro } from "../entidades/tipos-registro.js"
import { ValidacaoError } from "../errors/errors.js"
import { podeExecutar } from "../permissoes/pode-executar.js"
import { ClientePrisma } from "../prisma/tipos.js"
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

    async publicar(tx: ClientePrisma, registro: Registro) {
        if (registro.estado !== "RASCUNHO") {
            throw new ValidacaoError('Somente itens em "Rascunho" podem ser publicados!')
        }

        podeExecutar()
    }
}