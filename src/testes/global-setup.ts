import { execSync } from "node:child_process";
import { PostgreSqlContainer } from "@testcontainers/postgresql";
import type { TestProject } from "vitest/node";

declare module "vitest" {
    interface ProvidedContext {
        urlBanco: string;
    }
}

export async function setup(project: TestProject) {
    const container = await new PostgreSqlContainer("postgres:17-alpine").start();

    const url = container.getConnectionUri();

    execSync("npx prisma migrate deploy", { env: { ...process.env, DATABASE_URL: url }, stdio: "inherit" });

    project.provide("urlBanco", url);

    return async () => {
        await container.stop();
    };
}
