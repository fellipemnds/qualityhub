import Fastify from "fastify";
import fastifyJwt from "@fastify/jwt";
import { validatorCompiler, serializerCompiler } from "fastify-type-provider-zod";
import { ZodError } from "zod";
import { AppError } from "./compartilhado/errors/errors.js";
import { authRoutes } from "./modulos/auth/auth.routes.js";
import { usuarioRoutes } from "./modulos/usuario/usuario.routes.js";
import { ncRoutes } from "./modulos/nc/nc/nc.routes.js";
import { atribuicaoRoutes } from "./compartilhado/atribuicao/atribuicao.routes.js";
import { contencaoRoutes } from "./modulos/nc/contencao/contencao.routes.js";
import { classificacaoRoutes } from "./modulos/nc/classificacao/classificacao.routes.js";
import { investigacaoRoutes } from "./modulos/nc/investigacao/investigacao.routes.js";
import { acaoCorretivaRoutes } from "./modulos/nc/acao-corretiva/acao-corretiva.routes.js";
import { verificacaoRoutes } from "./modulos/nc/verificacao/verificacao.routes.js";

const app = Fastify({
    logger: true,
    ignoreTrailingSlash: true
});

app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

const jwtSecret = process.env["JWT_SECRET"];

if (!jwtSecret) {
    throw new Error("JWT_SECRET não está definida em .env");
}

app.register(fastifyJwt, { secret: jwtSecret });
app.get("/", async () => {
    return { status: "Servidor online" };
})
app.register(authRoutes);
app.register(usuarioRoutes);
app.register(ncRoutes);
app.register(atribuicaoRoutes);
app.register(contencaoRoutes);
app.register(classificacaoRoutes);
app.register(investigacaoRoutes);
app.register(acaoCorretivaRoutes);
app.register(verificacaoRoutes);

app.setErrorHandler((erro, request, reply) => {
    if (erro instanceof ZodError) {
        return reply.status(400).send({
            mensagem: "Dados inválidos",
            error: erro.issues
        })
    }

    if (erro instanceof Error && "code" in erro && erro.code === "FST_ERR_VALIDATION") {
        const erroValidacao = erro as Error & { code: string; validation: unknown[] };
        return reply.status(400).send({
            mensagem: "Dados inválidos",
            error: erroValidacao.validation
        })
    }

    if (erro instanceof AppError) {
        return reply.status(erro.statusCode).send({ mensagem: erro.message });
    }

    app.log.error(erro);
    return reply.status(500).send({ mensagem: "Erro interno do servidor." });
})

export { app };