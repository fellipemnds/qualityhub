import crypto from "node:crypto";
import bcrypt from "bcrypt";
import { auditoriaRepository } from "../../compartilhado/auditoria/auditoria.repository.js";
import { EntidadeAuditada } from "../../compartilhado/auditoria/entidades-auditadas.js";
import type { Ator } from "../../compartilhado/entidades/ator.js";
import { CredenciaisInvalidasError, NaoEncontradoError, ValidacaoError } from "../../compartilhado/errors/errors.js";
import { prisma } from "../../compartilhado/prisma/cliente.js";
import { usuarioRepository } from "../usuario/usuario.repository.js";
import type { AlterarEuInput } from "./auth.schema.js";
import { telaInicial } from "./tela-inicial.js";
import { tokenAcessoRepository } from "./token-acesso.repository.js";

// Hash bcrypt de custo 12 (o mesmo do definir-senha) de uma senha aleatória que ninguém sabe. Gerado na primeira vez
// que é preciso e guardado: os ~250 ms do custo 12 uma vez só, e nenhum hash escrito no código (o Semgrep acusa)
let hashFalso: Promise<string> | undefined;

function obterHashFalso() {
    hashFalso ??= bcrypt.hash(crypto.randomBytes(32).toString("hex"), 12);
    return hashFalso;
}

export const authService = {
    async definirSenha(token: string, senha: string) {
        return prisma.$transaction(async (tx) => {
            const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
            const tokenAcesso = await tokenAcessoRepository.buscarPorHash(tx, tokenHash);

            if (!tokenAcesso) {
                throw new ValidacaoError("Não foi possível processar a solicitação.");
            }

            // Revogado por um convite novo ou pela inativação (F5); a mensagem única de todo link que não vale é da F5c
            if (tokenAcesso.revogadoEm !== null) {
                throw new ValidacaoError("Este link não vale mais. Peça um novo ao administrador.");
            }

            if (tokenAcesso.usadoEm !== null) {
                throw new ValidacaoError("Este token já foi utilizado");
            }

            const agora = new Date(Date.now());
            if (tokenAcesso.expiraEm < agora) {
                throw new ValidacaoError("Token expirado.");
            }

            // Custo 12: cada +1 dobra o tempo de quebrar a senha se o banco vazar (auditoria L2)
            const senhaHash = await bcrypt.hash(senha, 12);

            // Marcar primeiro: é a trava contra o mesmo convite usado duas vezes ao mesmo tempo (B19)
            await tokenAcessoRepository.marcarComoUsado(tx, tokenAcesso.id);
            await usuarioRepository.definirSenha(tx, tokenAcesso.usuarioId, senhaHash);

            await auditoriaRepository.registrar(tx, {
                entidade: EntidadeAuditada.USUARIO,
                entidadeId: tokenAcesso.usuarioId,
                acao: "DEFINIR_SENHA",
                usuarioId: tokenAcesso.usuarioId,
                antes: undefined,
                depois: undefined,
            });
        });
    },

    // Quem está logado, com a tela em que começa e as que pode escolher (o frontend chama ao abrir)
    async eu(ator: Ator) {
        const perfil = await usuarioRepository.buscarPerfil(prisma, ator.id);
        if (perfil === null) throw new NaoEncontradoError("Item não encontrado.");

        const { papeisRecebidos, telaInicial: preferencia, ...dados } = perfil;
        const papeis = papeisRecebidos.map((usuarioPapel) => usuarioPapel.papel);

        return { ...dados, papeis, ...telaInicial(papeis, preferencia) };
    },

    // Só uma tela que os papéis permitem (fluxo-app.md §3); null volta para o padrão
    async alterarEu(ator: Ator, dados: AlterarEuInput) {
        if (dados.telaInicial !== null && !telaInicial(ator.papeis, null).telasIniciais.includes(dados.telaInicial)) {
            throw new ValidacaoError("Esta tela inicial não está entre as que os seus papéis permitem.");
        }

        await usuarioRepository.alterarTelaInicial(prisma, ator.id, dados.telaInicial);

        return authService.eu(ator);
    },

    // A versão das sessões soma 1: o autenticar recusa todo token com a versão de antes (TRD §4.1, item 6; B27)
    async sairDeTodos(ator: Ator) {
        return prisma.$transaction(async (tx) => {
            await usuarioRepository.encerrarSessoes(tx, ator.id);

            await auditoriaRepository.registrar(tx, {
                entidade: EntidadeAuditada.USUARIO,
                entidadeId: ator.id,
                acao: "SAIR_DE_TODOS",
                usuarioId: ator.id,
                antes: undefined,
                depois: undefined,
            });
        });
    },

    // Confere e-mail e senha. Toda recusa é a mesma CredenciaisInvalidasError, para quem tenta não descobrir se a conta
    // existe, se já tem senha ou se está inativa (RN-38). O sucesso fica na auditoria
    async fazerLogin(email: string, senha: string) {
        const usuario = await usuarioRepository.buscarPorEmail(prisma, email);

        // Sem usuário ou sem senha, compara com o hash falso: a resposta leva o mesmo tempo de uma senha errada, e o tempo
        // não denuncia quais e-mails têm conta (auditoria L1)
        const senhaConfere = await bcrypt.compare(senha, usuario?.senhaHash ?? (await obterHashFalso()));

        if (usuario === null || usuario.senhaHash === null || !senhaConfere || usuario.desativadoEm !== null) {
            throw new CredenciaisInvalidasError();
        }

        await auditoriaRepository.registrar(prisma, {
            entidade: EntidadeAuditada.USUARIO,
            entidadeId: usuario.id,
            acao: "LOGIN",
            usuarioId: usuario.id,
            antes: undefined,
            depois: undefined,
        });

        return usuario;
    },
};
