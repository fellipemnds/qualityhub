import { describe, expect, it } from "vitest";
import { app } from "../app.js";
import type { Papel } from "../compartilhado/entidades/papeis.js";
import { loginComo, PERFIS, type Perfil } from "./fabricas.js";

describe("loginComo", () => {
    it.each(Object.keys(PERFIS) as Perfil[])("devolve um token com os papéis do perfil %s", async (perfil) => {
        // Chama
        const { token } = await loginComo(perfil);

        // Confere
        const conteudo = app.jwt.decode<{ papeis: Papel[] }>(token);
        const esperados: Papel[] = PERFIS[perfil];
        expect(conteudo?.papeis.sort()).toEqual([...esperados].sort());
    });

    it("permite dois perfis no mesmo teste", async () => {
        // Chama
        const editor = await loginComo("editor");
        const aprovador = await loginComo("aprovador");

        // Confere
        expect(editor.usuario.id).not.toBe(aprovador.usuario.id);
    });
});
