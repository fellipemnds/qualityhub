import type { TipoRegistro } from "../entidades/tipos-registro.js";

export const prefixoPorTipo: Record<TipoRegistro, string> = {
    NAO_CONFORMIDADE: "NC",
    CLASSIFICACAO: "CL",
    CONTENCAO: "CT",
    INVESTIGACAO: "IV",
    ACAO_CORRETIVA: "AC",
    VERIFICACAO: "VE",
};
