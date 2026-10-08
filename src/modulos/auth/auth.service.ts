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

// A recusa de todo link que não vale (inexistente, usado, revogado, expirado, de outro tipo, de pessoa inativa, ou que
// perdeu uma corrida): uma mensagem só, para quem tenta não descobrir qual foi o caso (F5)
const LINK_NAO_VALE = "Este link não vale mais. Peça um novo ao administrador.";

export const authService = {
    // Define a senha pelo convite (também serve para redefinir). Toda recusa sai com a mesma mensagem (F5). O bcrypt roda
    // fora da transação, para não prender uma conexão do banco (~250 ms); a transação é curta, trava o usuário primeiro
    // e só então o convite, e cada condição está no próprio UPDATE: quem perdeu uma corrida recebe a mesma recusa
    async definirSenha(token: string, senha: string) {
        const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
        const convite = await tokenAcessoRepository.buscarPorHash(prisma, tokenHash);

        if (
            convite === null ||
            convite.tipo !== "CONVITE" ||
            convite.usadoEm !== null ||
            convite.revogadoEm !== null ||
            convite.expiraEm <= new Date()
        ) {
            throw new ValidacaoError(LINK_NAO_VALE);
        }

        // Custo 12: cada +1 dobra o tempo de quebrar a senha se o banco vazar (auditoria L2)
        const senhaHash = await bcrypt.hash(senha, 12);

        await prisma.$transaction(async (tx) => {
            if (!(await usuarioRepository.definirSenha(tx, convite.usuarioId, senhaHash))) {
                throw new ValidacaoError(LINK_NAO_VALE);
            }
            if (!(await tokenAcessoRepository.marcarComoUsado(tx, convite.id))) {
                throw new ValidacaoError(LINK_NAO_VALE);
            }

            // O id do convite liga esta linha ao GERAR_CONVITE: quem gerou o link e quando
            await auditoriaRepository.registrar(tx, {
                entidade: EntidadeAuditada.USUARIO,
                entidadeId: convite.usuarioId,
                acao: "DEFINIR_SENHA",
                usuarioId: convite.usuarioId,
                antes: undefined,
                depois: { conviteId: convite.id },
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
