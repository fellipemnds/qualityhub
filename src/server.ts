import Fastify from "fastify";
import { ncRoutes } from "./modules/nao-conformidade/nc.routes.js";
import { AppError } from "./lib/errors.js";
import { ZodError } from "zod";

const app = Fastify({
    logger: true,
    ignoreTrailingSlash: true,
});

app.get("/", async () => {
    return { status: "QualityHub API no ar" };
});

app.register(ncRoutes);

app.setErrorHandler((erro, request, reply) => {
    if (erro instanceof ZodError) {
        return reply.status(400).send({
            mensagem: "Dados inválidos",
            erros: erro.issues,
        })
    }

    if (erro instanceof AppError) {
        return reply.status(erro.statusCode).send({ mensagem: erro.message })
    }

    app.log.error(erro);
    return reply.status(500).send({ mensagem: "Erro interno do servidor" })
}

)

app.listen({ port: 3333 }, (erro, endereco) => {
    if (erro) {
        app.log.error(erro);
        process.exit(1);
    }
    console.log(`Servidor rodando em: ${endereco}`);
});

