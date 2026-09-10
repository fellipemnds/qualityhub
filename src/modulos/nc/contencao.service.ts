import { ValidacaoError } from "../../compartilhado/errors/errors.js";
import { ncService } from "../nc/nc.service.js"
import { contencaoRepository } from "./contencao.repository.js"
import { CriarContencaoInput } from "./contencao.schema.js";
import { prisma } from "../../lib/prisma.js";
import { Entidades } from "../../lib/entidades.js";
import { AcoesAuditoria } from "../../compartilhado/acoes/acoes.js";

type RegistrarContencaoInput = CriarContencaoInput & {
    naoConformidadeId: number;
    autorId: number;
}

export const contencaoService = {
    async registrarContencao(dados: RegistrarContencaoInput) {
        const nc = await ncService.buscarPorId(dados.naoConformidadeId);

        if (nc.estado !== "ANALISE" && nc.estado !== "CONTENCAO") {
            throw new ValidacaoError('Esta NC não pode ter uma contenção registrada fora dos status "Análise" ou "Contenção"');
        }

        const responsavelId = dados.responsavelId ?? dados.autorId;

        await prisma.$transaction(async (tx) => {
            const contencao = await tx.contencao.create({
                data: {
                    descricao: dados.descricao,
                    prazo: dados.prazo,
                    naoConformidade: { connect: { id: dados.naoConformidadeId } },
                    responsavel: { connect: { id: responsavelId } },
                }
            });

            await tx.trilhaAuditoria.create({
                data: {
                    entidade: Entidades.CONTENCAO,
                    entidadeId: contencao.id,
                    acao: AcoesAuditoria.CONTENCAO_CRIADA,
                    usuario: { connect: { id: dados.autorId } }
                }
            });

            if (nc.estado !== "CONTENCAO") {
                const novoEstado = "CONTENCAO";

                await tx.naoConformidade.update({
                    where: { id: contencao.naoConformidadeId },
                    data: { estado: novoEstado },
                });

                await tx.trilhaAuditoria.create({
                    data: {
                        entidade: Entidades.NAO_CONFORMIDADE,
                        entidadeId: contencao.naoConformidadeId,
                        acao: AcoesAuditoria.EM_CONTENCAO,
                        campo: "estado",
                        valorAnterior: nc.estado,
                        valorNovo: novoEstado,
                        usuario: { connect: { id: dados.autorId } }
                    }
                });
            }
        })

    }
}