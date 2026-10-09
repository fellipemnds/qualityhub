import { describe, expect, it } from "vitest";
import { prisma } from "../../../compartilhado/prisma/cliente.js";
import { chamar, diaDaquiA, ncAbertaSemAprovador, ncPublicada } from "../../../testes/cenarios.js";
import { loginComo } from "../../../testes/fabricas.js";
import { levarAcaoCorretivaAte } from "../../../testes/levar-ate/acao-corretiva.js";
import { levarClassificacaoAte } from "../../../testes/levar-ate/classificacao.js";
import { levarContencaoAte } from "../../../testes/levar-ate/contencao.js";
import { levarNCAte } from "../../../testes/levar-ate/nc.js";

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

    it("recusa com a NC em aprovação (RN-51, B29)", async () => {
        // Prepara
        const { editor, nc } = await levarNCAte("EM_APROVACAO");
        const antes = await prisma.contencao.count({ where: { naoConformidadeId: nc.id } });

        // Chama
        await chamar(editor, "POST", `/api/nc/${nc.id}/contencoes`, 409, {
            descricao: "Segregação do lote seguinte, aberta com a NC já em aprovação.",
        });

        // Confere
        expect(await prisma.contencao.count({ where: { naoConformidadeId: nc.id } })).toBe(antes);
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

    it("recusa com 404 o id de uma NC, que não muda (B23)", async () => {
        // Prepara (o editor é colaborador da NC, e ela está aberta: passa pelo estado e pela permissão)
        const { editor, nc } = await ncPublicada();
        const antes = await chamar(editor, "GET", `/api/nc/${nc.id}`, 200);

        // Chama
        await chamar(editor, "PATCH", `/api/contencoes/${nc.id}`, 404, {
            descricao: "Tentativa de editar a NC pela rota da contenção.",
        });

        // Confere (comparado com a leitura de antes: o cenário já edita a descrição depois de criar)
        expect(await chamar(editor, "GET", `/api/nc/${nc.id}`, 200)).toMatchObject({ descricao: antes.descricao });
    });

    it("a edição de um item aberto fica na auditoria como EDITAR, não como rascunho", async () => {
        // Prepara
        const { editor, contencao } = await levarContencaoAte("ABERTO");

        // Chama
        await chamar(editor, "PATCH", `/api/contencoes/${contencao.id}`, 200, { disposicao: "ANULADO" });

        // Confere
        expect(await prisma.auditoria.findMany({ where: { entidadeId: contencao.id, acao: "EDITAR" } })).toMatchObject([
            { usuarioId: editor.usuario.id },
        ]);
    });

    it("a edição atualiza o atualizadoEm (B24)", async () => {
        // Prepara
        const { editor, contencao } = await levarContencaoAte("ABERTO");
        const antes = await chamar(editor, "GET", `/api/contencoes/${contencao.id}`, 200);

        // Chama
        await chamar(editor, "PATCH", `/api/contencoes/${contencao.id}`, 200, { disposicao: "ANULADO" });

        // Confere
        const depois = await chamar(editor, "GET", `/api/contencoes/${contencao.id}`, 200);
        expect(new Date(depois.atualizadoEm).getTime()).toBeGreaterThan(new Date(antes.atualizadoEm).getTime());
    });

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

    it("devolve a contenção inteira, com estado e código, como as outras rotas (D1)", async () => {
        // Prepara
        const { editor, contencao } = await levarContencaoAte("ABERTO");

        // Chama
        const resposta = await chamar(editor, "PATCH", `/api/contencoes/${contencao.id}`, 200, {
            disposicao: "ANULADO",
        });

        // Confere
        expect(resposta).toMatchObject({ disposicao: "ANULADO", estado: "ABERTO", codigo: expect.any(String) });
    });
});

describe("GET /contencoes", () => {
    it("filtra por NC e por estado", async () => {
        // Prepara: duas contenções na NC do cenário (uma publicada) e uma em outra NC
        const { editor, nc } = await ncPublicada();
        const outraNC = await ncAbertaSemAprovador(editor, "Outra NC, com a sua contenção");
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
        const ids = (pagina: { itensDaPagina: { id: string }[] }) => pagina.itensDaPagina.map((item) => item.id).sort();
        expect(ids(daNC)).toEqual([publicada.id, rascunho.id].sort());
        expect(ids(abertasDaNC)).toEqual([publicada.id]);
    });

    it("os itens da lista trazem a data de execução como dia, sem hora (B22)", async () => {
        // Prepara
        const { editor, nc } = await ncPublicada();
        await chamar(editor, "POST", `/api/nc/${nc.id}/contencoes`, 201, {
            descricao: "Retrabalho realizado na peça com defeito.",
            executadaEm: "2026-09-10",
        });

        // Chama
        const resposta = await chamar(editor, "GET", `/api/contencoes?naoConformidadeId=${nc.id}`, 200);

        // Confere
        expect(resposta.itensDaPagina[0].executadaEm).toBe("2026-09-10");
    });

    it("pagina por cursor: o limit corta a página, e o cursor traz a próxima (L4)", async () => {
        // Prepara: três contenções na mesma NC
        const { editor, nc } = await ncPublicada();
        for (const n of [1, 2, 3]) {
            await chamar(editor, "POST", `/api/nc/${nc.id}/contencoes`, 201, {
                descricao: `Contenção número ${n} da NC.`,
            });
        }

        // Chama
        const primeira = await chamar(editor, "GET", `/api/contencoes?naoConformidadeId=${nc.id}&limit=2`, 200);
        const segunda = await chamar(
            editor,
            "GET",
            `/api/contencoes?naoConformidadeId=${nc.id}&limit=2&cursor=${primeira.proximoCursor}`,
            200,
        );

        // Confere: 2 + 1, sem repetir nenhuma, e a última página sem cursor
        expect(primeira.itensDaPagina).toHaveLength(2);
        expect(primeira.proximoCursor).toBe(primeira.itensDaPagina[1].id);
        expect(segunda.itensDaPagina).toHaveLength(1);
        expect(segunda.proximoCursor).toBeNull();
        expect(new Set([...primeira.itensDaPagina, ...segunda.itensDaPagina].map((item) => item.id)).size).toBe(3);
    });

    it("recusa filtro de NC que não é UUID (L4)", async () => {
        // Prepara
        const editor = await loginComo("editor");

        // Chama
        const resposta = await chamar(editor, "GET", "/api/contencoes?naoConformidadeId=nao-e-uuid", 400);

        // Confere
        expect(resposta).toMatchObject({
            error: expect.arrayContaining([expect.objectContaining({ instancePath: "/naoConformidadeId" })]),
        });
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

describe("GET /contencoes/:id", () => {
    it("traz o motivo da última reprovação, para o colaborador saber o que corrigir (L7)", async () => {
        // Prepara
        const { editor, aprovador, contencao } = await levarContencaoAte("EM_APROVACAO");
        await chamar(aprovador, "POST", `/api/contencoes/${contencao.id}/decidir`, 200, {
            decisao: "REPROVADO",
            motivo: "Faltou detalhar o que foi feito.",
        });

        // Chama
        const resposta = await chamar(editor, "GET", `/api/contencoes/${contencao.id}`, 200);

        // Confere
        expect(resposta).toMatchObject({ ultimoMotivoReprovacao: "Faltou detalhar o que foi feito." });
    });

    it("devolve a data de execução como dia, sem hora (B22)", async () => {
        // Prepara
        const { editor, nc } = await ncPublicada();
        const contencao = await chamar(editor, "POST", `/api/nc/${nc.id}/contencoes`, 201, {
            descricao: "Retrabalho realizado na peça com defeito.",
            executadaEm: "2026-09-10",
        });

        // Chama
        const resposta = await chamar(editor, "GET", `/api/contencoes/${contencao.id}`, 200);

        // Confere
        expect(resposta.executadaEm).toBe("2026-09-10");
    });

    it("não expõe o portaoAtual, detalhe interno do ciclo de vida (D2)", async () => {
        // Prepara
        const { editor, contencao } = await levarContencaoAte("RASCUNHO");

        // Chama
        const resposta = await chamar(editor, "GET", `/api/contencoes/${contencao.id}`, 200);

        // Confere
        expect(resposta.id).toBe(contencao.id);
        expect(resposta).not.toHaveProperty("portaoAtual");
    });

    it("responde 404 só com a mensagem quando a contenção não existe", async () => {
        // Prepara
        const editor = await loginComo("editor");

        // Chama
        const resposta = await chamar(editor, "GET", `/api/contencoes/${ID_INEXISTENTE}`, 404);

        // Confere
        expect(resposta).toEqual({ mensagem: "Item não encontrado." });
    });

    it("recusa com 404 o id de uma NC (B23)", async () => {
        // Prepara
        const { editor, nc } = await ncPublicada();

        // Chama e confere
        await chamar(editor, "GET", `/api/contencoes/${nc.id}`, 404);
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
        const nc = await ncAbertaSemAprovador(editor, "NC ainda sem aprovador");
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

    it("recusa com 404 o id de uma investigação com ação aberta, que continua aberta (B23, RN-50)", async () => {
        // Prepara (pela rota dela, a RN-50 recusaria: a ação ligada ainda está aberta)
        const { editor, gerente, investigacao } = await levarAcaoCorretivaAte("ABERTO");

        // Chama
        await chamar(gerente, "POST", `/api/contencoes/${investigacao.id}/cancelar`, 404, {
            motivo: "Tentativa de cancelar a investigação pela rota da contenção.",
        });

        // Confere
        expect(await chamar(editor, "GET", `/api/investigacoes/${investigacao.id}`, 200)).toMatchObject({
            estado: "ABERTO",
        });
    });
});

describe("DELETE /contencoes/:id", () => {
    it("recusa com 404 o id de uma classificação, que continua existindo (B23, RN-20)", async () => {
        // Prepara (o editor se inclui como colaborador, RN-18; pela rota dela, excluir exige CLASSIFICAR, que ele não tem)
        const { editor, aprovador, classificacao } = await levarClassificacaoAte("RASCUNHO");
        await chamar(editor, "POST", `/api/registros/${classificacao.id}/colaboradores`, 200, {
            colaboradores: [editor.usuario.id],
        });

        // Chama
        await chamar(editor, "DELETE", `/api/contencoes/${classificacao.id}`, 404);

        // Confere
        expect(await chamar(aprovador, "GET", `/api/classificacoes/${classificacao.id}`, 200)).toMatchObject({
            estado: "RASCUNHO",
        });
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
        expect(resposta).toMatchObject({ estado: "ABERTO" });
        expect(await prisma.registro.findUnique({ where: { id: contencao.id } })).toMatchObject({ portaoAtual: 0 });
        expect(await prisma.aprovacao.findMany({ where: { registroId: contencao.id } })).toEqual([]);
        expect(
            await prisma.auditoria.findMany({ where: { entidadeId: contencao.id, acao: "RETIRAR_DA_APROVACAO" } }),
        ).toMatchObject([{ usuarioId: editor.usuario.id }]);
        await chamar(editor, "POST", `/api/contencoes/${contencao.id}/submeter`, 200);
    });

    it("recusa com 404 o id de uma classificação, que continua em aprovação (B23, RN-20)", async () => {
        // Prepara (o editor entra como colaborador com a classificação aberta, RN-47; pela rota dela, retirar exige
        // CLASSIFICAR, que ele não tem)
        const { editor, aprovador, classificacao } = await levarClassificacaoAte("ABERTO");
        await chamar(editor, "POST", `/api/registros/${classificacao.id}/colaboradores`, 200, {
            colaboradores: [editor.usuario.id],
        });
        await chamar(aprovador, "POST", `/api/classificacoes/${classificacao.id}/submeter`, 200);

        // Chama
        await chamar(editor, "POST", `/api/contencoes/${classificacao.id}/retirar`, 404);

        // Confere
        expect(await chamar(aprovador, "GET", `/api/classificacoes/${classificacao.id}`, 200)).toMatchObject({
            estado: "EM_APROVACAO",
        });
    });
});
