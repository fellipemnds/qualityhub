import fastifyCookie from "@fastify/cookie";
import fastifyHelmet from "@fastify/helmet";
import fastifyJwt from "@fastify/jwt";
import fastifyRateLimit from "@fastify/rate-limit";
import fastifySwagger from "@fastify/swagger";
import Fastify from "fastify";
import {
    hasZodFastifySchemaValidationErrors,
    jsonSchemaTransform,
    serializerCompiler,
    validatorCompiler,
    type ZodTypeProvider,
} from "fastify-type-provider-zod";
import { ZodError, z } from "zod";
import { atribuicaoRoutes } from "./compartilhado/atribuicao/atribuicao.routes.js";
import { AppError, MuitasTentativasError } from "./compartilhado/errors/errors.js";
import { interfaceDaDocumentacao } from "./interface-documentacao.js";
import { authRoutes } from "./modulos/auth/auth.routes.js";
import { COOKIE_SESSAO } from "./modulos/auth/cookie-sessao.js";
import { acaoCorretivaRoutes } from "./modulos/nc/acao-corretiva/acao-corretiva.routes.js";
import { classificacaoRoutes } from "./modulos/nc/classificacao/classificacao.routes.js";
import { contencaoRoutes } from "./modulos/nc/contencao/contencao.routes.js";
import { investigacaoRoutes } from "./modulos/nc/investigacao/investigacao.routes.js";
import { ncRoutes } from "./modulos/nc/nc/nc.routes.js";
import { verificacaoRoutes } from "./modulos/nc/verificacao/verificacao.routes.js";
import { usuarioRoutes } from "./modulos/usuario/usuario.routes.js";

const app = Fastify({
    // Nos testes, só "warn" para cima: some o log de cada requisição, mas o erro de um 500 continua aparecendo
    logger: { level: process.env.NODE_ENV === "test" ? "warn" : "info" },
    routerOptions: { ignoreTrailingSlash: true },
});

app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

// A API só aceita corpo JSON: um formulário de outro site manda text/plain sem o preflight do navegador (TRD §4.2, B20)
app.removeContentTypeParser("text/plain");

const jwtSecret = process.env.JWT_SECRET;

// Segredo curto pode ser descoberto por força bruta, e com ele qualquer um forja um token (auditoria L8)
if (!jwtSecret || jwtSecret.length < 32) {
    throw new Error("JWT_SECRET precisa estar definida em .env, com pelo menos 32 caracteres");
}

// Cabeçalhos de segurança em toda resposta (auditoria R3). O padrão do helmet serve para uma API que só devolve JSON
app.register(fastifyHelmet);
app.register(fastifyCookie);
// Só nas rotas que pedem (config.rateLimit), hoje o login. O erro é o nosso, para a resposta sair no formato de sempre
app.register(fastifyRateLimit, { global: false, errorResponseBuilder: () => new MuitasTentativasError() });
app.register(fastifyJwt, {
    secret: jwtSecret,
    cookie: { cookieName: COOKIE_SESSAO, signed: false },
    verify: { onlyCookie: true },
});
// O OpenAPI montado a partir dos schemas das rotas, de entrada e de resposta (TRD §7.2, ADR-37): é dele que o Orval gera o
// cliente do frontend. Registrado antes das rotas, para enxergar todas. Só monta o documento (app.swagger()); quem o
// publica em /api/docs é a interface, só em desenvolvimento. OpenAPI 3.1, e não 3.0: no 3.0 não existe o tipo null, e o 204
// sairia documentado com corpo (o Orval também converte tudo para 3.1 ao ler: github.com/orval-labs/orval/pull/3981)
app.register(fastifySwagger, {
    openapi: { openapi: "3.1.0", info: { title: "QualityHub API", version: "1.0.0" } },
    transform: jsonSchemaTransform,
});
app.register(interfaceDaDocumentacao, { ligada: process.env.NODE_ENV === "development" });
// Toda rota da API sob /api (TRD §7.1): o nginx entrega o frontend em "/" e repassa "/api" ao backend
app.register(
    async (api) => {
        // Para saber se o servidor está de pé, sem login. Testar o banco também fica para a D1, quando houver quem pergunte
        api.withTypeProvider<ZodTypeProvider>().get(
            "/saude",
            { schema: { response: { 200: z.object({ status: z.literal("ok") }) } } },
            async () => ({ status: "ok" as const }),
        );
        api.register(authRoutes);
        api.register(usuarioRoutes);
        api.register(ncRoutes);
        api.register(atribuicaoRoutes);
        api.register(contencaoRoutes);
        api.register(classificacaoRoutes);
        api.register(investigacaoRoutes);
        api.register(acaoCorretivaRoutes);
        api.register(verificacaoRoutes);
    },
    { prefix: "/api" },
);

const MENSAGENS_ERRO_CLIENTE: Record<number, string> = {
    400: "Corpo da requisição inválido.",
    413: "Corpo da requisição grande demais.",
    415: "Formato não aceito: envie o corpo em JSON.",
};

app.setErrorHandler((erro, request, reply) => {
    if (erro instanceof ZodError) {
        return reply.status(400).send({
            mensagem: "Dados inválidos",
            error: erro.issues,
        });
    }

    if (hasZodFastifySchemaValidationErrors(erro)) {
        return reply.status(400).send({
            mensagem: "Dados inválidos",
            error: erro.validation,
        });
    }

    if (erro instanceof AppError) {
        // Sem detalhes, o campo "error" sai "undefined" e o JSON omite ele.
        return reply.status(erro.statusCode).send({ mensagem: erro.message, error: erro.detalhes });
    }

    if (erro instanceof Error && "statusCode" in erro && typeof erro.statusCode === "number" && erro.statusCode < 500) {
        return reply
            .status(erro.statusCode)
            .send({ mensagem: MENSAGENS_ERRO_CLIENTE[erro.statusCode] ?? "Requisição inválida." });
    }

    request.log.error(erro);
    return reply.status(500).send({ mensagem: "Erro interno do servidor." });
});

export { app };
