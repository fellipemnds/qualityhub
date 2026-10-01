import type { ClientePrisma } from "../prisma/tipos.js";
import { sequenciaRepository } from "./sequencia.repository.js";

export const sequenciaService = {
    async proximoCodigo(tx: ClientePrisma, prefixo: string, ano: number): Promise<string> {
        const numero = await sequenciaRepository.proximoNumero(tx, prefixo, ano);

        return `${prefixo}-${ano}-${String(numero).padStart(4, "0")}`;
    },
};
