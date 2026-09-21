import { PortaoAprovacao } from "../entidades/portoes-aprovacao.js";
import { TipoRegistro } from "../entidades/tipos-registro.js";

export const portoesPorTipo: Record<TipoRegistro, PortaoAprovacao[]> = {
    NAO_CONFORMIDADE: ["FECHAMENTO"],
    CLASSIFICACAO: ["UNICA"],
    CONTENCAO: ["UNICA"],
    INVESTIGACAO: ["UNICA"],
    ACAO_CORRETIVA: ["PLANO"],
    VERIFICACAO: []
}