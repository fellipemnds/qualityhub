import { describe, expect, it } from "vitest";
import { app } from "./app.js";
import { prisma } from "./compartilhado/prisma/cliente.js";
import { chamar, type Metodo, ncPublicada } from "./testes/cenarios.js";
import { loginComo } from "./testes/fabricas.js";

describe("GET /api/saude", () => {
    it("responde que o servidor está de pé, sem login", async () => {
        // Chama
        const resposta = await app.inject({ method: "GET", url: "/api/saude" });

        // Confere
        expect(resposta.statusCode).toBe(200);
        expect(resposta.json()).toEqual({ status: "ok" });
    });

    it("o GET / não existe mais: em produção, o / é do frontend (TRD §7.1)", async () => {
        // Chama
        const resposta = await app.inject({ method: "GET", url: "/" });

        // Confere
        expect(resposta.statusCode).toBe(404);
    });
});

describe("Cabeçalhos de segurança (auditoria R3)", () => {
    it("toda resposta sai com os cabeçalhos do helmet", async () => {
        // Chama
        const resposta = await app.inject({ method: "GET", url: "/api/saude" });

        // Confere: os que mais importam para a API e para os anexos que vêm no C5
        expect(resposta.headers).toMatchObject({
            "x-content-type-options": "nosniff",
            "x-frame-options": "SAMEORIGIN",
            "strict-transport-security": expect.stringContaining("max-age="),
            "content-security-policy": expect.stringContaining("frame-ancestors 'self'"),
        });
    });
});

describe("Corpo da requisição (B20, B21)", () => {
    it("corpo acima de 1 MB responde 413 com a mensagem em português, antes de chegar à rota (L4)", async () => {
        // Prepara: um JSON válido de pouco mais de 1 MB (o limite padrão do Fastify)
        const grande = JSON.stringify({ email: "a@teste.com", senha: "x".repeat(1024 * 1024) });

        // Chama
        const resposta = await app.inject({
            method: "POST",
            url: "/api/auth/login",
            headers: { "content-type": "application/json" },
            payload: grande,
        });

        // Confere
        expect(resposta.statusCode).toBe(413);
        expect(resposta.json()).toEqual({ mensagem: "Corpo da requisição grande demais." });
    });

    it("JSON malformado responde 400, não 500 (B21)", async () => {
        // Chama
        const resposta = await app.inject({
            method: "POST",
            url: "/api/auth/login",
            headers: {
                "content-type": "application/json",
            },
            payload: "{quebrado",
        });

        // Confere
        expect(resposta.statusCode).toBe(400);
        expect(resposta.json()).toEqual({ mensagem: expect.any(String) });
    });

    it("corpo text/plain responde 415 e a ação não é executada (B20)", async () => {
        // Prepara
        const editor = await loginComo("editor");

        // Chama
        const resposta = await app.inject({
            method: "POST",
            url: "/api/auth/sair-de-todos",
            headers: {
                ...editor.autenticacao,
                "content-type": "text/plain",
            },
            payload: "oi",
        });

        // Confere
        expect(resposta.statusCode).toBe(415);
        expect(resposta.json()).toEqual({ mensagem: expect.any(String) });
        expect(await prisma.auditoria.findMany({ where: { acao: "SAIR_DE_TODOS" } })).toEqual([]);
    });
});

// O contrato com o frontend (TRD §7.2, ADR-37): o OpenAPI sai dos schemas das rotas, e o Orval gera o cliente a partir dele
describe("Documentação da API (OpenAPI)", () => {
    type Resposta = { description: string; content?: unknown };
    type Operacao = { responses?: Record<string, Resposta> };
    const documento = async () => {
        await app.ready();
        return app.swagger() as { openapi: string; paths: Record<string, Record<string, Operacao>> };
    };

    it("monta o OpenAPI com as rotas da API", async () => {
        // Chama
        const doc = await documento();

        // Confere
        expect(doc.openapi).toMatch(/^3\./);
        expect(Object.keys(doc.paths)).toEqual(expect.arrayContaining(["/api/nc/{id}", "/api/auth/eu"]));
    });

    it("toda rota da API declara a resposta de sucesso: sem ela, o cliente gerado não sabe o que volta", async () => {
        // Chama
        const doc = await documento();

        // Confere: rota sem schema de resposta ganha um 200 "Default Response" sem corpo; o 204 é o único sem corpo de
        // propósito
        const declarada = ([status, resposta]: [string, Resposta]) =>
            status === "204" || (status.startsWith("2") && resposta.content !== undefined);
        const semResposta = Object.entries(doc.paths)
            .filter(([caminho]) => caminho.startsWith("/api/"))
            .flatMap(([caminho, operacoes]) =>
                Object.entries(operacoes)
                    .filter(([, operacao]) => !Object.entries(operacao.responses ?? {}).some(declarada))
                    .map(([metodo]) => `${metodo.toUpperCase()} ${caminho}`),
            );
        expect(semResposta).toEqual([]);
    });

    it("o 204 sai documentado sem corpo", async () => {
        // Chama
        const doc = await documento();

        // Confere
        expect(doc.paths["/api/nc/{id}"]?.delete?.responses?.["204"]).toEqual({ description: expect.any(String) });
    });

    it("os dias de calendário saem documentados como dia, sem hora, também nas respostas (B22)", async () => {
        // Prepara: o schema do campo na resposta 200 de uma rota
        const doc = await documento();
        type Conteudo = { "application/json": { schema: { properties: Record<string, unknown> } } };
        const campo = (caminho: string, metodo: string, nome: string) => {
            const conteudo = doc.paths[caminho]?.[metodo]?.responses?.["200"]?.content as Conteudo | undefined;
            return JSON.stringify(conteudo?.["application/json"].schema.properties[nome]);
        };

        // Confere: o que sai é "AAAA-MM-DD"; documentado como date-time, o cliente gerado recusaria a data
        for (const documentado of [
            campo("/api/nc/{id}", "get", "detectadoEm"),
            campo("/api/acoes-corretivas/{id}", "get", "prazo"),
        ]) {
            expect(documentado).toContain('"format":"date"');
            expect(documentado).not.toContain("date-time");
        }
    });

    it("todo texto e toda lista de entrada têm teto: o limite de 1 MB do corpo não basta (L4)", async () => {
        // Prepara: percorre o schema de todo corpo de entrada, inclusive os campos aninhados e os que aceitam null
        const doc = await documento();
        type No = {
            type?: string;
            format?: string;
            enum?: unknown[];
            pattern?: string;
            maxLength?: number;
            maxItems?: number;
            properties?: Record<string, No>;
            anyOf?: No[];
            items?: No;
        };
        const semTeto: string[] = [];
        const percorrer = (no: No | undefined, onde: string) => {
            if (no === undefined) return;
            // Só formato de tamanho fixo dispensa o teto: e-mail também tem formato, e cabia quase 1 MB nele (B26)
            const tamanhoFixo = no.enum !== undefined || ["uuid", "date", "date-time"].includes(no.format ?? "");
            const livre = !tamanhoFixo;
            if (no.type === "string" && livre && no.maxLength === undefined) semTeto.push(onde);
            if (no.type === "array" && no.maxItems === undefined) semTeto.push(`${onde}[]`);
            for (const [campo, filho] of Object.entries(no.properties ?? {})) percorrer(filho, `${onde}.${campo}`);
            for (const filho of no.anyOf ?? []) percorrer(filho, onde);
            percorrer(no.items, `${onde}[]`);
        };
        for (const [caminho, operacoes] of Object.entries(doc.paths)) {
            for (const [metodo, operacao] of Object.entries(operacoes)) {
                const corpo = (operacao as { requestBody?: { content: Record<string, { schema: No }> } }).requestBody;
                percorrer(corpo?.content["application/json"]?.schema, `${metodo.toUpperCase()} ${caminho}`);
            }
        }

        // Confere
        expect([...new Set(semTeto)]).toEqual([]);
    });

    it("todo corpo de entrada recusa campo desconhecido: um erro de digitação não some em silêncio (L4)", async () => {
        // Chama
        const doc = await documento();

        // Confere: z.strictObject aparece no OpenAPI como additionalProperties: false
        const aceitaQualquerCampo = Object.entries(doc.paths).flatMap(([caminho, operacoes]) =>
            Object.entries(operacoes)
                .filter(([, operacao]) => {
                    const corpo = (
                        operacao as {
                            requestBody?: { content: Record<string, { schema: { additionalProperties?: unknown } }> };
                        }
                    ).requestBody;
                    return (
                        corpo !== undefined && corpo.content["application/json"]?.schema.additionalProperties !== false
                    );
                })
                .map(([metodo]) => `${metodo.toUpperCase()} ${caminho}`),
        );
        expect(aceitaQualquerCampo).toEqual([]);
    });

    it("toda lista é paginada, menos o checklist, que tem tamanho fixo (L4)", async () => {
        // Chama
        const doc = await documento();

        // Confere: lista sem paginação devolve um array solto na resposta 200
        type Corpo = { content?: { "application/json"?: { schema?: { type?: string } } } };
        const listasSoltas = Object.entries(doc.paths)
            // O checklist tem tamanho fixo; os setores, uma lista curta e inteira para o seletor da tela (RN-44)
            .filter(([caminho]) => caminho !== "/api/nc/{id}/checklist-fechamento" && caminho !== "/api/setores")
            .flatMap(([caminho, operacoes]) =>
                Object.entries(operacoes)
                    .filter(
                        ([, operacao]) =>
                            (operacao.responses?.["200"] as Corpo | undefined)?.content?.["application/json"]?.schema
                                ?.type === "array",
                    )
                    .map(([metodo]) => `${metodo.toUpperCase()} ${caminho}`),
            );
        expect(listasSoltas).toEqual([]);
    });

    it("não expõe o portaoAtual em resposta nenhuma (D2)", async () => {
        // Chama
        const doc = await documento();

        // Confere
        expect(JSON.stringify(doc)).not.toContain("portaoAtual");
    });

    it("toda rota com {id} recusa com 404 o id de um item de outro tipo: rota nova entra sozinha (B23)", async () => {
        // Prepara: uma NC e uma contenção; a rota de NC recebe o id da contenção, e as dos filhos, o da NC
        const doc = await documento();
        const { gerente, editor, nc } = await ncPublicada();
        // Quem chama é quem pode agir na rota, para a permissão (conferida antes da busca) não responder 403 no lugar do
        // 404: as de usuário são do ADMIN; as dos itens, do gerente
        const admin = await loginComo("admin");
        const contencao = await chamar(editor, "POST", `/api/nc/${nc.id}/contencoes`, 201, {
            descricao: "Contenção para a trava do B23.",
        });
        // As rotas de /registros valem para qualquer tipo, de propósito
        const rotas = Object.entries(doc.paths)
            .filter(([caminho]) => caminho.includes("{id}") && !caminho.startsWith("/api/registros/"))
            .flatMap(([caminho, operacoes]) =>
                Object.entries(operacoes).map(([metodo, operacao]) => ({
                    metodo: metodo.toUpperCase(),
                    caminho,
                    operacao,
                })),
            );
        // Um corpo válido por ação, para a requisição passar da validação (400) e chegar ao service. Rota com corpo
        // obrigatório que não estiver aqui falha a trava, em vez de passar sem ser testada
        const corpos: Record<string, object> = {
            PATCH: {},
            decidir: { decisao: "APROVADO" },
            cancelar: { motivo: "Trava do B23." },
            reabrir: { motivo: "Trava do B23." },
            "finalizar-execucao": { diasParaVerificar: 30 },
            papeis: { papel: "EDITOR" },
        };

        // O "id de outro tipo" de cada rota: a de NC recebe o da contenção; a de setor, que tem id numérico, um número que
        // não existe; as outras, o da NC
        const idDeOutroTipo = (caminho: string) => {
            if (caminho.startsWith("/api/setores/")) return "999999";
            if (caminho.startsWith("/api/nc/")) return contencao.id;
            return nc.id;
        };

        // Chama
        const fora404: string[] = [];
        for (const { metodo, caminho, operacao } of rotas) {
            const outroTipo = idDeOutroTipo(caminho);
            const acao = metodo === "PATCH" ? "PATCH" : caminho.split("/").at(-1);
            const comCorpo = (operacao as { requestBody?: { required?: boolean } }).requestBody?.required === true;
            const resposta = await app.inject({
                method: metodo as Metodo,
                // Os outros parâmetros ganham um valor válido, para a rota chegar à busca do {id}
                url: caminho.replace("{id}", outroTipo).replace("{papel}", "EDITOR"),
                headers: (caminho.startsWith("/api/usuarios/") || caminho.startsWith("/api/setores/") ? admin : gerente)
                    .autenticacao,
                body: comCorpo ? corpos[acao ?? ""] : undefined,
            });
            if (resposta.statusCode !== 404) {
                fora404.push(`${metodo} ${caminho} → ${resposta.statusCode}`);
            }
        }

        // Confere: a lista não pode estar vazia (sem rotas, a trava passaria sem testar nada)
        expect(rotas.length).toBeGreaterThan(40);
        expect(fora404).toEqual([]);
    });
});
