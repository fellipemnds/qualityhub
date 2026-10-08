import { describe, expect, it } from "vitest";
import { chamar, perfisDeFora } from "../../testes/cenarios.js";
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
