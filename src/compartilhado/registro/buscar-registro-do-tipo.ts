import type { TipoRegistro } from "../entidades/tipos-registro.js";
import { NaoEncontradoError } from "../errors/errors.js";
import type { ClientePrisma } from "../prisma/tipos.js";
import { registroRepository } from "./registro.repository.js";

type Registro = NonNullable<Awaited<ReturnType<typeof registroRepository.buscarPorId>>>;

// Os tipos dividem o Registro, e o id sozinho não diz o tipo: item de outro tipo responde como inexistente (B23)
export async function buscarRegistroDoTipoOuFalhar(
    tx: ClientePrisma,
    registroId: string,
    tipo: TipoRegistro,
): Promise<Registro> {
    const registro = await registroRepository.buscarPorId(tx, registroId);

    if (registro === null || registro.tipo !== tipo) {
        throw new NaoEncontradoError("Item não encontrado.");
    }

    return registro;
}
