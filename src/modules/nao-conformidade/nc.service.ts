import { ncRepository } from "./nc.repository.js"
import { NaoEncontradoError, SemPermissaoError, ValidacaoError } from "../../lib/errors.js";
import { CriarNCInput } from "./nc.schema.js";
import { podeClassificar } from "../../lib/permissoes.js";
import { ClassificacaoNC, PerfilUsuario } from "../../generated/prisma/enums.js";
import { prisma } from "../../lib/prisma.js";
import { connect } from "node:http2";
import { id } from "zod/locales";
import { Entidades } from "../../lib/entidades.js";
import { AcoesAuditoria } from "../../lib/acoes.js";

type ClassificarNCInput = {
    id: number;
    classificacao: ClassificacaoNC;
    autorId: number;
    perfilAutor: PerfilUsuario;
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

    async criar(dados: CriarNCInput) {
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
    },

    async classificar(dados: ClassificarNCInput) {
        if (!podeClassificar(dados.perfilAutor)) {
            throw new SemPermissaoError();
        }

        const nc = await this.buscarPorId(dados.id);

        if (nc.estado !== "ABERTA") {
            throw new ValidacaoError('Esta NC não pode ser classificada pois não está no status "Aberto"');
        }

        await prisma.$transaction(async (tx) => {
            const novoEstado = "ANALISE";

            await tx.naoConformidade.update({
                where: { id: dados.id },
                data: {
                    classificacao: dados.classificacao,
                    estado: novoEstado
                },
            });

            await tx.aprovacao.create({
                data: {
                    portao: "CLASSIFICACAO",
                    autoaprovacao: false,
                    naoConformidade: { connect: { id: dados.id } },
                    aprovador: { connect: { id: dados.autorId } }
                }
            });

            await tx.trilhaAuditoria.create({
                data: {
                    entidade: Entidades.NAO_CONFORMIDADE,
                    entidadeId: dados.id,
                    acao: AcoesAuditoria.NC_CLASSIFICADA,
                    campo: "classificacao",
                    valorAnterior: null,
                    valorNovo: dados.classificacao,
                    usuario: { connect: { id: dados.autorId } }
                }
            });

            await tx.trilhaAuditoria.create({
                data: {
                    entidade: Entidades.NAO_CONFORMIDADE,
                    entidadeId: dados.id,
                    acao: AcoesAuditoria.NC_CLASSIFICADA,
                    campo: "estado",
                    valorAnterior: nc.estado,
                    valorNovo: novoEstado,
                    usuario: { connect: { id: dados.autorId } }
                }
            });
        })
    }
}