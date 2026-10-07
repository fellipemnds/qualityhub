import { describe, expect, it } from "vitest";
import { prisma } from "../../../compartilhado/prisma/cliente.js";
import { chamar, diaDaquiA, ncPublicada } from "../../../testes/cenarios.js";
import { loginComo } from "../../../testes/fabricas.js";
import { levarAcaoCorretivaAte } from "../../../testes/levar-ate/acao-corretiva.js";
import { levarContencaoAte } from "../../../testes/levar-ate/contencao.js";

const ID_INEXISTENTE = "00000000-0000-0000-0000-000000000000";

describe("POST /nc/:naoConformidadeId/contencoes", () => {
    it("responde 404 quando a NC não existe", async () => {
        // Prepara
        const editor = await loginComo("editor");

        // Chama
        const resposta = await chamar(editor, "POST", `/api/nc/${ID_INEXISTENTE}/contencoes`, 404, {
            descricao: "Contenção de uma NC que não existe.",
        });

        // Confere
        expect(resposta).toEqual({ mensagem: "A Não Conformidade não existe ou não foi encontrada" });
    });
});

describe("PATCH /contencoes/:id", () => {
    it("recusa disposição fora da lista", async () => {
        // Prepara
        const { editor, nc } = await ncPublicada();
        const contencao = await chamar(editor, "POST", `/api/nc/${nc.id}/contencoes`, 201, {
            descricao: "Retrabalho realizado na peça com defeito.",
        });

        // Chama
        const resposta = await chamar(editor, "PATCH", `/api/contencoes/${contencao.id}`, 400, {
            disposicao: "XPTO_INVALIDO",
        });

        // Confere
        expect(resposta).toMatchObject({
            mensagem: "Dados inválidos",
            error: expect.arrayContaining([expect.objectContaining({ instancePath: "/disposicao" })]),
        });
    });
});

describe("PATCH /contencoes/:id", () => {
    it("recusa número como data: 0 viraria 01/01/1970 (B14)", async () => {
        // Prepara
        const { editor, nc } = await ncPublicada();
        const contencao = await chamar(editor, "POST", `/api/nc/${nc.id}/contencoes`, 201, {
            descricao: "Retrabalho realizado na peça com defeito.",
        });

        // Chama
        const resposta = await chamar(editor, "PATCH", `/api/contencoes/${contencao.id}`, 400, { executadaEm: 0 });

        // Confere
        expect(resposta).toMatchObject({
            mensagem: "Dados inválidos",
            error: expect.arrayContaining([expect.objectContaining({ instancePath: "/executadaEm" })]),
        });
    });
});

describe("GET /contencoes", () => {
    it("filtra por NC e por estado", async () => {
        // Prepara: duas contenções na NC do cenário (uma publicada) e uma em outra NC
        const { editor, nc } = await ncPublicada();
        const outraNC = await chamar(editor, "POST", "/api/nc", 201, { titulo: "Outra NC, com a sua contenção" });
        const publicada = await chamar(editor, "POST", `/api/nc/${nc.id}/contencoes`, 201, {
            descricao: "Contenção que vai ser publicada.",
        });
        const rascunho = await chamar(editor, "POST", `/api/nc/${nc.id}/contencoes`, 201, {
            descricao: "Contenção que fica em rascunho.",
        });
        await chamar(editor, "POST", `/api/nc/${outraNC.id}/contencoes`, 201, {
            descricao: "Contenção de outra não conformidade.",
        });
        await chamar(editor, "POST", `/api/contencoes/${publicada.id}/publicar`, 200);

        // Chama
        const daNC = await chamar(editor, "GET", `/api/contencoes?naoConformidadeId=${nc.id}`, 200);
        const abertasDaNC = await chamar(
            editor,
            "GET",
            `/api/contencoes?naoConformidadeId=${nc.id}&estado=ABERTO`,
            200,
        );

        // Confere
        const ids = (lista: { id: string }[]) => lista.map((item) => item.id).sort();
        expect(ids(daNC)).toEqual([publicada.id, rascunho.id].sort());
        expect(ids(abertasDaNC)).toEqual([publicada.id]);
    });

    it("recusa filtro de estado fora da lista", async () => {
        // Prepara
        const editor = await loginComo("editor");

        // Chama
        const resposta = await chamar(editor, "GET", "/api/contencoes?estado=XPTO_INVALIDO", 400);

        // Confere
        expect(resposta).toMatchObject({
            mensagem: "Dados inválidos",
            error: expect.arrayContaining([expect.objectContaining({ instancePath: "/estado" })]),
        });
    });
});

describe("POST /contencoes/:id/submeter", () => {
    it("recusa sem a data de execução (B14)", async () => {
        // Prepara: a disposição preenchida, a data não
        const { editor, contencao } = await levarContencaoAte("ABERTO");
        await chamar(editor, "PATCH", `/api/contencoes/${contencao.id}`, 200, { disposicao: "CORRIGIDO" });

        // Chama
        const resposta = await chamar(editor, "POST", `/api/contencoes/${contencao.id}/submeter`, 400);

        // Confere
        expect(resposta).toMatchObject({
            mensagem: "Dados inválidos",
            error: [expect.objectContaining({ path: ["executadaEm"] })],
        });
    });

    it("recusa sem aprovador definido (RN-13)", async () => {
        // Prepara: a NC ainda sem aprovador, então o filho também nasce sem (RN-46)
        const { editor } = await ncPublicada();
        const nc = await chamar(editor, "POST", "/api/nc", 201, { titulo: "NC ainda sem aprovador" });
        const contencao = await chamar(editor, "POST", `/api/nc/${nc.id}/contencoes`, 201, {
            descricao: "Retrabalho realizado na peça com defeito.",
            executadaEm: diaDaquiA(-1),
            disposicao: "CORRIGIDO",
        });
        await chamar(editor, "POST", `/api/contencoes/${contencao.id}/publicar`, 200);

        // Chama
        const resposta = await chamar(editor, "POST", `/api/contencoes/${contencao.id}/submeter`, 409);

        // Confere
        expect(resposta.mensagem).toContain("aprovador");
    });
});

describe("POST /contencoes/:id/decidir", () => {
    it("recusa com 404 o id de uma ação corretiva, que continua em aprovação (B23)", async () => {
        // Prepara
        const { editor, aprovador, acao } = await levarAcaoCorretivaAte("EM_APROVACAO");

        // Chama
        await chamar(aprovador, "POST", `/api/contencoes/${acao.id}/decidir`, 404, { decisao: "APROVADO" });

        // Confere
        expect(await chamar(editor, "GET", `/api/acoes-corretivas/${acao.id}`, 200)).toMatchObject({
            estado: "EM_APROVACAO",
        });
    });

    it("recusa reprovar sem motivo (RN-04)", async () => {
        // Prepara
        const { editor, aprovador, contencao } = await levarContencaoAte("EM_APROVACAO");

        // Chama
        await chamar(aprovador, "POST", `/api/contencoes/${contencao.id}/decidir`, 400, { decisao: "REPROVADO" });

        // Confere
        expect(await chamar(editor, "GET", `/api/contencoes/${contencao.id}`, 200)).toMatchObject({
            estado: "EM_APROVACAO",
        });
    });

    it("reprovar com motivo devolve a ABERTO, e o item volta a ser editável (RN-04)", async () => {
        // Prepara
        const { editor, aprovador, contencao } = await levarContencaoAte("EM_APROVACAO");

        // Chama
        const resposta = await chamar(aprovador, "POST", `/api/contencoes/${contencao.id}/decidir`, 200, {
            decisao: "REPROVADO",
            motivo: "A disposição não corresponde ao que foi feito na linha.",
        });

        // Confere
        expect(resposta).toMatchObject({ estado: "ABERTO" });
        await chamar(editor, "PATCH", `/api/contencoes/${contencao.id}`, 200, { disposicao: "ANULADO" });
        expect(await prisma.aprovacao.findMany({ where: { registroId: contencao.id } })).toMatchObject([
            { decisao: "REPROVADO", autoAprovacao: false },
        ]);
    });

    it("a auto-aprovação passa e fica registrada como tal (RN-27)", async () => {
        // Prepara (o qa cria a contenção e é o aprovador dela)
        const { gerente, qa, nc } = await ncPublicada();
        const contencao = await chamar(qa, "POST", `/api/nc/${nc.id}/contencoes`, 201, {
            descricao: "Retrabalho realizado na peça com defeito.",
            executadaEm: diaDaquiA(-1),
            disposicao: "CORRIGIDO",
        });
        await chamar(qa, "POST", `/api/contencoes/${contencao.id}/publicar`, 200);
        await chamar(gerente, "PUT", `/api/registros/${contencao.id}/aprovador`, 200, { usuarioId: qa.usuario.id });
        await chamar(qa, "POST", `/api/contencoes/${contencao.id}/submeter`, 200);

        // Chama
        const resposta = await chamar(qa, "POST", `/api/contencoes/${contencao.id}/decidir`, 200, {
            decisao: "APROVADO",
        });

        // Confere
        expect(resposta).toMatchObject({ estado: "FECHADO" });
        expect(await prisma.aprovacao.findMany({ where: { registroId: contencao.id } })).toMatchObject([
            { decisao: "APROVADO", autoAprovacao: true, aprovadorId: qa.usuario.id },
        ]);
    });
});

describe("POST /contencoes/:id/cancelar", () => {
    // B18 (esquema-backend.md §7): o motivo em branco é um erro de campo (400, no schema), não de estado (409)
    it("recusa motivo só com espaços (RN-06)", async () => {
        // Prepara
        const { editor, aprovador, contencao } = await levarContencaoAte("ABERTO");

        // Chama
        await chamar(aprovador, "POST", `/api/contencoes/${contencao.id}/cancelar`, 400, { motivo: "   " });

        // Confere
        expect(await chamar(editor, "GET", `/api/contencoes/${contencao.id}`, 200)).toMatchObject({ estado: "ABERTO" });
    });
});

// Retirar da aprovação (RN-48): o colaborador desiste do envio. O ciclo de vida genérico é testado aqui, pela contenção
describe("POST /contencoes/:id/retirar", () => {
    it("volta a ABERTO sem registrar decisão, fica na auditoria e pode ser enviada de novo (RN-48)", async () => {
        // Prepara
        const { editor, contencao } = await levarContencaoAte("EM_APROVACAO");

        // Chama
        const resposta = await chamar(editor, "POST", `/api/contencoes/${contencao.id}/retirar`, 200);

        // Confere: no mesmo portão, sem Aprovacao (não é reprovação), auditado, e o envio volta a ser possível
        expect(resposta).toMatchObject({ estado: "ABERTO", portaoAtual: 0 });
        expect(await prisma.aprovacao.findMany({ where: { registroId: contencao.id } })).toEqual([]);
        expect(
            await prisma.auditoria.findMany({ where: { entidadeId: contencao.id, acao: "RETIRAR_DA_APROVACAO" } }),
        ).toMatchObject([{ usuarioId: editor.usuario.id }]);
        await chamar(editor, "POST", `/api/contencoes/${contencao.id}/submeter`, 200);
    });
});
