import { defineConfig } from "vitest/config";

export default defineConfig({
    test: {
        globalSetup: "src/testes/global-setup.ts",
        setupFiles: ["src/testes/setup-ambiente.ts", "src/testes/limpar-banco.ts"],

        //Por que está desligado: todos os arquivos usam o mesmo banco, e o TRUNCATE de um apagaria os dados do outro.
        //Quando mudar: se a suíte ficar lenta, dar um banco para cada worker.
        fileParallelism: false,
    },
});
