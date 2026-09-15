import { atribuicaoRepository } from "../../compartilhado/atribuicao/atribuicao.repository.js"
import { Papel } from "../../compartilhado/entidades/papeis.js"
import { SemPermissaoError } from "../../compartilhado/errors/errors.js"
import { temPapel } from "../../compartilhado/permissoes/pode-executar.js"
import { ClientePrisma } from "../../compartilhado/prisma/tipos.js"
import { cicloVidaService } from "../../compartilhado/registro/ciclo-vida.service.js"
import { ncRepository } from "./nc.repository.js"
import { NCRascunhoInput } from "./nc.schema.js"

export const ncService = {
    async criarRascunhoNC(tx: ClientePrisma, ator: { id: string, papeis: Papel[]}, dados: NCRascunhoInput) {
        const papel = temPapel(ator, "GERENCIAR_RASCUNHO");

        if(!papel) {
            throw new SemPermissaoError("Você não tem permissões suficientes para criar um novo rascunho.")
        }

        const registro = await cicloVidaService.criarRascunho(tx, { tipo: "NAO_CONFORMIDADE", criadoPorId: ator.id});

        const nc = await ncRepository.criar(tx, { id: registro.id, ...dados});

        await atribuicaoRepository.adicionarColaboradores(tx, registro.id, [ator.id], ator.id);

        return {...registro, ...nc};
    }
}