// O que pode ser gravado na trilha de auditoria (TRD §6, pendência 1 do changelog). Na tabela, a coluna continua texto,
// porque a auditoria vai servir módulos futuros; no código, só passa o que está aqui: um nome digitado errado não compila.
// Só o tipo, sem o objeto "as const" dos outros enums: nada no código lê a lista em tempo de execução. Quando algo ler
// (um filtro da auditoria, por exemplo), o objeto volta com quem o usar
export type AcaoAuditada =
    // Ciclo de vida
    | "CRIAR_RASCUNHO"
    | "EDITAR"
    | "EXCLUIR_RASCUNHO"
    | "PUBLICAR"
    | "SUBMETER"
    | "RETIRAR_DA_APROVACAO"
    | "APROVADO"
    | "REPROVADO"
    | "CANCELAR"
    | "REABRIR"
    | "FINALIZAR_EXECUCAO"
    | "GERAR_VERIFICACAO"
    | "CONCLUIR_VERIFICACAO"
    // Atribuições
    | "ADICIONAR_COLABORADORES"
    | "REMOVER_COLABORADORES"
    | "DEFINIR_APROVADOR"
    // Usuários e sessão
    | "CRIAR_USUARIO"
    | "GERAR_CONVITE"
    | "CONCEDER_PAPEL"
    | "REVOGAR_PAPEL"
    | "INATIVAR_USUARIO"
    | "REATIVAR_USUARIO"
    | "DEFINIR_SENHA"
    | "LOGIN"
    | "SAIR_DE_TODOS";
