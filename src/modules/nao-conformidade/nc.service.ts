import { ncRepository } from "./nc.repository.js"
import type { OrigemNC } from "../../generated/prisma/client.js"
import { NaoEncontradoError, ValidacaoError } from "../../lib/errors.js";

export type DadosNC = {
    titulo: string;
    descricao: string;
    requisitoViolado: string;
    dataOcorrencia: Date;
    origem: OrigemNC;
    cliente?: string;
    setorId: number;
}

export const ncService = {
    async gerarNumero() {
        const anoAtual = new Date().getFullYear();
        const total = await ncRepository.contarNoAno(anoAtual);
        const proximo = total + 1;
        const sequencial = String(proximo).padStart(3, "0");

        return `NC-${anoAtual}-${sequencial}`;

    },

    async buscarPorId(id: number) {
        const nc = await ncRepository.buscarPorId(id);

        if (!nc) {
            throw new NaoEncontradoError("Nenhuma NC com este ID foi encontrada");
        }

        return nc;
    },

    async criar(dados: DadosNC) {
        if (dados.origem === "RECLAMACAO_CLIENTE" && !dados.cliente) {
            throw new ValidacaoError("Cliente não informado!");
        }

        const numero = await this.gerarNumero();

        const { setorId, ...info } = dados;

        const nc = await ncRepository.criar({
            ...info,
            numero,
            setor: { connect: { id: setorId } }
        });

        return nc;
    },

    async listar() {
        return ncRepository.listar();
    }
}