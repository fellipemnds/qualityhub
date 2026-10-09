import { auditoriaRepository } from "../../compartilhado/auditoria/auditoria.repository.js";
import { EntidadeAuditada } from "../../compartilhado/auditoria/entidades-auditadas.js";
import { TransicaoInvalidaError } from "../../compartilhado/errors/errors.js";
import type { ClientePrisma } from "../../compartilhado/prisma/tipos.js";
import { emitirConvite } from "../auth/emitir-convite.js";
import { setorRepository } from "../setor/setor.repository.js";
import { usuarioRepository } from "./usuario.repository.js";
import { usuarioPapelRepository } from "./usuario-papel.repository.js";

// Vai em todo registro de auditoria do script: na trilha, separa o que veio dele do que veio da tela
const ORIGEM = "criar-admin";

async function criarPessoa(tx: ClientePrisma, dados: { nome: string; email: string }, setorId: number) {
    const pessoa = await usuarioRepository.criar(tx, { nome: dados.nome, email: dados.email, setorId });
    await auditoriaRepository.registrar(tx, {
        entidade: EntidadeAuditada.USUARIO,
        entidadeId: pessoa.id,
        acao: "CRIAR_USUARIO",
        usuarioId: pessoa.id,
        antes: undefined,
        depois: { nome: pessoa.nome, email: pessoa.email, setorId, origem: ORIGEM },
    });

    return pessoa;
}

// O miolo do script do primeiro acesso (npm run criar-admin): garante que o e-mail seja um ADMIN ativo, com um convite
// novo. Serve para o primeiro ADMIN e para a recuperação (o único ADMIN perdeu a senha ou saiu); rodar de novo não
// estraga nada. Não há ninguém logado: a pessoa é a autora de tudo o que acontece com ela (auditoria e papel)
export async function garantirAdmin(tx: ClientePrisma, dados: { nome: string; email: string; setor: string }) {
    // O setor, pelo nome (sem diferenciar maiúscula): o que existe é reaproveitado, e o desativado não entra em escolha
    // nova (RN-44). O setorBuscado nulo é o "criei agora", usado na auditoria lá embaixo
    const setorBuscado = await setorRepository.buscarPorNome(tx, dados.setor);
    // Relido com a trava de escolha: um desativar no meio espera, ou é esperado (B35)
    if (setorBuscado !== null && (await setorRepository.travarParaEscolha(tx, setorBuscado.id))?.desativadoEm != null) {
        throw new TransicaoInvalidaError("Este setor está desativado: escolha outro.");
    }
    const setor = setorBuscado ?? (await setorRepository.criar(tx, dados.setor));

    // A pessoa, pelo e-mail. Antes de ler, as sessões dela caem (na recuperação, quem entrou com a senha antiga sai), e o
    // UPDATE trava a linha até o fim da transação: quem chegar ao mesmo tempo (outra rodada, uma rota) espera, e o que se
    // lê não muda no meio. A nova é criada; a que existe mantém o nome (corrigir cadastro é pela tela)
    await usuarioRepository.encerrarSessoesPorEmail(tx, dados.email);
    const pessoaExistente = await usuarioRepository.buscarPorEmail(tx, dados.email);
    const pessoa = pessoaExistente ?? (await criarPessoa(tx, dados, setor.id));
    const papeisAntes = pessoaExistente ? pessoaExistente.papeisRecebidos.map((recebido) => recebido.papel) : [];

    // Quem já existe é levado ao estado pedido: o setor informado e ativa. O setor muda antes de reativar, para a pessoa
    // nunca ficar ativa num setor desativado
    if (pessoaExistente !== null) {
        if (pessoaExistente.setorId !== setor.id) {
            await usuarioRepository.atualizar(tx, pessoa.id, { setorId: setor.id });
            await auditoriaRepository.registrar(tx, {
                entidade: EntidadeAuditada.USUARIO,
                entidadeId: pessoa.id,
                acao: "EDITAR",
                usuarioId: pessoa.id,
                antes: { setorId: pessoaExistente.setorId },
                depois: { setorId: setor.id, origem: ORIGEM },
            });
        }
        if (pessoaExistente.desativadoEm !== null) {
            await usuarioRepository.reativar(tx, pessoa.id);
            await auditoriaRepository.registrar(tx, {
                entidade: EntidadeAuditada.USUARIO,
                entidadeId: pessoa.id,
                acao: "REATIVAR_USUARIO",
                usuarioId: pessoa.id,
                antes: { desativadoEm: pessoaExistente.desativadoEm },
                depois: { desativadoEm: null, origem: ORIGEM },
            });
        }
    }

    // A auditoria do setor criado só agora: a autora é a pessoa, que não existia quando o setor nasceu
    if (setorBuscado === null) {
        await auditoriaRepository.registrar(tx, {
            entidade: EntidadeAuditada.SETOR,
            entidadeId: String(setor.id),
            acao: "CRIAR_SETOR",
            usuarioId: pessoa.id,
            antes: undefined,
            depois: { nome: setor.nome, origem: ORIGEM },
        });
    }

    // O ADMIN só se faltar: a chave da tabela de papéis é (pessoa, papel), e conceder de novo seria erro no banco. Na
    // trilha, os papéis de antes e de depois, como no concederPapel das rotas
    if (!papeisAntes.includes("ADMIN")) {
        await usuarioPapelRepository.concederPapel(tx, {
            usuarioId: pessoa.id,
            papel: "ADMIN",
            concedidoPorId: pessoa.id,
        });
        await auditoriaRepository.registrar(tx, {
            entidade: EntidadeAuditada.USUARIO,
            entidadeId: pessoa.id,
            acao: "CONCEDER_PAPEL",
            usuarioId: pessoa.id,
            antes: { papeis: papeisAntes },
            depois: { papeis: [...papeisAntes, "ADMIN"], origem: ORIGEM },
        });
    }

    // Sempre um convite novo (revoga os anteriores). Na trilha, o id do convite, nunca o token
    const { token, convite } = await emitirConvite(tx, pessoa.id);
    await auditoriaRepository.registrar(tx, {
        entidade: EntidadeAuditada.USUARIO,
        entidadeId: pessoa.id,
        acao: "GERAR_CONVITE",
        usuarioId: pessoa.id,
        antes: undefined,
        depois: { conviteId: convite.id, expiraEm: convite.expiraEm, origem: ORIGEM },
    });

    // O token em claro só existe aqui: a casca o põe no link, uma vez só
    return { token, expiraEm: convite.expiraEm };
}
