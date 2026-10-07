// O que pode ser gravado na trilha de auditoria (TRD §6, pendência 1 do changelog). Na tabela, a coluna continua texto,
// porque a auditoria vai servir módulos futuros; no código, só passa o que está aqui: um nome digitado errado não compila
export const AcaoAuditada = {
    // Ciclo de vida
    CRIAR_RASCUNHO: "CRIAR_RASCUNHO",
    EDITAR: "EDITAR",
    EXCLUIR_RASCUNHO: "EXCLUIR_RASCUNHO",
    PUBLICAR: "PUBLICAR",
    SUBMETER: "SUBMETER",
    RETIRAR_DA_APROVACAO: "RETIRAR_DA_APROVACAO",
    APROVADO: "APROVADO",
    REPROVADO: "REPROVADO",
    CANCELAR: "CANCELAR",
    REABRIR: "REABRIR",
    FINALIZAR_EXECUCAO: "FINALIZAR_EXECUCAO",
    GERAR_VERIFICACAO: "GERAR_VERIFICACAO",
    CONCLUIR_VERIFICACAO: "CONCLUIR_VERIFICACAO",
    // Atribuições
    ADICIONAR_COLABORADORES: "ADICIONAR_COLABORADORES",
    REMOVER_COLABORADORES: "REMOVER_COLABORADORES",
    DEFINIR_APROVADOR: "DEFINIR_APROVADOR",
    // Usuários e sessão
    CRIAR_USUARIO: "CRIAR_USUARIO",
    DEFINIR_SENHA: "DEFINIR_SENHA",
    LOGIN: "LOGIN",
    SAIR_DE_TODOS: "SAIR_DE_TODOS",
} as const;

export type AcaoAuditada = (typeof AcaoAuditada)[keyof typeof AcaoAuditada];
