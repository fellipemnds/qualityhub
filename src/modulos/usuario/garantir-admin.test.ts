import { describe, expect, it } from "vitest";
import { prisma } from "../../compartilhado/prisma/cliente.js";
import { abrirDuasConexoes, chamar } from "../../testes/cenarios.js";
import { criarUsuario, loginComo } from "../../testes/fabricas.js";
import { garantirAdmin } from "./garantir-admin.js";

const usuario = {
    nome: "Admin Teste",
    email: "admin@teste.com",
    setor: "Qualidade",
};

describe("garantirAdmin", () => {
    it("e-mail novo, setor novo", async () => {
        // Prepara
        // Banco está vazio

        // Chama
        const resultado = await prisma.$transaction((tx) => garantirAdmin(tx, usuario));

        // Confere
        const pessoa = await prisma.usuario.findUnique({
            where: {
                email: usuario.email,
            },
            select: {
                nome: true,
                email: true,
                desativadoEm: true,
                setor: true,
                papeisRecebidos: true,
                tokensAcesso: {
                    select: {
                        tipo: true,
                        expiraEm: true,
                        revogadoEm: true,
                    },
                },
                registrosAuditoria: {
                    select: {
                        depois: true,
                    },
                },
            },
        });
        expect(pessoa).toMatchObject({
            nome: usuario.nome,
            email: usuario.email,
            setor: { nome: usuario.setor },
            desativadoEm: null,
            papeisRecebidos: [{ papel: "ADMIN" }],
            tokensAcesso: [{ tipo: "CONVITE", revogadoEm: null, expiraEm: resultado.expiraEm }],
        });
        expect(pessoa?.registrosAuditoria.length).toBeGreaterThan(0);
        for (const registroAuditoria of pessoa?.registrosAuditoria ?? []) {
            expect(registroAuditoria.depois).toMatchObject({ origem: "criar-admin" });
        }
        expect(resultado).toEqual({ token: expect.any(String), expiraEm: expect.any(Date) });
    });

    it("e-mail novo, setor que já existe com outra grafia", async () => {
        // Prepara
        const setorExistente = await prisma.setor.create({ data: { nome: "Qualidade" } });

        // Chama
        await prisma.$transaction((tx) => garantirAdmin(tx, { ...usuario, setor: "qualidade" }));

        // Confere
        expect(await prisma.setor.count()).toBe(1);
        const pessoa = await prisma.usuario.findUnique({ where: { email: usuario.email }, select: { setorId: true } });
        expect(pessoa?.setorId).toBe(setorExistente.id);
        expect(await prisma.auditoria.count({ where: { acao: "CRIAR_SETOR" } })).toBe(0);
    });

    it("pessoa ativa, sem ADMIN", async () => {
        // Prepara
        const editor = await loginComo("editor");

        // Chama
        await prisma.$transaction((tx) =>
            garantirAdmin(tx, { nome: "Editor Teste", email: editor.usuario.email, setor: "Qualidade" }),
        );

        // Confere
        const pessoa = await prisma.usuario.findUnique({
            where: { email: editor.usuario.email },
            select: { nome: true, papeisRecebidos: { select: { papel: true }, orderBy: { papel: "asc" } } },
        });
        expect(pessoa).toMatchObject({
            nome: editor.usuario.nome,
            papeisRecebidos: [{ papel: "EDITOR" }, { papel: "ADMIN" }],
        });
        expect(await prisma.auditoria.findFirst({ where: { acao: "CONCEDER_PAPEL" } })).toMatchObject({
            antes: { papeis: ["EDITOR"] },
            depois: { papeis: ["EDITOR", "ADMIN"] },
        });
        expect(await prisma.auditoria.count({ where: { acao: "CRIAR_USUARIO" } })).toBe(0);
    });

    it("pessoa ativa, já ADMIN (recuperação, ou rodar duas vezes)", async () => {
        // Prepara
        const admin = await loginComo("admin");

        // Chama
        await prisma.$transaction((tx) =>
            garantirAdmin(tx, { nome: admin.usuario.nome, email: admin.usuario.email, setor: "Qualidade" }),
        );

        // Confere
        const pessoa = await prisma.usuario.findUnique({
            where: { email: admin.usuario.email },
            select: { papeisRecebidos: { select: { papel: true } } },
        });
        expect(pessoa).toMatchObject({
            papeisRecebidos: [{ papel: "ADMIN" }],
        });
        expect(await prisma.auditoria.count({ where: { acao: "CONCEDER_PAPEL" } })).toBe(0);
        await chamar(admin, "GET", "/api/auth/eu", 401);
    });

    it("pessoa inativa", async () => {
        // Prepara
        const { usuario } = await criarUsuario({ email: "saiu@teste.com" });
        await prisma.usuario.update({
            where: { id: usuario.id },
            data: { desativadoEm: new Date() },
        });

        // Chama
        await prisma.$transaction((tx) =>
            garantirAdmin(tx, { nome: usuario.nome, email: usuario.email, setor: "Manutenção" }),
        );

        // Confere
        const pessoa = await prisma.usuario.findUnique({
            where: { id: usuario.id },
            select: {
                desativadoEm: true,
                setor: { select: { nome: true, id: true } },
                papeisRecebidos: { select: { papel: true } },
            },
        });
        expect(pessoa).toMatchObject({
            desativadoEm: null,
            setor: { nome: "Manutenção" },
            papeisRecebidos: [{ papel: "ADMIN" }],
        });
        expect(await prisma.auditoria.count({ where: { acao: "REATIVAR_USUARIO" } })).toBe(1);
        expect(await prisma.auditoria.findFirst({ where: { acao: "EDITAR" } })).toMatchObject({
            antes: { setorId: usuario.setorId },
            depois: { setorId: pessoa?.setor.id },
        });
    });

    it("setor informado está desativado", async () => {
        // Prepara
        await prisma.setor.create({ data: { nome: "Antigo", desativadoEm: new Date() } });

        // Chama e Confere
        await expect(prisma.$transaction((tx) => garantirAdmin(tx, { ...usuario, setor: "Antigo" }))).rejects.toThrow(
            "Este setor está desativado: escolha outro.",
        );
        expect(await prisma.usuario.count()).toBe(0);
        expect(await prisma.auditoria.count()).toBe(0);
    });

    it("duas rodadas ao mesmo tempo deixam um convite só valendo", async () => {
        // Prepara:
        const admin = await loginComo("admin");

        // Chama
        await abrirDuasConexoes();
        await Promise.all([
            prisma.$transaction((tx) =>
                garantirAdmin(tx, { nome: admin.usuario.nome, email: admin.usuario.email, setor: "Qualidade" }),
            ),
            prisma.$transaction((tx) =>
                garantirAdmin(tx, { nome: admin.usuario.nome, email: admin.usuario.email, setor: "Qualidade" }),
            ),
        ]);

        // Confere
        expect(await prisma.tokenAcesso.count({ where: { usuarioId: admin.usuario.id, revogadoEm: null } })).toBe(1);
    });
});
