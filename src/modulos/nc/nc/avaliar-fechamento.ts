import type { EstadoRegistro } from "../../../compartilhado/entidades/estados.js";
import type { ItemChecklist } from "../../../compartilhado/registro/checklist.js";

// Os dois grupos da guarda (esquema §4.3). FILHOS decide a etapa "Pronta para fechamento" e a pendência "Submeter
// para fechamento"; ENVIO é preenchido depois, pelo colaborador. O submeter exige os dois
export const GrupoFechamento = {
    FILHOS: "FILHOS",
    ENVIO: "ENVIO",
} as const;

export type GrupoFechamento = (typeof GrupoFechamento)[keyof typeof GrupoFechamento];

// Os requisitos da RN-21, na ordem em que a lista sai (a da etapa da NC, fluxo-app.md §4)
export const RequisitoFechamento = {
    CLASSIFICACAO_FECHADA: "CLASSIFICACAO_FECHADA",
    INVESTIGACOES_FECHADAS: "INVESTIGACOES_FECHADAS",
    CONTENCOES_RESOLVIDAS: "CONTENCOES_RESOLVIDAS",
    RISCOS_REVISADOS: "RISCOS_REVISADOS",
    MUDANCAS_SGQ: "MUDANCAS_SGQ",
    APROVADOR_DEFINIDO: "APROVADOR_DEFINIDO",
} as const;

export type RequisitoFechamento = (typeof RequisitoFechamento)[keyof typeof RequisitoFechamento];

export type ItemFechamentoNC = ItemChecklist<RequisitoFechamento> & { grupo: GrupoFechamento };

// Um filho da NC como a guarda o vê: só o que ela precisa para decidir e para apontar o que resolve
export type FilhoNaGuarda = { id: string; codigo: string | null; estado: EstadoRegistro };

// Tudo já carregado do banco: a função não consulta nada
export type DadosFechamentoNC = {
    riscosRevisados: string | null;
    mudancasSGQ: string | null;
    temAprovador: boolean;
    classificacoes: FilhoNaGuarda[];
    investigacoes: FilhoNaGuarda[];
    contencoes: FilhoNaGuarda[];
};

// Guarda de fechamento da NC (RN-21, esquema §4.3): devolve um item por requisito, atendido ou não. Função pura — só
// olha os dados recebidos, sem banco nem relógio —, testada sem banco (avaliar-fechamento.test.ts)
export function avaliarFechamentoNC(dados: DadosFechamentoNC): ItemFechamentoNC[] {
    const temClassificacaoFechada = dados.classificacoes.some((c) => c.estado === "FECHADO");

    const temInvestigacaoFechada = dados.investigacoes.some((i) => i.estado === "FECHADO");
    const investigacoesPendentes = dados.investigacoes
        .filter((i) => i.estado !== "CANCELADO" && i.estado !== "FECHADO")
        .map((i) => ({ id: i.id, codigo: i.codigo }));
    const investigacoesAtendido = temInvestigacaoFechada && investigacoesPendentes.length === 0;

    const contencoesPendentes = dados.contencoes
        .filter((ct) => ct.estado !== "CANCELADO" && ct.estado !== "FECHADO")
        .map((ct) => ({ id: ct.id, codigo: ct.codigo }));
    const contencoesAtendido = contencoesPendentes.length === 0;

    const riscosPreenchidos = (dados.riscosRevisados ?? "").trim() !== "";
    const mudancasSGQPreenchidas = (dados.mudancasSGQ ?? "").trim() !== "";

    const temAprovador = dados.temAprovador;

    return [
        {
            requisito: RequisitoFechamento.CLASSIFICACAO_FECHADA,
            grupo: GrupoFechamento.FILHOS,
            atendido: temClassificacaoFechada,
            mensagem: temClassificacaoFechada ? "Classificação aprovada" : "Falta aprovar classificação",
            pendentes: [],
        },
        {
            requisito: RequisitoFechamento.INVESTIGACOES_FECHADAS,
            grupo: GrupoFechamento.FILHOS,
            atendido: investigacoesAtendido,
            mensagem: investigacoesAtendido ? "Investigações aprovadas" : "Falta aprovar todas as investigações",
            pendentes: investigacoesPendentes,
        },
        {
            requisito: RequisitoFechamento.CONTENCOES_RESOLVIDAS,
            grupo: GrupoFechamento.FILHOS,
            atendido: contencoesAtendido,
            mensagem: contencoesAtendido ? "Nenhuma contenção pendente" : "Falta resolver as contenções",
            pendentes: contencoesPendentes,
        },
        {
            requisito: RequisitoFechamento.RISCOS_REVISADOS,
            grupo: GrupoFechamento.ENVIO,
            atendido: riscosPreenchidos,
            mensagem: riscosPreenchidos ? "Riscos revisados preenchidos" : "Falta preencher o campo Riscos revisados",
            pendentes: [],
        },
        {
            requisito: RequisitoFechamento.MUDANCAS_SGQ,
            grupo: GrupoFechamento.ENVIO,
            atendido: mudancasSGQPreenchidas,
            mensagem: mudancasSGQPreenchidas ? "Mudanças no SGQ preenchidas" : "Falta preencher o campo Mudanças SGQ",
            pendentes: [],
        },
        {
            requisito: RequisitoFechamento.APROVADOR_DEFINIDO,
            grupo: GrupoFechamento.ENVIO,
            atendido: temAprovador,
            mensagem: temAprovador ? "Aprovador definido" : "Falta definir um aprovador",
            pendentes: [],
        },
    ];
}
