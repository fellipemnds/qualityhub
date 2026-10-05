import { describe, expect, it } from "vitest";
import type { Papel } from "../compartilhado/entidades/papeis.js";
import { prisma } from "../compartilhado/prisma/cliente.js";
import { loginComo, PERFIS, type Perfil } from "./fabricas.js";

describe("loginComo", () => {
    it.each(Object.keys(PERFIS) as Perfil[])("concede os papéis do perfil %s", async (perfil) => {
        // Chama
        const { usuario } = await loginComo(perfil);

        // Confere
        const concedidos = await prisma.usuarioPapel.findMany({ where: { usuarioId: usuario.id } });
        const esperados: Papel[] = PERFIS[perfil];
        expect(concedidos.map((c) => c.papel).sort()).toEqual([...esperados].sort());
    });

    it("permite dois perfis no mesmo teste", async () => {
        // Chama
        const editor = await loginComo("editor");
        const aprovador = await loginComo("aprovador");

        // Confere
        expect(editor.usuario.id).not.toBe(aprovador.usuario.id);
    });
});
