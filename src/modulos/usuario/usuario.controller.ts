import type { FastifyReply, FastifyRequest } from "fastify";
import type { Papel } from "../../compartilhado/entidades/papeis.js";
import type {
    CriarUsuarioInput,
    EditarUsuarioInput,
    PapelInput,
    PessoaFiltrosListagemInput,
    UsuarioFiltrosListagemInput,
} from "./usuario.schema.js";
import { usuarioService } from "./usuario.service.js";

export const usuarioController = {
    async criar(request: FastifyRequest<{ Body: CriarUsuarioInput }>, reply: FastifyReply) {
        const dados = request.body;
        const { id, papeis } = request.user;

        const registro = await usuarioService.criarUsuario({ id, papeis }, dados);

        const contrato = { id: registro.usuario.id, tokenConvite: registro.token };

        // O token do convite é uma credencial: nada no caminho (navegador, proxy) guarda a resposta
        return reply.header("Cache-Control", "no-store").status(201).send(contrato);
    },

    async listar(request: FastifyRequest<{ Querystring: UsuarioFiltrosListagemInput }>, reply: FastifyReply) {
        const usuarios = await usuarioService.listarUsuarios(request.user, request.query);

        return reply.status(200).send(usuarios);
    },

    async listarPessoas(request: FastifyRequest<{ Querystring: PessoaFiltrosListagemInput }>, reply: FastifyReply) {
        const pessoas = await usuarioService.listarPessoas(request.user, request.query);

        return reply.status(200).send(pessoas);
    },

    async buscarPorId(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
        const usuario = await usuarioService.buscarUsuario(request.user, request.params.id);

        return reply.status(200).send(usuario);
    },

    async editar(request: FastifyRequest<{ Params: { id: string }; Body: EditarUsuarioInput }>, reply: FastifyReply) {
        const usuario = await usuarioService.editarUsuario(request.user, request.params.id, request.body);

        return reply.status(200).send(usuario);
    },

    async gerarConvite(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
        const convite = await usuarioService.gerarConvite(request.user, request.params.id);

        return reply.header("Cache-Control", "no-store").status(200).send(convite);
    },

    async inativar(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
        const usuario = await usuarioService.inativarUsuario(request.user, request.params.id);

        return reply.status(200).send(usuario);
    },

    async reativar(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
        const usuario = await usuarioService.reativarUsuario(request.user, request.params.id);

        return reply.status(200).send(usuario);
    },

    async concederPapel(request: FastifyRequest<{ Params: { id: string }; Body: PapelInput }>, reply: FastifyReply) {
        const usuario = await usuarioService.concederPapel(request.user, request.params.id, request.body.papel);

        return reply.status(200).send(usuario);
    },

    async revogarPapel(request: FastifyRequest<{ Params: { id: string; papel: Papel } }>, reply: FastifyReply) {
        const usuario = await usuarioService.revogarPapel(request.user, request.params.id, request.params.papel);

        return reply.status(200).send(usuario);
    },
};
