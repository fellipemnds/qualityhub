import { describe, expect, it } from "vitest";
import { app } from "../../app.js";
import { prisma } from "../../compartilhado/prisma/cliente.js";
import { chamar, ncPublicada, perfisDeFora } from "../../testes/cenarios.js";
import { loginComo } from "../../testes/fabricas.js";

function novoUsuario(setorId: number, papeis: string[] = ["EDITOR"]) {
    return { nome: "Pessoa Nova", email: "pessoa.nova@teste.com", papeis, setorId };
}

describe("POST /usuarios", () => {
    it("o admin cria o usuário e recebe o convite", async () => {
        // Prepara
        const { admin } = await perfisDeFora();

        // Chama
        const resposta = await chamar(admin, "POST", "/api/usuarios", 201, novoUsuario(admin.usuario.setorId));

        // Confere
        expect(resposta).toEqual({ id: expect.any(String), tokenConvite: expect.any(String) });
    });

    it("responde 404 quando o setor não existe, e não 500 (L6)", async () => {
        // Prepara
        const { admin } = await perfisDeFora();

        // Chama
        const resposta = await chamar(admin, "POST", "/api/usuarios", 404, novoUsuario(999999));

        // Confere
        expect(resposta).toEqual({ mensagem: "O setor não existe ou não foi encontrado." });
    });

    it("recusa quem não é ADMIN (403)", async () => {
        // Prepara
        const editor = await loginComo("editor");

        // Chama
        await chamar(editor, "POST", "/api/usuarios", 403, novoUsuario(editor.usuario.setorId));
    });

    it("recusa quem não tem papel nenhum: lista vazia nega, não libera (403)", async () => {
        // Prepara
        const { semPapel } = await perfisDeFora();

        // Chama
        await chamar(semPapel, "POST", "/api/usuarios", 403, novoUsuario(semPapel.usuario.setorId));
    });

    it("recusa usuário sem papéis", async () => {
        // Prepara
        const { admin } = await perfisDeFora();

        // Chama
        const resposta = await chamar(admin, "POST", "/api/usuarios", 400, novoUsuario(admin.usuario.setorId, []));

        // Confere
        expect(resposta).toMatchObject({
            mensagem: "Dados inválidos",
            error: expect.arrayContaining([expect.objectContaining({ instancePath: "/papeis" })]),
        });
    });
});

describe("GET /usuarios", () => {
    it("acha por parte do nome ou do e-mail, sem diferenciar maiúscula, e a busca vazia acha todos", async () => {
        // Prepara
        const { admin } = await perfisDeFora();
        const maria = await chamar(admin, "POST", "/api/usuarios", 201, {
            ...novoUsuario(admin.usuario.setorId),
            nome: "Maria Souza",
            email: "maria.souza@empresa.com",
        });

        // Chama
        const porNome = await chamar(admin, "GET", "/api/usuarios?busca=MARIA", 200);
        const porEmail = await chamar(admin, "GET", "/api/usuarios?busca=%40EMPRESA", 200);
        const nenhum = await chamar(admin, "GET", "/api/usuarios?busca=ninguem", 200);
        const vazia = await chamar(admin, "GET", "/api/usuarios?busca=", 200);

        // Confere
        expect(porNome.itensDaPagina.map((u: { id: string }) => u.id)).toEqual([maria.id]);
        expect(porEmail.itensDaPagina.map((u: { id: string }) => u.id)).toEqual([maria.id]);
        expect(nenhum).toEqual({ itensDaPagina: [], proximoCursor: null });
        expect(vazia.itensDaPagina).toHaveLength(4);
    });

    it("filtra por situação: ativos e inativos", async () => {
        // Prepara (a rota de inativar vem na F4; até lá, direto no banco)
        const { admin, visualizador } = await perfisDeFora();
        await prisma.usuario.update({ where: { id: visualizador.usuario.id }, data: { desativadoEm: new Date() } });

        // Chama
        const ativos = await chamar(admin, "GET", "/api/usuarios?situacao=ATIVO", 200);
        const inativos = await chamar(admin, "GET", "/api/usuarios?situacao=INATIVO", 200);
        const todos = await chamar(admin, "GET", "/api/usuarios", 200);

        // Confere
        const ids = (pagina: { itensDaPagina: { id: string }[] }) => pagina.itensDaPagina.map((u) => u.id);
        expect(ids(inativos)).toEqual([visualizador.usuario.id]);
        expect(ids(ativos)).not.toContain(visualizador.usuario.id);
        expect(ids(ativos)).toContain(admin.usuario.id);
        expect(ids(todos)).toHaveLength(3);
    });

    it("pagina por cursor", async () => {
        // Prepara: admin, visualizador e semPapel
        const { admin } = await perfisDeFora();

        // Chama
        const primeira = await chamar(admin, "GET", "/api/usuarios?limit=2", 200);
        const segunda = await chamar(admin, "GET", `/api/usuarios?limit=2&cursor=${primeira.proximoCursor}`, 200);

        // Confere
        expect(primeira.itensDaPagina).toHaveLength(2);
        expect(segunda.itensDaPagina).toHaveLength(1);
        expect(segunda.proximoCursor).toBeNull();
    });

    it("traz o setor e os papéis, e nunca o hash da senha", async () => {
        // Prepara
        const { admin } = await perfisDeFora();

        // Chama
        const resposta = await app.inject({ method: "GET", url: "/api/usuarios", headers: admin.autenticacao });

        // Confere
        expect(resposta.body).not.toContain("senhaHash");
        expect(resposta.body).not.toContain("$2");
        expect(resposta.json().itensDaPagina).toContainEqual({
            id: admin.usuario.id,
            nome: "admin",
            email: "admin@teste.com",
            setor: { id: admin.usuario.setorId, nome: "Qualidade" },
            papeis: ["ADMIN"],
            criadoEm: expect.any(String),
            desativadoEm: null,
        });
    });

    it("recusa quem não é ADMIN (403)", async () => {
        // Prepara
        const gerente = await loginComo("gerente");

        // Chama e confere
        await chamar(gerente, "GET", "/api/usuarios", 403);
    });
});

describe("GET /usuarios/:id", () => {
    it("traz o usuário com o setor e os papéis", async () => {
        // Prepara
        const { admin } = await perfisDeFora();
        const qa = await loginComo("qa");

        // Chama
        const resposta = await chamar(admin, "GET", `/api/usuarios/${qa.usuario.id}`, 200);

        // Confere
        expect(resposta).toMatchObject({ id: qa.usuario.id, nome: "qa", papeis: ["EDITOR", "APROVADOR"] });
        expect(resposta).not.toHaveProperty("senhaHash");
    });

    it("responde 404 quando o usuário não existe", async () => {
        // Prepara
        const { admin } = await perfisDeFora();

        // Chama e confere
        await chamar(admin, "GET", "/api/usuarios/00000000-0000-0000-0000-000000000000", 404);
    });

    it("recusa quem não é ADMIN antes de buscar: não revela se o usuário existe (403)", async () => {
        // Prepara
        const gerente = await loginComo("gerente");

        // Chama e confere: o mesmo 403 para um id que existe e um que não existe
        await chamar(gerente, "GET", `/api/usuarios/${gerente.usuario.id}`, 403);
        await chamar(gerente, "GET", "/api/usuarios/00000000-0000-0000-0000-000000000000", 403);
    });
});

describe("PATCH /usuarios/:id", () => {
    it("o admin troca o nome e o setor, e a resposta sai no formato do detalhe", async () => {
        // Prepara (a rota de setores vem na F6; até lá, direto no banco)
        const { admin, visualizador } = await perfisDeFora();
        const producao = await prisma.setor.create({ data: { nome: "Produção" } });

        // Chama
        const resposta = await chamar(admin, "PATCH", `/api/usuarios/${visualizador.usuario.id}`, 200, {
            nome: "Visualizador Renomeado",
            setorId: producao.id,
        });

        // Confere
        expect(resposta).toMatchObject({
            id: visualizador.usuario.id,
            nome: "Visualizador Renomeado",
            setor: { id: producao.id, nome: "Produção" },
            papeis: ["VISUALIZADOR"],
        });
    });

    it("registra na auditoria o antes e o depois, sem a senha", async () => {
        // Prepara
        const { admin, visualizador } = await perfisDeFora();

        // Chama
        await chamar(admin, "PATCH", `/api/usuarios/${visualizador.usuario.id}`, 200, { nome: "Outro Nome" });

        // Confere
        const linhas = await prisma.auditoria.findMany({
            where: { entidadeId: visualizador.usuario.id, acao: "EDITAR" },
        });
        expect(linhas).toMatchObject([
            {
                entidade: "USUARIO",
                usuarioId: admin.usuario.id,
                antes: { nome: "visualizador", setorId: visualizador.usuario.setorId },
                depois: { nome: "Outro Nome", setorId: visualizador.usuario.setorId },
            },
        ]);
        expect(JSON.stringify(linhas)).not.toContain("senhaHash");
    });

    it("edita também um usuário inativo: corrigir o cadastro de quem saiu não traz risco", async () => {
        // Prepara (a rota de inativar vem na F4; até lá, direto no banco)
        const { admin, visualizador } = await perfisDeFora();
        await prisma.usuario.update({ where: { id: visualizador.usuario.id }, data: { desativadoEm: new Date() } });

        // Chama e confere
        await chamar(admin, "PATCH", `/api/usuarios/${visualizador.usuario.id}`, 200, { nome: "Quem Saiu" });
    });

    it("responde 404 quando o setor não existe, e o usuário não muda (L6)", async () => {
        // Prepara
        const { admin, visualizador } = await perfisDeFora();

        // Chama
        const resposta = await chamar(admin, "PATCH", `/api/usuarios/${visualizador.usuario.id}`, 404, {
            nome: "Não Deveria Gravar",
            setorId: 999999,
        });

        // Confere
        expect(resposta).toEqual({ mensagem: "O setor não existe ou não foi encontrado." });
        expect(await chamar(admin, "GET", `/api/usuarios/${visualizador.usuario.id}`, 200)).toMatchObject({
            nome: "visualizador",
        });
    });

    it("responde 404 quando o usuário não existe", async () => {
        // Prepara
        const { admin } = await perfisDeFora();

        // Chama e confere
        await chamar(admin, "PATCH", "/api/usuarios/00000000-0000-0000-0000-000000000000", 404, { nome: "Ninguém" });
    });

    it("recusa o e-mail: é o login da pessoa, e não se edita por aqui (400)", async () => {
        // Prepara
        const { admin, visualizador } = await perfisDeFora();

        // Chama e confere
        await chamar(admin, "PATCH", `/api/usuarios/${visualizador.usuario.id}`, 400, { email: "novo@teste.com" });
    });

    it("recusa quem não é ADMIN antes de buscar (403)", async () => {
        // Prepara
        const gerente = await loginComo("gerente");

        // Chama e confere
        await chamar(gerente, "PATCH", `/api/usuarios/${gerente.usuario.id}`, 403, { nome: "Gerente" });
    });
});

describe("POST /usuarios/:id/papeis", () => {
    it("o admin concede um papel, e ele vale na próxima requisição da pessoa", async () => {
        // Prepara
        const { admin, visualizador } = await perfisDeFora();
        await chamar(visualizador, "POST", "/api/nc", 403, { titulo: "Ainda sem poder" });

        // Chama
        const resposta = await chamar(admin, "POST", `/api/usuarios/${visualizador.usuario.id}/papeis`, 200, {
            papel: "EDITOR",
        });

        // Confere: a resposta traz os papéis atuais, e a sessão dela já enxerga o papel novo (B7)
        expect(resposta.papeis).toEqual(["VISUALIZADOR", "EDITOR"]);
        await chamar(visualizador, "POST", "/api/nc", 201, { titulo: "Agora pode" });
    });

    it("registra na auditoria os papéis de antes e de depois", async () => {
        // Prepara
        const { admin, visualizador } = await perfisDeFora();

        // Chama
        await chamar(admin, "POST", `/api/usuarios/${visualizador.usuario.id}/papeis`, 200, { papel: "EDITOR" });

        // Confere
        expect(
            await prisma.auditoria.findMany({ where: { entidadeId: visualizador.usuario.id, acao: "CONCEDER_PAPEL" } }),
        ).toMatchObject([
            {
                entidade: "USUARIO",
                usuarioId: admin.usuario.id,
                antes: { papeis: ["VISUALIZADOR"] },
                depois: { papeis: ["VISUALIZADOR", "EDITOR"] },
            },
        ]);
    });

    it("conceder um papel que a pessoa já tem não muda nada nem vai para a auditoria", async () => {
        // Prepara
        const { admin, visualizador } = await perfisDeFora();

        // Chama
        const resposta = await chamar(admin, "POST", `/api/usuarios/${visualizador.usuario.id}/papeis`, 200, {
            papel: "VISUALIZADOR",
        });

        // Confere
        expect(resposta.papeis).toEqual(["VISUALIZADOR"]);
        expect(await prisma.auditoria.count({ where: { acao: "CONCEDER_PAPEL" } })).toBe(0);
    });

    it("recusa um papel que não existe (400)", async () => {
        // Prepara
        const { admin, visualizador } = await perfisDeFora();

        // Chama e confere
        await chamar(admin, "POST", `/api/usuarios/${visualizador.usuario.id}/papeis`, 400, { papel: "SUPERUSUARIO" });
    });

    it("responde 404 quando o usuário não existe", async () => {
        // Prepara
        const { admin } = await perfisDeFora();

        // Chama e confere
        await chamar(admin, "POST", "/api/usuarios/00000000-0000-0000-0000-000000000000/papeis", 404, {
            papel: "EDITOR",
        });
    });

    it("recusa quem não é ADMIN, mesmo concedendo a si mesmo (403)", async () => {
        // Prepara
        const gerente = await loginComo("gerente");

        // Chama e confere
        await chamar(gerente, "POST", `/api/usuarios/${gerente.usuario.id}/papeis`, 403, { papel: "ADMIN" });
    });
});

describe("DELETE /usuarios/:id/papeis/:papel", () => {
    it("o admin revoga um papel, e ele deixa de valer na próxima requisição da pessoa", async () => {
        // Prepara
        const { admin } = await perfisDeFora();
        const editor = await loginComo("editor");

        // Chama
        const resposta = await chamar(admin, "DELETE", `/api/usuarios/${editor.usuario.id}/papeis/EDITOR`, 200);

        // Confere (B7: o papel é lido do banco a cada requisição)
        expect(resposta.papeis).toEqual([]);
        await chamar(editor, "POST", "/api/nc", 403, { titulo: "Já sem poder" });
    });

    it("revogar um aprovador de uma NC aberta falha e responde 409 com uma lista", async () => {
        // Prepara
        const { editor, aprovador, nc } = await ncPublicada();
        const { admin } = await perfisDeFora();
        const ncAtualizada = await chamar(editor, "GET", `/api/nc/${nc.id}`, 200);

        // Chama
        const resposta = await chamar(
            admin,
            "DELETE",
            `/api/usuarios/${aprovador.usuario.id}/papeis/${"APROVADOR"}`,
            409,
        );

        // Confere
        expect(resposta.error).toEqual([
            { id: ncAtualizada.id, codigo: ncAtualizada.codigo, tipo: ncAtualizada.tipo, estado: ncAtualizada.estado },
        ]);
        expect(await chamar(admin, "GET", `/api/usuarios/${aprovador.usuario.id}`, 200)).toMatchObject({
            papeis: ["APROVADOR"],
        });
    });

    it("o último ADMIN não revoga o próprio papel ADMIN (409, RN-43)", async () => {
        // Prepara
        const admin = await loginComo("admin");

        // Chama
        await chamar(admin, "DELETE", `/api/usuarios/${admin.usuario.id}/papeis/${"ADMIN"}`, 409);

        // Confere
        expect(await chamar(admin, "GET", `/api/usuarios/${admin.usuario.id}`, 200)).toMatchObject({
            papeis: ["ADMIN"],
        });
    });

    it("admin concede ADMIN a outro usuário e revoga o papel ADMIN de si mesmo e recebe 200", async () => {
        // Prepara
        const admin = await loginComo("admin");
        const visualizador = await loginComo("visualizador");
        await chamar(admin, "POST", `/api/usuarios/${visualizador.usuario.id}/papeis`, 200, { papel: "ADMIN" });

        // Chama
        await chamar(admin, "DELETE", `/api/usuarios/${admin.usuario.id}/papeis/${"ADMIN"}`, 200);

        // Confere
        expect(await chamar(visualizador, "GET", `/api/usuarios/${admin.usuario.id}`, 200)).toMatchObject({
            papeis: [],
        });
        expect(await chamar(visualizador, "GET", `/api/usuarios/${visualizador.usuario.id}`, 200)).toMatchObject({
            papeis: ["VISUALIZADOR", "ADMIN"],
        });
    });

    it("registra na auditoria os papéis de antes e de depois", async () => {
        // Prepara
        const { admin } = await perfisDeFora();
        const qa = await loginComo("qa");

        // Chama
        await chamar(admin, "DELETE", `/api/usuarios/${qa.usuario.id}/papeis/EDITOR`, 200);

        // Confere
        expect(
            await prisma.auditoria.findMany({ where: { entidadeId: qa.usuario.id, acao: "REVOGAR_PAPEL" } }),
        ).toMatchObject([{ antes: { papeis: ["EDITOR", "APROVADOR"] }, depois: { papeis: ["APROVADOR"] } }]);
    });

    it("revogar um papel que a pessoa não tem não muda nada nem vai para a auditoria", async () => {
        // Prepara
        const { admin, visualizador } = await perfisDeFora();

        // Chama
        const resposta = await chamar(admin, "DELETE", `/api/usuarios/${visualizador.usuario.id}/papeis/GERENTE`, 200);

        // Confere
        expect(resposta.papeis).toEqual(["VISUALIZADOR"]);
        expect(await prisma.auditoria.count({ where: { acao: "REVOGAR_PAPEL" } })).toBe(0);
    });

    it("recusa quem não é ADMIN (403)", async () => {
        // Prepara
        const gerente = await loginComo("gerente");
        const editor = await loginComo("editor");

        // Chama e confere
        await chamar(gerente, "DELETE", `/api/usuarios/${editor.usuario.id}/papeis/EDITOR`, 403);
    });
});

describe("GET /pessoas", () => {
    it("acha pessoas ativas por parte do nome, sem diferenciar maiúscula", async () => {
        // Prepara (a rota de inativar vem na F4; até lá, direto no banco)
        const editor = await loginComo("editor");
        const aprovador = await loginComo("aprovador");
        await prisma.usuario.update({ where: { id: aprovador.usuario.id }, data: { desativadoEm: new Date() } });

        // Chama
        const porNome = await chamar(editor, "GET", "/api/pessoas?busca=EDIT", 200);
        const todas = await chamar(editor, "GET", "/api/pessoas", 200);

        // Confere: quem foi inativado não aparece para ninguém escolher
        expect(porNome.itensDaPagina.map((p: { id: string }) => p.id)).toEqual([editor.usuario.id]);
        expect(todas.itensDaPagina.map((p: { id: string }) => p.id)).toEqual([editor.usuario.id]);
    });

    it("filtra por papel: o painel de atribuições pede só os aprovadores", async () => {
        // Prepara
        const editor = await loginComo("editor");
        const aprovador = await loginComo("aprovador");
        const qa = await loginComo("qa");

        // Chama
        const resposta = await chamar(editor, "GET", "/api/pessoas?papel=APROVADOR", 200);

        // Confere
        expect(resposta.itensDaPagina.map((p: { id: string }) => p.id).sort()).toEqual(
            [aprovador.usuario.id, qa.usuario.id].sort(),
        );
    });

    it("traz só o id, o nome e o setor: e-mail e papéis são do ADMIN (E3)", async () => {
        // Prepara
        const editor = await loginComo("editor");

        // Chama
        const resposta = await chamar(editor, "GET", "/api/pessoas", 200);

        // Confere
        expect(resposta.itensDaPagina).toEqual([
            { id: editor.usuario.id, nome: "editor", setor: { id: editor.usuario.setorId, nome: "Qualidade" } },
        ]);
    });

    it("não busca no e-mail: quem não é ADMIN não descobre o e-mail de ninguém tentando letra por letra", async () => {
        // Prepara
        const editor = await loginComo("editor");

        // Chama
        const resposta = await chamar(editor, "GET", "/api/pessoas?busca=%40teste.com", 200);

        // Confere
        expect(resposta.itensDaPagina).toEqual([]);
    });

    it("pagina por cursor", async () => {
        // Prepara
        const editor = await loginComo("editor");
        await loginComo("aprovador");
        await loginComo("gerente");

        // Chama
        const primeira = await chamar(editor, "GET", "/api/pessoas?limit=2", 200);
        const segunda = await chamar(editor, "GET", `/api/pessoas?limit=2&cursor=${primeira.proximoCursor}`, 200);

        // Confere
        expect(primeira.itensDaPagina).toHaveLength(2);
        expect(segunda.itensDaPagina).toHaveLength(1);
        expect(segunda.proximoCursor).toBeNull();
    });

    it("o visualizador também busca; quem só é ADMIN, ou não tem papel, não (403)", async () => {
        // Prepara
        const { admin, visualizador, semPapel } = await perfisDeFora();

        // Chama e confere
        await chamar(visualizador, "GET", "/api/pessoas", 200);
        await chamar(admin, "GET", "/api/pessoas", 403);
        await chamar(semPapel, "GET", "/api/pessoas", 403);
    });
});
