import { NaoEncontradoError } from "../../compartilhado/errors/errors.js";
import type { ClientePrisma } from "../../compartilhado/prisma/tipos.js";
import { setorRepository } from "./setor.repository.js";

// Setor inexistente é erro do pedido (404), não do servidor: sem a conferência, a chave estrangeira do banco recusava e
// a resposta era 500 (auditoria L6, como o B16). Num lugar só, para a NC e o usuário; sem setorId no pedido, nada a
// conferir
export async function conferirSetor(tx: ClientePrisma, setorId: number | undefined) {
    if (setorId === undefined) return;

    const setor = await setorRepository.buscarPorId(tx, setorId);
    if (setor === null) {
        throw new NaoEncontradoError("O setor não existe ou não foi encontrado.");
    }
}
