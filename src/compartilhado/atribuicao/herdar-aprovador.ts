import type { ClientePrisma } from "../prisma/tipos.js";
import { atribuicaoRepository } from "./atribuicao.repository.js";

// O filho nasce com o aprovador da NC, se ela já tiver um (B13, RN-46): sem isso, o colaborador fica travado na hora
// de enviar, e só APROVADOR/GERENTE pode destravar. Quem pode definir aprovador continua podendo trocá-lo depois
export async function herdarAprovadorDaNC(
    tx: ClientePrisma,
    naoConformidadeId: string,
    filhoId: string,
    atribuidoPorId: string,
) {
    const aprovadorDaNC = await atribuicaoRepository.buscarAprovador(tx, naoConformidadeId);
    if (aprovadorDaNC !== null) {
        await atribuicaoRepository.inserirAtribuicao(tx, filhoId, aprovadorDaNC.usuarioId, atribuidoPorId, "APROVADOR");
    }
}
