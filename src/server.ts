import Fastify from "fastify";
import { prisma } from "./lib/prisma.js";

const app = Fastify({ logger:true });

app.get("/", async () => {
    return { status: "QualityHub API no ar" };
});

app.get("/nao-conformidades", async () => {
    const ncs = await prisma.naoConformidade.findMany({
        include: { setor: true },
    });
    return ncs;
})

app.listen({ port: 3333 }, (erro, endereco) => {
    if(erro) {
        app.log.error(erro);
        process.exit(1);
    }
    console.log(`Servidor rodando em: ${endereco}`);
});