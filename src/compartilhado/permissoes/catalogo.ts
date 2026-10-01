import type { Acao } from "../entidades/acoes.js";
import type { Papel } from "../entidades/papeis.js";

export const catalogo: Record<Acao, Papel[]> = {
    GERENCIAR_RASCUNHO: ["EDITOR", "GERENTE"],
    PUBLICAR: ["EDITOR", "GERENTE"],
    CANCELAR: ["APROVADOR", "GERENTE"],
    CLASSIFICAR: ["APROVADOR", "GERENTE"],
    SUBMETER: ["EDITOR", "GERENTE"],
    APROVAR: ["APROVADOR", "GERENTE"],
    CONCLUIR_VERIFICACAO: ["APROVADOR", "GERENTE"],
    REABRIR: ["APROVADOR", "GERENTE"],
    GERENCIAR_COLABORADORES: ["EDITOR", "GERENTE"],
    DEFINIR_APROVADOR: ["APROVADOR", "GERENTE"],
    // Com o item em aprovação (RN-47): o catálogo diz quem; o limite de estado fica no service
    TROCAR_APROVADOR_EM_APROVACAO: ["GERENTE"],
    GERENCIAR_USUARIOS: ["ADMIN"],
    COMENTAR: ["EDITOR", "APROVADOR", "GERENTE"],
    GERAR_RELATORIOS: ["GERENTE"],
    VISUALIZAR: ["VISUALIZADOR", "EDITOR", "APROVADOR", "GERENTE"],
};
