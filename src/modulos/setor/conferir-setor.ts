import { NaoEncontradoError, TransicaoInvalidaError } from "../../compartilhado/errors/errors.js";
import type { ClientePrisma } from "../../compartilhado/prisma/tipos.js";
import { setorRepository } from "./setor.repository.js";

// Confere o setor de uma escolha, num lugar só, para a NC e a pessoa. Inexistente é erro do pedido (404), não do
// servidor: sem a conferência, a chave estrangeira do banco recusava e a resposta era 500 (auditoria L6, como o B16).
// Desativado não entra em escolha nova (RN-44); mandar o setor que o item já tem não é escolha nova, e passa (quem
// reenvia o formulário inteiro não é recusado). Sem setorId no pedido, nada a conferir
export async function conferirSetor(tx: ClientePrisma, setorId: number | undefined, setorAtual?: number) {
    if (setorId === undefined || setorId === setorAtual) return;

    const setor = await setorRepository.buscarPorId(tx, setorId);
    if (setor === null) {
        throw new NaoEncontradoError("O setor não existe ou não foi encontrado.");
    }
    if (setor.desativadoEm !== null) {
        throw new TransicaoInvalidaError("Este setor está desativado: escolha outro.");
    }
}
