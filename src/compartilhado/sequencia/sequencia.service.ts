import type { ClientePrisma } from "../prisma/tipos.js";
import { sequenciaRepository } from "./sequencia.repository.js";

export const sequenciaService = {
    async proximoCodigo(tx: ClientePrisma, prefixo: string, ano: number): Promise<string> {
        const numeroAtual = await sequenciaRepository.buscarELocar(tx, prefixo, ano);

        const novoNumero =
            numeroAtual !== undefined
                ? await sequenciaRepository.incrementar(tx, prefixo, ano)
                : await sequenciaRepository.criar(tx, prefixo, ano);

        const codigo = `${prefixo}-${ano}-${String(novoNumero.ultimoNumero).padStart(4, "0")}`;

        return codigo;
    },
};
