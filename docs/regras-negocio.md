# Diagrama de estados

stateDiagram-v2
[*] --> ABERTA
ABERTA --> ANALISE : QA assume
ABERTA --> CANCELADA : Autor cancela
CANCELADA --> [*]
ANALISE --> IMPROCEDENTE : Não procede
IMPROCEDENTE --> [*]
ANALISE --> CONTENCAO : Classificada
CONTENCAO --> [*] : Se classificada como Menor
CONTENCAO --> INVESTIGACAO : Se classificada como Maior
INVESTIGACAO --> ACAO_CORRETIVA
ACAO_CORRETIVA --> VERIFICACAO
VERIFICACAO --> INVESTIGACAO : Se não eficaz
VERIFICACAO --> ACAO_CORRETIVA : Se parcialmente eficaz
VERIFICACAO --> ENCERRADA : Se eficaz
ENCERRADA --> [*]
