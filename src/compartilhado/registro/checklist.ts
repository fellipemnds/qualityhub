// Um registro que impede um requisito de ser atendido, para a tela apontar o que resolve. O código é nulo enquanto
// o registro é rascunho
export type Pendente = { id: string; codigo: string | null };

// Um requisito de uma guarda que responde "o que falta" (TRD §5, esquema §4.3). A mesma lista serve a dois usos: o
// submeter recusa se algum item não estiver atendido, e a tela mostra todos, com ✅ ou ❌. Um item por requisito,
// sempre na mesma ordem, atendido ou não; quando o requisito olha vários registros, os que faltam vão em pendentes
export type ItemChecklist<Requisito extends string> = {
    requisito: Requisito;
    atendido: boolean;
    mensagem: string;
    pendentes: Pendente[];
};
