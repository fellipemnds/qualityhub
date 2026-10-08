import { describe, expect, it } from "vitest";
import { type Cenario, chamar, ncPublicada, perfisDeFora } from "../../testes/cenarios.js";
import { levarContencaoAte } from "../../testes/levar-ate/contencao.js";
import { prisma } from "../prisma/cliente.js";

const ID_INEXISTENTE = "00000000-0000-0000-0000-000000000000";

// Não há rota que liste as atribuições: a conferência lê a tabela (o cenário continua montado pela API)
async function aprovadoresDe(registroId: string) {
    const atribuicoes = await prisma.atribuicao.findMany({ where: { registroId, funcao: "APROVADOR" } });
    return atribuicoes.map((atribuicao) => atribuicao.usuarioId);
}

describe("PUT /registros/:id/aprovador", () => {
    it("o gerente define o aprovador", async () => {
        // Prepara (o ncPublicada já define o aprovador pelo gerente)
        const { aprovador, nc } = await ncPublicada();

        // Confere
        expect(await aprovadoresDe(nc.id)).toEqual([aprovador.usuario.id]);
    });

    it("devolve a atribuição gravada, e só ela", async () => {
        // Prepara
        const { gerente, qa, nc } = await ncPublicada();

        // Chama
        const resposta = await chamar(gerente, "PUT", `/api/registros/${nc.id}/aprovador`, 200, {
            usuarioId: qa.usuario.id,
        });

        // Confere
        expect(resposta).toEqual({
            registroId: nc.id,
            usuarioId: qa.usuario.id,
            funcao: "APROVADOR",
            atribuidoPorId: gerente.usuario.id,
            atribuidoEm: expect.any(String),
        });
    });

    it("um APROVADOR que não é gerente também define (RN-18)", async () => {
        // Prepara
        const { aprovador, qa, nc } = await ncPublicada();

        // Chama
        await chamar(aprovador, "PUT", `/api/registros/${nc.id}/aprovador`, 200, { usuarioId: qa.usuario.id });

        // Confere
        expect(await aprovadoresDe(nc.id)).toEqual([qa.usuario.id]);
    });

    it("trocar o aprovador substitui o anterior: um aprovador por item", async () => {
        // Prepara
        const { gerente, qa, nc } = await ncPublicada();

        // Chama
        const resposta = await chamar(gerente, "PUT", `/api/registros/${nc.id}/aprovador`, 200, {
            usuarioId: qa.usuario.id,
        });

        // Confere
        expect(resposta).toMatchObject({ registroId: nc.id, usuarioId: qa.usuario.id, funcao: "APROVADOR" });
        expect(await aprovadoresDe(nc.id)).toEqual([qa.usuario.id]);
    });

    it("recusa quem não tem papel APROVADOR nem GERENTE (403)", async () => {
        // Prepara
        const { editor, aprovador, qa, nc } = await ncPublicada();

        // Chama
        await chamar(editor, "PUT", `/api/registros/${nc.id}/aprovador`, 403, { usuarioId: qa.usuario.id });

        // Confere
        expect(await aprovadoresDe(nc.id)).toEqual([aprovador.usuario.id]);
    });

    // Quem não pode definir aprovador não aprende nada com a resposta: nem se o usuário escolhido existe, nem se ele é
    // aprovador (auditoria L5). A permissão vem antes de qualquer busca
    it.each([
        { caso: "que não existe", usuarioId: () => ID_INEXISTENTE },
        { caso: "sem o papel APROVADOR", usuarioId: (editor: { usuario: { id: string } }) => editor.usuario.id },
    ])("sem permissão, escolher um usuário $caso também responde 403 (L5)", async ({ usuarioId }) => {
        // Prepara
        const { editor, nc } = await ncPublicada();

        // Chama
        const resposta = await chamar(editor, "PUT", `/api/registros/${nc.id}/aprovador`, 403, {
            usuarioId: usuarioId(editor),
        });

        // Confere
        expect(resposta).toEqual({ mensagem: "Você não tem permissões suficientes para gerenciar aprovadores." });
    });

    it("com o item em aprovação, quem não é gerente recebe 403 antes de saber se o usuário existe (L5, RN-47)", async () => {
        // Prepara (o aprovador é APROVADOR, mas não GERENTE: em aprovação, não pode trocar)
        const { aprovador, contencao } = await levarContencaoAte("EM_APROVACAO");

        // Chama
        const resposta = await chamar(aprovador, "PUT", `/api/registros/${contencao.id}/aprovador`, 403, {
            usuarioId: ID_INEXISTENTE,
        });

        // Confere
        expect(resposta).toEqual({ mensagem: "Com o item em aprovação, só o gerente troca o aprovador." });
    });

    it("recusa escolher quem não tem papel APROVADOR (RN-18)", async () => {
        // Prepara
        const { editor, gerente, aprovador, nc } = await ncPublicada();

        // Chama
        await chamar(gerente, "PUT", `/api/registros/${nc.id}/aprovador`, 400, { usuarioId: editor.usuario.id });

        // Confere
        expect(await aprovadoresDe(nc.id)).toEqual([aprovador.usuario.id]);
    });

    it("responde 404 quando o item não existe", async () => {
        const { gerente, aprovador } = await ncPublicada();

        await chamar(gerente, "PUT", `/api/registros/${ID_INEXISTENTE}/aprovador`, 404, {
            usuarioId: aprovador.usuario.id,
        });
    });

    it("responde 404 quando o usuário escolhido não existe", async () => {
        const { gerente, nc } = await ncPublicada();

        await chamar(gerente, "PUT", `/api/registros/${nc.id}/aprovador`, 404, { usuarioId: ID_INEXISTENTE });
    });
});

// Cada filho criado pelo usuário: devolve o id. A ação corretiva precisa de uma investigação aberta (RN-49)
const FILHOS: { tipo: string; criar: (cenario: Cenario) => Promise<string> }[] = [
    {
        tipo: "Contenção",
        criar: async ({ editor, nc }) =>
            (
                await chamar(editor, "POST", `/api/nc/${nc.id}/contencoes`, 201, {
                    descricao: "Retrabalho realizado na peça com defeito, substituindo a vedação danificada.",
                })
            ).id,
    },
    {
        tipo: "Classificação",
        criar: async ({ aprovador, nc }) =>
            (
                await chamar(aprovador, "POST", `/api/nc/${nc.id}/classificacoes`, 201, {
                    valor: "MAIOR",
                    justificativa: "Vazamento afeta a segurança operacional e a qualidade do produto entregue.",
                })
            ).id,
    },
    {
        tipo: "Investigação",
        criar: async ({ editor, nc }) =>
            (
                await chamar(editor, "POST", `/api/nc/${nc.id}/investigacoes`, 201, {
                    realProblema: "Vedação da bomba hidráulica com desgaste prematuro.",
                })
            ).id,
    },
    {
        tipo: "Ação corretiva",
        criar: async ({ editor, nc }) => {
            const investigacao = await chamar(editor, "POST", `/api/nc/${nc.id}/investigacoes`, 201, {
                realProblema: "Vedação da bomba hidráulica com desgaste prematuro.",
            });
            await chamar(editor, "POST", `/api/investigacoes/${investigacao.id}/publicar`, 200);
            return (
                await chamar(editor, "POST", `/api/nc/${nc.id}/acoes-corretivas`, 201, {
                    investigacaoId: investigacao.id,
                })
            ).id;
        },
    },
];

// O filho nasce com o aprovador da NC, para o colaborador não ficar travado na hora de enviar (B13, RN-46)
describe("Criação de um filho da NC", () => {
    it.each(FILHOS)("$tipo nasce com o aprovador da NC (B13, RN-46)", async ({ criar }) => {
        // Prepara
        const cenario = await ncPublicada();

        // Chama
        const filhoId = await criar(cenario);

        // Confere
        expect(await aprovadoresDe(filhoId)).toEqual([cenario.aprovador.usuario.id]);
    });

    it.each(FILHOS)("$tipo nasce sem aprovador quando a NC não tem um (RN-46)", async ({ criar }) => {
        // Prepara: uma NC em rascunho, ainda sem aprovador
        const cenario = await ncPublicada();
        const nc = await chamar(cenario.editor, "POST", "/api/nc", 201, { titulo: "NC ainda sem aprovador" });

        // Chama
        const filhoId = await criar({ ...cenario, nc });

        // Confere
        expect(await aprovadoresDe(filhoId)).toEqual([]);
    });
});

describe("POST /registros/:id/colaboradores", () => {
    it("recusa mais de 50 colaboradores numa requisição, antes de consultar o banco (L4)", async () => {
        // Prepara
        const { editor, nc } = await ncPublicada();
        const ids = Array.from({ length: 51 }, (_, i) => `00000000-0000-7000-8000-${String(i).padStart(12, "0")}`);

        // Chama
        const resposta = await chamar(editor, "POST", `/api/registros/${nc.id}/colaboradores`, 400, {
            colaboradores: ids,
        });

        // Confere: erro de campo; com 50, a validação passaria e o service responderia que os usuários não existem
        expect(resposta).toMatchObject({
            error: expect.arrayContaining([expect.objectContaining({ instancePath: "/colaboradores" })]),
        });
        await chamar(editor, "POST", `/api/registros/${nc.id}/colaboradores`, 404, { colaboradores: ids.slice(0, 50) });
    });

    it("um EDITOR que não está no item adiciona colaborador (RN-18, auto-organização)", async () => {
        // Prepara (o qa não é colaborador nem aprovador da NC)
        const { gerente, qa, nc } = await ncPublicada();

        // Chama
        const resposta = await chamar(qa, "POST", `/api/registros/${nc.id}/colaboradores`, 200, {
            colaboradores: [gerente.usuario.id],
        });

        // Confere
        expect(resposta).toMatchObject({
            adicionados: [{ usuarioId: gerente.usuario.id, funcao: "COLABORADOR", atribuidoPorId: qa.usuario.id }],
            jaEramColaboradores: [],
        });
    });

    it("responde 404 quando um dos usuários não existe, e não adiciona nenhum (B16)", async () => {
        // Prepara: um usuário que existe e um que não
        const { editor, gerente, nc } = await ncPublicada();

        // Chama
        const resposta = await chamar(editor, "POST", `/api/registros/${nc.id}/colaboradores`, 404, {
            colaboradores: [gerente.usuario.id, ID_INEXISTENTE],
        });

        // Confere: nem o que existe entrou (tudo ou nada)
        expect(resposta.mensagem).toEqual(expect.any(String));
        const colaboradores = await prisma.atribuicao.findMany({ where: { registroId: nc.id, funcao: "COLABORADOR" } });
        expect(colaboradores.map((atribuicao) => atribuicao.usuarioId)).toEqual([editor.usuario.id]);
    });

    it("quem já é colaborador não entra de novo", async () => {
        // Prepara (quem cria a NC já é colaborador)
        const { editor, nc } = await ncPublicada();

        // Chama
        const resposta = await chamar(editor, "POST", `/api/registros/${nc.id}/colaboradores`, 200, {
            colaboradores: [editor.usuario.id],
        });

        // Confere
        expect(resposta).toEqual({ adicionados: [], jaEramColaboradores: [editor.usuario.id] });
    });

    it("o mesmo id repetido na lista entra uma vez só", async () => {
        // Prepara
        const { editor, qa, nc } = await ncPublicada();

        // Chama
        const resposta = await chamar(editor, "POST", `/api/registros/${nc.id}/colaboradores`, 200, {
            colaboradores: [qa.usuario.id, qa.usuario.id],
        });

        // Confere
        expect(resposta.adicionados).toHaveLength(1);
    });

    it("recusa a lista vazia", async () => {
        // Prepara
        const { editor, nc } = await ncPublicada();

        // Chama
        const resposta = await chamar(editor, "POST", `/api/registros/${nc.id}/colaboradores`, 400, {
            colaboradores: [],
        });

        // Confere
        expect(resposta).toMatchObject({
            mensagem: "Dados inválidos",
            error: expect.arrayContaining([expect.objectContaining({ instancePath: "/colaboradores" })]),
        });
    });

    it("recusa quem não tem papel EDITOR nem GERENTE (403)", async () => {
        // Prepara
        const { qa, nc } = await ncPublicada();
        const { visualizador } = await perfisDeFora();

        // Chama
        await chamar(visualizador, "POST", `/api/registros/${nc.id}/colaboradores`, 403, {
            colaboradores: [qa.usuario.id],
        });
    });
});

describe("DELETE /registros/:id/colaboradores", () => {
    it("a remoção fica na auditoria como REMOVER_COLABORADORES, o par do ADICIONAR_COLABORADORES", async () => {
        // Prepara
        const { editor, qa, nc } = await ncPublicada();
        await chamar(editor, "POST", `/api/registros/${nc.id}/colaboradores`, 200, { colaboradores: [qa.usuario.id] });

        // Chama
        await chamar(editor, "DELETE", `/api/registros/${nc.id}/colaboradores`, 200, {
            colaboradores: [qa.usuario.id],
        });

        // Confere
        expect(
            await prisma.auditoria.findMany({ where: { entidadeId: nc.id, acao: "REMOVER_COLABORADORES" } }),
        ).toMatchObject([{ usuarioId: editor.usuario.id }]);
    });

    it("remove um colaborador quando sobra outro", async () => {
        // Prepara
        const { editor, qa, nc } = await ncPublicada();
        await chamar(editor, "POST", `/api/registros/${nc.id}/colaboradores`, 200, { colaboradores: [qa.usuario.id] });

        // Chama
        const resposta = await chamar(editor, "DELETE", `/api/registros/${nc.id}/colaboradores`, 200, {
            colaboradores: [qa.usuario.id],
        });

        // Confere
        expect(resposta).toMatchObject({ removidos: [{ usuarioId: qa.usuario.id }], naoEramColaboradores: [] });
    });

    it("recusa remover o último colaborador (RN-12)", async () => {
        // Prepara (o editor, que criou a NC, é o único colaborador)
        const { editor, nc } = await ncPublicada();

        // Chama
        await chamar(editor, "DELETE", `/api/registros/${nc.id}/colaboradores`, 409, {
            colaboradores: [editor.usuario.id],
        });
    });

    it("o gerente também remove, sem estar no item (RN-18)", async () => {
        // Prepara
        const { editor, gerente, qa, nc } = await ncPublicada();
        await chamar(editor, "POST", `/api/registros/${nc.id}/colaboradores`, 200, { colaboradores: [qa.usuario.id] });

        // Chama
        const resposta = await chamar(gerente, "DELETE", `/api/registros/${nc.id}/colaboradores`, 200, {
            colaboradores: [qa.usuario.id],
        });

        // Confere
        expect(resposta).toMatchObject({ removidos: [{ usuarioId: qa.usuario.id }] });
    });

    it("recusa remover o último colaborador mesmo com o id repetido na lista (RN-12)", async () => {
        // Prepara
        const { editor, nc } = await ncPublicada();

        // Chama
        await chamar(editor, "DELETE", `/api/registros/${nc.id}/colaboradores`, 409, {
            colaboradores: [editor.usuario.id, editor.usuario.id],
        });
    });

    it("recusa remover todos de uma vez (RN-12)", async () => {
        // Prepara
        const { editor, qa, nc } = await ncPublicada();
        await chamar(editor, "POST", `/api/registros/${nc.id}/colaboradores`, 200, { colaboradores: [qa.usuario.id] });

        // Chama
        await chamar(editor, "DELETE", `/api/registros/${nc.id}/colaboradores`, 409, {
            colaboradores: [editor.usuario.id, qa.usuario.id],
        });

        // Confere (nada foi removido: a transação desfez tudo)
        const resposta = await chamar(editor, "POST", `/api/registros/${nc.id}/colaboradores`, 200, {
            colaboradores: [editor.usuario.id, qa.usuario.id],
        });
        expect(resposta.jaEramColaboradores).toEqual([editor.usuario.id, qa.usuario.id]);
    });

    it("quem não é colaborador volta em naoEramColaboradores", async () => {
        // Prepara
        const { editor, qa, nc } = await ncPublicada();

        // Chama
        const resposta = await chamar(editor, "DELETE", `/api/registros/${nc.id}/colaboradores`, 200, {
            colaboradores: [qa.usuario.id],
        });

        // Confere
        expect(resposta).toEqual({ removidos: [], naoEramColaboradores: [qa.usuario.id] });
    });

    it("recusa quem não tem papel EDITOR nem GERENTE (403)", async () => {
        // Prepara
        const { editor, qa, nc } = await ncPublicada();
        await chamar(editor, "POST", `/api/registros/${nc.id}/colaboradores`, 200, { colaboradores: [qa.usuario.id] });
        const { visualizador } = await perfisDeFora();

        // Chama
        await chamar(visualizador, "DELETE", `/api/registros/${nc.id}/colaboradores`, 403, {
            colaboradores: [qa.usuario.id],
        });
    });
});

// Atribuições só mudam com o item em rascunho ou aberto. Em aprovação, só o GERENTE troca o aprovador (férias, saída
// da empresa); fechado ou cancelado, nada muda (B17, RN-47). Estado errado → 409; pessoa errada → 403
describe("Atribuições conforme o estado do item (RN-47)", () => {
    const congelados = ["EM_APROVACAO", "FECHADO", "CANCELADO"] as const;
    const definitivos = ["FECHADO", "CANCELADO"] as const;

    it.each(congelados)("%s recusa adicionar e remover colaboradores (B17)", async (estado) => {
        // Prepara
        const { editor, gerente, contencao } = await levarContencaoAte(estado);
        const corpo = { colaboradores: [gerente.usuario.id] };

        // Chama
        const adicionar = await chamar(editor, "POST", `/api/registros/${contencao.id}/colaboradores`, 409, corpo);
        const remover = await chamar(editor, "DELETE", `/api/registros/${contencao.id}/colaboradores`, 409, corpo);

        // Confere
        expect(adicionar.mensagem).toContain("rascunho ou aberto");
        expect(remover.mensagem).toContain("rascunho ou aberto");
    });

    it.each(definitivos)("%s recusa trocar o aprovador, mesmo para o gerente (B17)", async (estado) => {
        // Prepara
        const { gerente, qa, contencao } = await levarContencaoAte(estado);

        // Chama
        await chamar(gerente, "PUT", `/api/registros/${contencao.id}/aprovador`, 409, { usuarioId: qa.usuario.id });

        // Confere
        expect(await aprovadoresDe(contencao.id)).not.toContain(qa.usuario.id);
    });

    it("EM_APROVACAO: só o gerente troca o aprovador (B17, RN-47)", async () => {
        // Prepara
        const { aprovador, gerente, qa, contencao } = await levarContencaoAte("EM_APROVACAO");

        // Chama: um APROVADOR que não é gerente é recusado; o gerente consegue
        await chamar(aprovador, "PUT", `/api/registros/${contencao.id}/aprovador`, 403, { usuarioId: qa.usuario.id });
        await chamar(gerente, "PUT", `/api/registros/${contencao.id}/aprovador`, 200, { usuarioId: qa.usuario.id });

        // Confere
        expect(await aprovadoresDe(contencao.id)).toEqual([qa.usuario.id]);
    });
});
