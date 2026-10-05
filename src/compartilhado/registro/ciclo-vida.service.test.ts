import { describe, expect, it } from "vitest";
import { app } from "../../app.js";
import { chamar, diaDaquiA } from "../../testes/cenarios.js";
import { loginComo } from "../../testes/fabricas.js";
import { levarAcaoCorretivaAte } from "../../testes/levar-ate/acao-corretiva.js";
import { levarContencaoAte } from "../../testes/levar-ate/contencao.js";
import { levarNCAte } from "../../testes/levar-ate/nc.js";
import { levarVerificacaoAte } from "../../testes/levar-ate/verificacao.js";
import { prisma } from "../prisma/cliente.js";

// Testes de caracterização: fotografam o que o ciclo de vida faz hoje, antes de ele ser simplificado (A4). A
// refatoração não pode mudar nada do que está aqui. A contenção é o veículo, como no teste da RN-48; a NC, a ação
// corretiva e a verificação entram só nas transições que são delas

const ID_INEXISTENTE = "00000000-0000-0000-0000-000000000000";

type Quem = Awaited<ReturnType<typeof loginComo>>;

const transicoes: {
    nome: string;
    agir: () => Promise<{ id: string; quem: Quem }>;
    esperado: { entidade: string; acao: string; de: string; para: string };
}[] = [
    {
        nome: "publicar",
        agir: async () => {
            const { editor, contencao } = await levarContencaoAte("RASCUNHO");
            await chamar(editor, "POST", `/contencoes/${contencao.id}/publicar`, 200);
            return { id: contencao.id, quem: editor };
        },
        esperado: { entidade: "CONTENCAO", acao: "PUBLICAR", de: "RASCUNHO", para: "ABERTO" },
    },
    {
        nome: "submeter",
        agir: async () => {
            const { editor, contencao } = await levarContencaoAte("ABERTO");
            await chamar(editor, "PATCH", `/contencoes/${contencao.id}`, 200, {
                executadaEm: diaDaquiA(-1),
                disposicao: "CORRIGIDO",
            });
            await chamar(editor, "POST", `/contencoes/${contencao.id}/submeter`, 200);
            return { id: contencao.id, quem: editor };
        },
        esperado: { entidade: "CONTENCAO", acao: "SUBMETER", de: "ABERTO", para: "EM_APROVACAO" },
    },
    {
        nome: "retirar",
        agir: async () => {
            const { editor, contencao } = await levarContencaoAte("EM_APROVACAO");
            await chamar(editor, "POST", `/contencoes/${contencao.id}/retirar`, 200);
            return { id: contencao.id, quem: editor };
        },
        esperado: { entidade: "CONTENCAO", acao: "RETIRAR_DA_APROVACAO", de: "EM_APROVACAO", para: "ABERTO" },
    },
    {
        nome: "decidir aprovando (fecha)",
        agir: async () => {
            const { aprovador, contencao } = await levarContencaoAte("EM_APROVACAO");
            await chamar(aprovador, "POST", `/contencoes/${contencao.id}/decidir`, 200, { decisao: "APROVADO" });
            return { id: contencao.id, quem: aprovador };
        },
        esperado: { entidade: "CONTENCAO", acao: "APROVADO", de: "EM_APROVACAO", para: "FECHADO" },
    },
    {
        nome: "decidir reprovando",
        agir: async () => {
            const { aprovador, contencao } = await levarContencaoAte("EM_APROVACAO");
            await chamar(aprovador, "POST", `/contencoes/${contencao.id}/decidir`, 200, {
                decisao: "REPROVADO",
                motivo: "Disposição não condiz com o que foi feito na linha.",
            });
            return { id: contencao.id, quem: aprovador };
        },
        esperado: { entidade: "CONTENCAO", acao: "REPROVADO", de: "EM_APROVACAO", para: "ABERTO" },
    },
    {
        // fecharAoAprovar: false: aprovar o plano devolve a ação a ABERTO
        nome: "decidir aprovando sem fechar (plano da ação corretiva)",
        agir: async () => {
            const { aprovador, acao } = await levarAcaoCorretivaAte("EM_APROVACAO");
            await chamar(aprovador, "POST", `/acoes-corretivas/${acao.id}/decidir`, 200, { decisao: "APROVADO" });
            return { id: acao.id, quem: aprovador };
        },
        esperado: { entidade: "ACAO_CORRETIVA", acao: "APROVADO", de: "EM_APROVACAO", para: "ABERTO" },
    },
    {
        nome: "concluir",
        agir: async () => {
            const { aprovador, verificacao } = await levarVerificacaoAte("ABERTO");
            await chamar(aprovador, "PATCH", `/verificacoes/${verificacao.id}`, 200, {
                resultado: "EFICAZ",
                conclusao: "Verificação feita na linha 2 depois do prazo, conforme as instruções do plano.",
                verificadoEm: diaDaquiA(0),
            });
            await chamar(aprovador, "POST", `/verificacoes/${verificacao.id}/concluir`, 200);
            return { id: verificacao.id, quem: aprovador };
        },
        esperado: { entidade: "VERIFICACAO", acao: "CONCLUIR_VERIFICACAO", de: "ABERTO", para: "FECHADO" },
    },
    {
        nome: "reabrir",
        agir: async () => {
            const { aprovador, nc } = await levarNCAte("FECHADO");
            await chamar(aprovador, "POST", `/nc/${nc.id}/reabrir`, 200, { motivo: "Reclamação nova do cliente." });
            return { id: nc.id, quem: aprovador };
        },
        esperado: { entidade: "NAO_CONFORMIDADE", acao: "REABRIR", de: "FECHADO", para: "ABERTO" },
    },
    {
        nome: "cancelar",
        agir: async () => {
            const { aprovador, contencao } = await levarContencaoAte("ABERTO");
            await chamar(aprovador, "POST", `/contencoes/${contencao.id}/cancelar`, 200, {
                motivo: "Contenção registrada em duplicidade.",
            });
            return { id: contencao.id, quem: aprovador };
        },
        esperado: { entidade: "CONTENCAO", acao: "CANCELAR", de: "ABERTO", para: "CANCELADO" },
    },
];

describe("Ciclo de vida: auditoria de cada transição", () => {
    it.each(transicoes)(
        "$nome grava $esperado.acao, de $esperado.de para $esperado.para",
        async ({ agir, esperado }) => {
            // Prepara e chama
            const { id, quem } = await agir();

            // Confere: uma linha só, com quem fez e o estado de antes e de depois
            expect(await prisma.auditoria.findMany({ where: { entidadeId: id, acao: esperado.acao } })).toMatchObject([
                {
                    entidade: esperado.entidade,
                    usuarioId: quem.usuario.id,
                    antes: { estado: esperado.de },
                    depois: { estado: esperado.para },
                },
            ]);
        },
    );

    it("excluir rascunho grava EXCLUIR_RASCUNHO com o antes e sem o depois", async () => {
        // Prepara
        const { editor, contencao } = await levarContencaoAte("RASCUNHO");

        // Chama
        await chamar(editor, "DELETE", `/contencoes/${contencao.id}`, 204);

        // Confere: o item sumiu, mas a auditoria guarda que ele existiu (RN-09)
        expect(
            await prisma.auditoria.findMany({ where: { entidadeId: contencao.id, acao: "EXCLUIR_RASCUNHO" } }),
        ).toMatchObject([{ usuarioId: editor.usuario.id, antes: { estado: "RASCUNHO" }, depois: null }]);
    });
});

// B19 (esquema-backend.md §7): a mesma transição duas vezes ao mesmo tempo. As duas leem o mesmo estado; sem a trava,
// as duas passam. Cada linha prepara o item e diz qual rota chamar; o teste chama duas vezes de uma vez
const transicoesSimultaneas: {
    nome: string;
    preparar: () => Promise<{ id: string; quem: Quem; url: string; metodo?: "POST" | "DELETE"; body?: object }>;
    acao: string;
    status?: number;
}[] = [
    {
        nome: "publicar",
        preparar: async () => {
            const { editor, contencao } = await levarContencaoAte("RASCUNHO");
            return { id: contencao.id, quem: editor, url: `/contencoes/${contencao.id}/publicar` };
        },
        acao: "PUBLICAR",
    },
    {
        nome: "submeter",
        preparar: async () => {
            const { editor, contencao } = await levarContencaoAte("ABERTO");
            await chamar(editor, "PATCH", `/contencoes/${contencao.id}`, 200, {
                executadaEm: diaDaquiA(-1),
                disposicao: "CORRIGIDO",
            });
            return { id: contencao.id, quem: editor, url: `/contencoes/${contencao.id}/submeter` };
        },
        acao: "SUBMETER",
    },
    {
        nome: "retirar",
        preparar: async () => {
            const { editor, contencao } = await levarContencaoAte("EM_APROVACAO");
            return { id: contencao.id, quem: editor, url: `/contencoes/${contencao.id}/retirar` };
        },
        acao: "RETIRAR_DA_APROVACAO",
    },
    {
        nome: "decidir",
        preparar: async () => {
            const { aprovador, contencao } = await levarContencaoAte("EM_APROVACAO");
            return {
                id: contencao.id,
                quem: aprovador,
                url: `/contencoes/${contencao.id}/decidir`,
                body: { decisao: "APROVADO" },
            };
        },
        acao: "APROVADO",
    },
    {
        nome: "concluir",
        preparar: async () => {
            const { aprovador, verificacao } = await levarVerificacaoAte("ABERTO");
            await chamar(aprovador, "PATCH", `/verificacoes/${verificacao.id}`, 200, {
                resultado: "EFICAZ",
                conclusao: "Verificação feita na linha 2 depois do prazo, conforme as instruções do plano.",
                verificadoEm: diaDaquiA(0),
            });
            return { id: verificacao.id, quem: aprovador, url: `/verificacoes/${verificacao.id}/concluir` };
        },
        acao: "CONCLUIR_VERIFICACAO",
    },
    {
        nome: "reabrir",
        preparar: async () => {
            const { aprovador, nc } = await levarNCAte("FECHADO");
            return {
                id: nc.id,
                quem: aprovador,
                url: `/nc/${nc.id}/reabrir`,
                body: { motivo: "Reclamação nova do cliente." },
            };
        },
        acao: "REABRIR",
    },
    {
        nome: "cancelar",
        preparar: async () => {
            const { aprovador, contencao } = await levarContencaoAte("ABERTO");
            return {
                id: contencao.id,
                quem: aprovador,
                url: `/contencoes/${contencao.id}/cancelar`,
                body: { motivo: "Contenção registrada em duplicidade." },
            };
        },
        acao: "CANCELAR",
    },
    {
        nome: "excluir rascunho",
        preparar: async () => {
            const { editor, contencao } = await levarContencaoAte("RASCUNHO");
            return { id: contencao.id, quem: editor, url: `/contencoes/${contencao.id}`, metodo: "DELETE" };
        },
        acao: "EXCLUIR_RASCUNHO",
        status: 204,
    },
];

describe("Ciclo de vida: a mesma transição duas vezes ao mesmo tempo (B19)", () => {
    it.each(transicoesSimultaneas)("$nome: uma passa, a outra recebe 409", async ({ preparar, acao, status = 200 }) => {
        // Prepara
        const { id, quem, url, metodo = "POST", body } = await preparar();

        // Chama: as duas de uma vez, sem o chamar, porque não dá para saber qual chega primeiro
        const transicionar = () => app.inject({ method: metodo, url, headers: quem.autenticacao, body });
        const respostas = await Promise.all([transicionar(), transicionar()]);

        // Confere: uma resposta de sucesso, um 409, e a transição gravada uma vez só
        expect(respostas.map((r) => r.statusCode).sort()).toEqual([status, 409]);
        expect(await prisma.auditoria.count({ where: { entidadeId: id, acao } })).toBe(1);
    });
});

// Só as transições cujo 404 vem do ciclo de vida: no publicar, no submeter e no concluir, o service do tipo busca o
// item antes e já responde
const rotasDeItemInexistente: { nome: string; metodo: "POST" | "DELETE"; url: string; body?: object }[] = [
    { nome: "excluir", metodo: "DELETE", url: `/contencoes/${ID_INEXISTENTE}` },
    { nome: "retirar", metodo: "POST", url: `/contencoes/${ID_INEXISTENTE}/retirar` },
    { nome: "decidir", metodo: "POST", url: `/contencoes/${ID_INEXISTENTE}/decidir`, body: { decisao: "APROVADO" } },
    { nome: "cancelar", metodo: "POST", url: `/contencoes/${ID_INEXISTENTE}/cancelar`, body: { motivo: "Teste." } },
    { nome: "reabrir", metodo: "POST", url: `/nc/${ID_INEXISTENTE}/reabrir`, body: { motivo: "Teste." } },
];

describe("Ciclo de vida: item inexistente", () => {
    it.each(rotasDeItemInexistente)('$nome responde 404 com "Item não encontrado."', async ({ metodo, url, body }) => {
        // Prepara
        const gerente = await loginComo("gerente");

        // Chama
        const resposta = await chamar(gerente, metodo, url, 404, body);

        // Confere: a mesma mensagem em todas as transições (eram três textos diferentes)
        expect(resposta).toEqual({ mensagem: "Item não encontrado." });
    });
});
