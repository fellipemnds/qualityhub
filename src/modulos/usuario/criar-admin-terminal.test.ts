import { PassThrough, Readable } from "node:stream";
import { describe, expect, it, vi } from "vitest";
import { prisma } from "../../compartilhado/prisma/cliente.js";
import { criarAdminPeloTerminal } from "./criar-admin-terminal.js";

// As respostas já "digitadas", uma por linha, e o que a casca escreveu na tela
function terminalFalso(respostas: string[]) {
    const entrada = Readable.from(respostas.map((resposta) => `${resposta}\n`));
    const saida = new PassThrough();
    let tela = "";
    saida.on("data", (pedaco) => {
        tela += pedaco;
    });

    return { entrada, saida, lerTela: () => tela };
}

describe("criarAdminPeloTerminal", () => {
    it("cria o ADMIN e mostra o link quando a pessoa confirma", async () => {
        // Prepara
        const terminal = terminalFalso(["Ana Souza", "ana@teste.com", "Qualidade", "S"]);

        // Chama
        const codigo = await criarAdminPeloTerminal({
            entrada: terminal.entrada,
            saida: terminal.saida,
            urlDoSistema: "https://qh.teste",
        });

        // Confere
        expect(codigo).toBe(0);
        expect(terminal.lerTela()).toMatch(/https:\/\/qh\.teste\/definir-senha#token=[0-9a-f]{64}/);
        expect(await prisma.usuario.count()).toBe(1);
    });

    it("não grava nada quando a pessoa não confirma", async () => {
        // Prepara
        const terminal = terminalFalso(["Ana Souza", "ana@teste.com", "Qualidade", "n"]);

        // Chama
        const codigo = await criarAdminPeloTerminal({
            entrada: terminal.entrada,
            saida: terminal.saida,
            urlDoSistema: "https://qh.teste",
        });

        // Confere
        expect(codigo).toBe(0);
        expect(terminal.lerTela()).toContain("Nada foi feito.");
        expect(await prisma.usuario.count()).toBe(0);
    });

    it("recusa um e-mail inválido antes de pedir a confirmação", async () => {
        // Prepara
        const terminal = terminalFalso(["Ana Souza", "isso-não-é-email", "Qualidade"]);

        // Chama
        const codigo = await criarAdminPeloTerminal({
            entrada: terminal.entrada,
            saida: terminal.saida,
            urlDoSistema: "https://qh.teste",
        });

        // Confere
        expect(codigo).toBe(1);
        expect(terminal.lerTela()).not.toContain("Confirma?");
        expect(await prisma.usuario.count()).toBe(0);
    });

    it("mostra a recusa da regra quando o setor está desativado", async () => {
        // Prepara
        await prisma.setor.create({ data: { nome: "Antigo", desativadoEm: new Date() } });
        const terminal = terminalFalso(["Ana Souza", "ana@teste.com", "Antigo", "s"]);

        // Chama
        const codigo = await criarAdminPeloTerminal({
            entrada: terminal.entrada,
            saida: terminal.saida,
            urlDoSistema: "https://qh.teste",
        });

        // Confere
        expect(codigo).toBe(1);
        expect(terminal.lerTela()).toContain("Este setor está desativado: escolha outro.");
    });

    it("deixa estourar o erro inesperado (o banco fora do ar)", async () => {
        // Prepara
        vi.spyOn(prisma, "$transaction").mockRejectedValueOnce(new Error("banco fora do ar"));
        const terminal = terminalFalso(["Ana Souza", "ana@teste.com", "Qualidade", "S"]);

        // Chama e Confere

        await expect(
            criarAdminPeloTerminal({
                entrada: terminal.entrada,
                saida: terminal.saida,
                urlDoSistema: "https://qh.teste",
            }),
        ).rejects.toThrow("banco fora do ar");
    });
});
