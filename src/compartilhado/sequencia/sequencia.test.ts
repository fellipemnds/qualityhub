import { describe, expect, it } from "vitest";
import { chamar } from "../../testes/cenarios.js";
import { loginComo } from "../../testes/fabricas.js";

describe("Sequência de códigos", () => {
    it("cria um código com um contador já existente", async () => {
        const editor = await loginComo("editor");

        const corpo = {
            titulo: "Vazamento de óleo na linha 2",
            descricao: "Identificado vazamento de óleo hidráulico durante inspeção de rotina na linha 2.",
            requisitoViolado: "Procedimento PO-07, item 4.3 - inspeção de recebimento",
            processoAfetado: "Linha de Produção 2",
            setorId: editor.usuario.setorId,
            detectadoEm: "2026-09-10",
            origem: "OPERACAO",
        };

        const nc = await chamar(editor, "POST", "/nc", 201, corpo);
        expect(await chamar(editor, "POST", `/nc/${nc.id}/publicar`, 200)).toMatchObject({
            estado: "ABERTO",
            codigo: expect.stringMatching(/^NC-\d{4}-0001$/),
        });

        const rascunhos = [];
        const esperado = [];

        for (let i = 0; i < 10; i++) {
            const rascunho = await chamar(editor, "POST", "/nc", 201, corpo);
            rascunhos.push(rascunho);
            esperado.push(`NC-${new Date().getFullYear()}-${String(i + 2).padStart(4, "0")}`);
        }

        const publicados = await Promise.all(
            rascunhos.map((rascunho) => chamar(editor, "POST", `/nc/${rascunho.id}/publicar`, 200)),
        );

        const codigos = publicados.map((nc) => nc.codigo);
        codigos.sort();

        for (let i = 0; i < 10; i++) {
            expect(codigos[i]).toBe(esperado[i]);
        }
    });

    // B15 (esquema-backend.md §7): sem o contador, o FOR UPDATE não trava nada e as publicações simultâneas dão 500.
    // O it.fails fica verde enquanto o bug existir; no conserto (A3), trocar para it.
    it.fails("cria um código com o banco vazio", async () => {
        const editor = await loginComo("editor");

        const corpo = {
            titulo: "Vazamento de óleo na linha 2",
            descricao: "Identificado vazamento de óleo hidráulico durante inspeção de rotina na linha 2.",
            requisitoViolado: "Procedimento PO-07, item 4.3 - inspeção de recebimento",
            processoAfetado: "Linha de Produção 2",
            setorId: editor.usuario.setorId,
            detectadoEm: "2026-09-10",
            origem: "OPERACAO",
        };

        const rascunhos = [];
        const esperado = [];

        for (let i = 0; i < 10; i++) {
            const rascunho = await chamar(editor, "POST", "/nc", 201, corpo);
            rascunhos.push(rascunho);
            esperado.push(`NC-${new Date().getFullYear()}-${String(i + 1).padStart(4, "0")}`);
        }

        const publicados = await Promise.all(
            rascunhos.map((rascunho) => chamar(editor, "POST", `/nc/${rascunho.id}/publicar`, 200)),
        );

        const codigos = publicados.map((nc) => nc.codigo);
        codigos.sort();

        for (let i = 0; i < 10; i++) {
            expect(codigos[i]).toBe(esperado[i]);
        }
    });
});
