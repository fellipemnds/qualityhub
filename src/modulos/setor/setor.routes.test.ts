import { describe, expect, it } from "vitest";
import { prisma } from "../../compartilhado/prisma/cliente.js";
import { chamar, perfisDeFora } from "../../testes/cenarios.js";
import { loginComo } from "../../testes/fabricas.js";

// O setor "Qualidade" nasce com os usuários das fábricas; os outros, pela rota
async function criarSetores() {
    const { admin, visualizador, semPapel } = await perfisDeFora();
    const producao = await chamar(admin, "POST", "/api/setores", 201, { nome: "Produção" });
    const almoxarifado = await chamar(admin, "POST", "/api/setores", 201, { nome: "Almoxarifado" });
    // A rota de desativar vem na F6b; até lá, direto no banco
    const antigo = await prisma.setor.create({ data: { nome: "Setor Antigo", desativadoEm: new Date() } });
    return { admin, visualizador, semPapel, producao, almoxarifado, antigo };
}

describe("GET /setores", () => {
    it("quem está logado vê os setores ativos, em ordem de nome (RN-44)", async () => {
        // Prepara
        const { semPapel } = await criarSetores();

        // Chama
        const resposta = await chamar(semPapel, "GET", "/api/setores", 200);

        // Confere: o desativado some das opções
        expect(resposta.map((s: { nome: string }) => s.nome)).toEqual(["Almoxarifado", "Produção", "Qualidade"]);
        expect(resposta[0]).toEqual({ id: expect.any(Number), nome: "Almoxarifado", desativadoEm: null });
    });

    it("o ADMIN também vê os desativados, se pedir", async () => {
        // Prepara
        const { admin, antigo } = await criarSetores();

        // Chama
        const inativos = await chamar(admin, "GET", "/api/setores?situacao=INATIVO", 200);
        const todos = await chamar(admin, "GET", "/api/setores?situacao=TODOS", 200);

        // Confere
        expect(inativos.map((s: { id: number }) => s.id)).toEqual([antigo.id]);
        expect(todos).toHaveLength(4);
    });

    it("quem não é ADMIN não pede os desativados (403)", async () => {
        // Prepara
        const { visualizador } = await criarSetores();

        // Chama e confere
        await chamar(visualizador, "GET", "/api/setores?situacao=TODOS", 403);
    });
});

describe("POST /setores", () => {
    it("o ADMIN cria um setor, e a criação vai para a auditoria", async () => {
        // Prepara
        const { admin } = await perfisDeFora();

        // Chama
        const resposta = await chamar(admin, "POST", "/api/setores", 201, { nome: "Manutenção" });

        // Confere
        expect(resposta).toEqual({ id: expect.any(Number), nome: "Manutenção", desativadoEm: null });
        expect(
            await prisma.auditoria.findMany({ where: { entidadeId: String(resposta.id), acao: "CRIAR_SETOR" } }),
        ).toMatchObject([{ entidade: "SETOR", usuarioId: admin.usuario.id, depois: { nome: "Manutenção" } }]);
    });

    it("recusa um nome que já existe (409)", async () => {
        // Prepara
        const { admin } = await perfisDeFora();

        // Chama e confere: "Qualidade" é o setor das fábricas; a maiúscula não faz outro setor
        await chamar(admin, "POST", "/api/setores", 409, { nome: "Qualidade" });
        await chamar(admin, "POST", "/api/setores", 409, { nome: "qualidade" });
    });

    it("com o nome de um setor desativado, sugere reativá-lo em vez de criar outro (409)", async () => {
        // Prepara
        const { admin } = await criarSetores();

        // Chama
        const resposta = await chamar(admin, "POST", "/api/setores", 409, { nome: "Setor Antigo" });

        // Confere
        expect(resposta.mensagem).toContain("reative");
    });

    it("recusa o nome em branco (400) e quem não é ADMIN (403)", async () => {
        // Prepara
        const { admin } = await perfisDeFora();
        const gerente = await loginComo("gerente");

        // Chama e confere
        await chamar(admin, "POST", "/api/setores", 400, { nome: "   " });
        await chamar(gerente, "POST", "/api/setores", 403, { nome: "Do Gerente" });
    });
});

describe("PATCH /setores/:id", () => {
    it("o ADMIN renomeia, e a auditoria guarda o nome de antes e o de depois", async () => {
        // Prepara
        const { admin, producao } = await criarSetores();

        // Chama
        const resposta = await chamar(admin, "PATCH", `/api/setores/${producao.id}`, 200, { nome: "Produção Linha 2" });

        // Confere
        expect(resposta).toEqual({ id: producao.id, nome: "Produção Linha 2", desativadoEm: null });
        expect(
            await prisma.auditoria.findMany({ where: { entidadeId: String(producao.id), acao: "RENOMEAR_SETOR" } }),
        ).toMatchObject([{ antes: { nome: "Produção" }, depois: { nome: "Produção Linha 2" } }]);
    });

    it("sem nome, ou com o mesmo nome, não muda nada nem vai para a auditoria", async () => {
        // Prepara
        const { admin, producao } = await criarSetores();

        // Chama
        const semNome = await chamar(admin, "PATCH", `/api/setores/${producao.id}`, 200, {});
        const mesmoNome = await chamar(admin, "PATCH", `/api/setores/${producao.id}`, 200, { nome: "Produção" });

        // Confere
        expect(semNome).toEqual(producao);
        expect(mesmoNome).toEqual(producao);
        expect(await prisma.auditoria.count({ where: { acao: "RENOMEAR_SETOR" } })).toBe(0);
    });

    it("recusa o nome de outro setor (409), mas aceita o próprio nome, até com outra maiúscula", async () => {
        // Prepara
        const { admin, producao } = await criarSetores();

        // Chama e confere
        await chamar(admin, "PATCH", `/api/setores/${producao.id}`, 409, { nome: "Almoxarifado" });
        await chamar(admin, "PATCH", `/api/setores/${producao.id}`, 409, { nome: "almoxarifado" });
        await chamar(admin, "PATCH", `/api/setores/${producao.id}`, 200, { nome: "PRODUÇÃO" });
    });

    it("responde 404 quando o setor não existe, 400 com id que não é número, e 403 para quem não é ADMIN", async () => {
        // Prepara
        const { admin, producao } = await criarSetores();
        const gerente = await loginComo("gerente");

        // Chama e confere
        await chamar(admin, "PATCH", "/api/setores/999999", 404, { nome: "Fantasma" });
        await chamar(admin, "PATCH", "/api/setores/abc", 400, { nome: "Fantasma" });
        await chamar(gerente, "PATCH", `/api/setores/${producao.id}`, 403, { nome: "Do Gerente" });
    });
});
