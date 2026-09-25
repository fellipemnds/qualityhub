import { defineConfig } from "vitest/config";

export default defineConfig({
    test: {
        globalSetup: "src/testes/global-setup.ts",
        setupFiles: "src/testes/setup-ambiente.ts",
    },
});
