import { defineConfig } from "vitest/config";

export default defineConfig({
    test: {
        globalSetup: "src/testes/global-setup.ts",
        setupFiles: ["src/testes/setup-ambiente.ts", "src/testes/limpar-banco.ts"],

        //Por que está desligado: todos os arquivos usam o mesmo banco, e o TRUNCATE de um apagaria os dados do outro. Quando mudar: se a suíte ficar lenta, dar um banco para cada worker.
        fileParallelism: false,

        //Por que 15 s: o padrão do Vitest é 5 s, e os cenários mais longos (NC fechada, ação executada, verificação concluída) passam de 2,5 s numa máquina livre. Com a máquina ocupada, estouravam os 5 s e falhavam às vezes.
        testTimeout: 15_000,

        // Por que UTC: Para evitar um bug de fuso horário, já que a máquina de desenvolvimento está no fuso de São Paulo, o servidor e o CI estão em UTC.
        env: { TZ: "UTC" },

        // Cobertura (CONSTRAINTS §2 e §3): só na suíte completa, pelo npm run test:cobertura. Mede o código de produção:
        // fora o gerado pelo Prisma e os próprios testes
        coverage: {
            provider: "v8",
            include: ["src/**/*.ts"],
            exclude: ["src/generated/**", "src/testes/**", "src/**/*.test.ts"],
            reporter: ["text-summary", "cobertura"],
            // Medido em 2026-10-05: 95,16% das linhas. A trava é 0,5 abaixo (CONSTRAINTS §2): absorve a variação de
            // um arquivo sem relação com a mudança. Quando a cobertura subir, sobe o número junto
            thresholds: { lines: 94.66 },
        },
    },
});
