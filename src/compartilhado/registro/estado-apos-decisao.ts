import type { Decisao } from "../entidades/decisao.js";
import type { EstadoRegistro } from "../entidades/estados.js";

// Estado do item depois da decisão do aprovador. Todo tipo tem um portão só, então aprovar fecha o item, salvo o
// plano da Ação Corretiva (fecharAoAprovar: false), que volta a ABERTO para a execução
export function estadoAposDecisao(decisao: Decisao, opcoes: { fecharAoAprovar: boolean }): EstadoRegistro {
    if (decisao === "REPROVADO") return "ABERTO";
    return opcoes.fecharAoAprovar ? "FECHADO" : "ABERTO";
}
