import { beforeEach } from "vitest";
import { prisma } from "../compartilhado/prisma/cliente.js";

beforeEach(async () => {
    const [linha] = await prisma.$queryRaw<{ current_database: string }[]>`SELECT current_database()`;

    if (linha?.current_database !== "test") {
        throw new Error(
            `Trava de segurança: os testes estão conectados no banco "${linha?.current_database}", e não no "test" do container. Nada foi apagado.`,
        );
    }

    const linhas = await prisma.$queryRaw<
        {
            tablename: string;
        }[]
    >`SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename <> '_prisma_migrations'`;

    const tabelas = linhas.map((t) => `"${t.tablename}"`).join(", ");

    const comando = `TRUNCATE TABLE ${tabelas} RESTART IDENTITY CASCADE`;

    await prisma.$executeRawUnsafe(comando);
});
