import { describe, expect, it } from "vitest";
import { chamar, ncPublicada, perfisDeFora } from "../../testes/cenarios.js";
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

    it("um APROVADOR que não é gerente também define (RN-18)", async () => {
        // Prepara
        const { aprovador, qa, nc } = await ncPublicada();

        // Chama
        await chamar(aprovador, "PUT", `/registros/${nc.id}/aprovador`, 200, { usuarioId: qa.usuario.id });

        // Confere
        expect(await aprovadoresDe(nc.id)).toEqual([qa.usuario.id]);
    });

    it("trocar o aprovador substitui o anterior: um aprovador por item", async () => {
        // Prepara
        const { gerente, qa, nc } = await ncPublicada();

        // Chama
        const resposta = await chamar(gerente, "PUT", `/registros/${nc.id}/aprovador`, 200, {
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
        await chamar(editor, "PUT", `/registros/${nc.id}/aprovador`, 403, { usuarioId: qa.usuario.id });

        // Confere
        expect(await aprovadoresDe(nc.id)).toEqual([aprovador.usuario.id]);
    });

    it("recusa escolher quem não tem papel APROVADOR (RN-18)", async () => {
        // Prepara
        const { editor, gerente, aprovador, nc } = await ncPublicada();

        // Chama
        await chamar(gerente, "PUT", `/registros/${nc.id}/aprovador`, 400, { usuarioId: editor.usuario.id });

        // Confere
        expect(await aprovadoresDe(nc.id)).toEqual([aprovador.usuario.id]);
    });

    it("responde 404 quando o item não existe", async () => {
        const { gerente, aprovador } = await ncPublicada();

        await chamar(gerente, "PUT", `/registros/${ID_INEXISTENTE}/aprovador`, 404, {
            usuarioId: aprovador.usuario.id,
        });
    });

    it("responde 404 quando o usuário escolhido não existe", async () => {
        const { gerente, nc } = await ncPublicada();

        await chamar(gerente, "PUT", `/registros/${nc.id}/aprovador`, 404, { usuarioId: ID_INEXISTENTE });
    });
});

describe("POST /registros/:id/colaboradores", () => {
    it("um EDITOR que não está no item adiciona colaborador (RN-18, auto-organização)", async () => {
        // Prepara (o qa não é colaborador nem aprovador da NC)
        const { gerente, qa, nc } = await ncPublicada();

        // Chama
        const resposta = await chamar(qa, "POST", `/registros/${nc.id}/colaboradores`, 200, {
            colaboradores: [gerente.usuario.id],
        });

        // Confere
        expect(resposta).toMatchObject({
            adicionados: [{ usuarioId: gerente.usuario.id, funcao: "COLABORADOR", atribuidoPorId: qa.usuario.id }],
            jaEramColaboradores: [],
        });
    });

    it("quem já é colaborador não entra de novo", async () => {
        // Prepara (quem cria a NC já é colaborador)
        const { editor, nc } = await ncPublicada();

        // Chama
        const resposta = await chamar(editor, "POST", `/registros/${nc.id}/colaboradores`, 200, {
            colaboradores: [editor.usuario.id],
        });

        // Confere
        expect(resposta).toEqual({ adicionados: [], jaEramColaboradores: [editor.usuario.id] });
    });

    it("o mesmo id repetido na lista entra uma vez só", async () => {
        // Prepara
        const { editor, qa, nc } = await ncPublicada();

        // Chama
        const resposta = await chamar(editor, "POST", `/registros/${nc.id}/colaboradores`, 200, {
            colaboradores: [qa.usuario.id, qa.usuario.id],
        });

        // Confere
        expect(resposta.adicionados).toHaveLength(1);
    });

    it("recusa a lista vazia", async () => {
        // Prepara
        const { editor, nc } = await ncPublicada();

        // Chama
        const resposta = await chamar(editor, "POST", `/registros/${nc.id}/colaboradores`, 400, { colaboradores: [] });

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
        await chamar(visualizador, "POST", `/registros/${nc.id}/colaboradores`, 403, {
            colaboradores: [qa.usuario.id],
        });
    });
});

describe("DELETE /registros/:id/colaboradores", () => {
    it("remove um colaborador quando sobra outro", async () => {
        // Prepara
        const { editor, qa, nc } = await ncPublicada();
        await chamar(editor, "POST", `/registros/${nc.id}/colaboradores`, 200, { colaboradores: [qa.usuario.id] });

        // Chama
        const resposta = await chamar(editor, "DELETE", `/registros/${nc.id}/colaboradores`, 200, {
            colaboradores: [qa.usuario.id],
        });

        // Confere
        expect(resposta).toMatchObject({ removidos: [{ usuarioId: qa.usuario.id }], naoEramColaboradores: [] });
    });

    it("recusa remover o último colaborador (RN-12)", async () => {
        // Prepara (o editor, que criou a NC, é o único colaborador)
        const { editor, nc } = await ncPublicada();

        // Chama
        await chamar(editor, "DELETE", `/registros/${nc.id}/colaboradores`, 409, {
            colaboradores: [editor.usuario.id],
        });
    });

    it("o gerente também remove, sem estar no item (RN-18)", async () => {
        // Prepara
        const { editor, gerente, qa, nc } = await ncPublicada();
        await chamar(editor, "POST", `/registros/${nc.id}/colaboradores`, 200, { colaboradores: [qa.usuario.id] });

        // Chama
        const resposta = await chamar(gerente, "DELETE", `/registros/${nc.id}/colaboradores`, 200, {
            colaboradores: [qa.usuario.id],
        });

        // Confere
        expect(resposta).toMatchObject({ removidos: [{ usuarioId: qa.usuario.id }] });
    });

    it("recusa remover o último colaborador mesmo com o id repetido na lista (RN-12)", async () => {
        // Prepara
        const { editor, nc } = await ncPublicada();

        // Chama
        await chamar(editor, "DELETE", `/registros/${nc.id}/colaboradores`, 409, {
            colaboradores: [editor.usuario.id, editor.usuario.id],
        });
    });

    it("recusa remover todos de uma vez (RN-12)", async () => {
        // Prepara
        const { editor, qa, nc } = await ncPublicada();
        await chamar(editor, "POST", `/registros/${nc.id}/colaboradores`, 200, { colaboradores: [qa.usuario.id] });

        // Chama
        await chamar(editor, "DELETE", `/registros/${nc.id}/colaboradores`, 409, {
            colaboradores: [editor.usuario.id, qa.usuario.id],
        });

        // Confere (nada foi removido: a transação desfez tudo)
        const resposta = await chamar(editor, "POST", `/registros/${nc.id}/colaboradores`, 200, {
            colaboradores: [editor.usuario.id, qa.usuario.id],
        });
        expect(resposta.jaEramColaboradores).toEqual([editor.usuario.id, qa.usuario.id]);
    });

    it("quem não é colaborador volta em naoEramColaboradores", async () => {
        // Prepara
        const { editor, qa, nc } = await ncPublicada();

        // Chama
        const resposta = await chamar(editor, "DELETE", `/registros/${nc.id}/colaboradores`, 200, {
            colaboradores: [qa.usuario.id],
        });

        // Confere
        expect(resposta).toEqual({ removidos: [], naoEramColaboradores: [qa.usuario.id] });
    });

    it("recusa quem não tem papel EDITOR nem GERENTE (403)", async () => {
        // Prepara
        const { editor, qa, nc } = await ncPublicada();
        await chamar(editor, "POST", `/registros/${nc.id}/colaboradores`, 200, { colaboradores: [qa.usuario.id] });
        const { visualizador } = await perfisDeFora();

        // Chama
        await chamar(visualizador, "DELETE", `/registros/${nc.id}/colaboradores`, 403, {
            colaboradores: [qa.usuario.id],
        });
    });
});
