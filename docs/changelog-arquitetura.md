# Changelog de Arquitetura — QualityHub

Este documento registra todas as decisões tomadas durante a implementação que
divergem do "Chat de arquitetura" original, ou que preenchem lacunas que ele
deixou em aberto. Serve como fonte para a próxima revisão consolidada do
documento de arquitetura.

---

## Decisões já aplicadas

### Modelagem / Schema

- **`Registro`**: sem `atualizadoPorId`/`atualizadoPor` — quem atualizou por
  último se consulta via `Auditoria` (já indexada por `entidade` +
  `entidadeId` + `registradoEm`), não se armazena como campo redundante.
- **`NaoConformidade`**: sem `responsaveisId`/`qaId` (resolvidos via
  `Atribuicao` genérica), sem `analiseCausa` (pertence a `Investigacao`),
  sem `reportadoPorId` (não é exigência textual da ISO 10.2 — decisão de
  escopo, o custo de cadastro pelo Admin não compensava o ganho).
- **`NaoConformidade`**: mantém `processoAfetado` **e** `requisitoViolado`
  como campos distintos (o primeiro sobre localização operacional, o
  segundo sobre qual requisito/procedimento foi violado).
- **`Usuario.id`**: migrado de `Int` para `String` (`uuid(7)`) — propagado
  por toda FK de usuário no sistema.
- **`ConviteSenha` renomeado para `TokenAcesso`**, com campo `tipo`
  (`CONVITE` | `RECUPERACAO_SENHA`), preparando o fluxo futuro de "esqueci
  minha senha" sem precisar de uma segunda tabela.
- **`Reabertura`**: modelo que o documento original não detalhava — criado
  seguindo o padrão de `Aprovacao` (evento + motivo + autor + timestamp).
  Campos: `id`, `registroId`, `motivo`, `reabertoPorId`, `reabertoEm`.
- **`Cancelamento`**: mesma situação de `Reabertura` — nunca especificado
  no documento original, apesar de RN-06 exigir motivo de cancelamento.
  Mesmo padrão: `id`, `registroId`, `motivo`, `canceladoPorId`,
  `canceladoEm`.
- **RN-13 ajustada para `NaoConformidade`**: a exigência de aprovador
  definido não é mais checada em `publicar`, e sim em `submeter` — permite
  que a NC nasça (vire oficial, ganhe código) antes de um QA ser designado,
  refletindo o processo real onde a triagem de responsável acontece depois
  da criação.

### Permissões

- **RN-18 desmembrada**: `ALTERAR_ATRIBUICOES` virou duas ações —
  `ADICIONAR_COLABORADOR` (qualquer `EDITOR`/`GERENTE`, sem exigir
  atribuição prévia) e `DEFINIR_APROVADOR` (só `APROVADOR`/`GERENTE`).
  Motivo: colaboradores precisam de liberdade para se auto-organizar; QA
  precisa de controle mais rígido sobre quem aprova.
- **`Verificacao`**: `concluir` exige colaborador atribuído com papel
  `APROVADOR` (não `EDITOR`) — regra específica do service, análoga à
  RN-20 (Classificação). O Effectiveness Check do ETQ Reliance exigia QA.
  Ainda precisa reintroduzir o campo `prazo DateTime`, que existia no
  schema antigo e foi perdido na consolidação do documento.
- **`pode-executar.ts` desmembrado**: `temPapel` (só camada 1 — papel) foi
  extraída como função própria, separada de `podeExecutar` (as três
  camadas). Motivo: ações como `DEFINIR_APROVADOR` não podem exigir
  atribuição prévia — seria uma trava impossível (a pessoa nunca "já é"
  aprovadora antes de se tornar aprovadora pela primeira vez).
- **`cancelar`**: checagem de permissão é "ser `GERENTE` OU ser o
  aprovador do item" — não usa `podeExecutar` genérico nem `temPapel`
  sozinha, é uma combinação manual (`ehGerente || ehAprovadorDoItem`).
- **`decidir`**: não usa `podeExecutar` genérico — usa checagem estrita
  (`temPapel(ator, "APROVAR")` + `ehAprovador` especificamente, não
  `ehColaborador`), porque RN-16 exige ser _o_ aprovador designado, não
  qualquer colaborador com papel `APROVADOR`.

### Catálogos e enums

- **`entidades-auditadas.ts` reescrito**: renomeado de `Entidades` para
  `EntidadeAuditada`, derivado de `TipoRegistro` via spread
  (`...TipoRegistro`) mais `USUARIO`/`TOKEN_ACESSO`, garantindo que nunca
  diverge dos seis tipos de registro. Removidas entidades obsoletas do
  model antigo (`ANEXO`, `SETOR`, `APROVACAO`, `COMENTARIO` como estavam
  desenhadas antes).
- **Catálogo de ações de permissão (`Acao`)**: desmembrado em granularidade
  maior que o documento original sugeria — `GERENCIAR_RASCUNHO` (criar +
  excluir rascunho, fusão segura) mantido separado de `PUBLICAR` e
  `SUBMETER` (decisão consciente de manter nomes específicos, mesmo com
  regra de papel idêntica hoje, para facilitar divergência futura sem
  reescrever chamadas espalhadas).
- **`Decisao` desacoplado**: criado em `compartilhado/entidades/decisao.ts`
  (só existia como enum do Prisma antes) — usado em `decidir.schema.ts` e
  em `ciclo-vida.service.decidir`.

### Entidade `Contencao` — completa e testada

- Implementada do zero (era só schema comentado + repository apagado):
  `model Contencao` com chave compartilhada dupla (com `Registro`, via
  `onDelete: Cascade`, e com `NaoConformidade`, também `Cascade`, por
  segurança defensiva mesmo não sendo exercitada no fluxo atual).
- **`Disposicao` generalizada** (decisão de produto): em vez do
  vocabulário tradicional de chão de fábrica (retrabalho, refugo,
  segregação — específico de peça física), o enum usa termos abstratos
  que servem qualquer área que gere não conformidades (Operação, RH,
  Desenvolvimento, Qualidade): `ACEITO`, `CORRIGIDO`, `ANULADO`,
  `EM_ANALISE`. Decisão registrada porque não é óbvia relendo o código —
  alguém revisando pode estranhar a ausência de "refugo"/"retrabalho".
- `executadaEm` e `disposicao` ficam juntos desde `contencaoBaseSchema`
  (opcionais/nullish) — decisão de processo real: no fluxo da empresa,
  quem executa a contenção já sabe, no mesmo momento, qual foi o destino
  da peça/situação. Diferente de `riscosRevisados`/`mudancasSGQ` em NC,
  que só fazem sentido depois de tudo mais decidido.
- `contencao.service.ts` reescrito com 9 funções (sem `reabrir` —
  decisão: contenções que não funcionam geram uma **nova** tentativa,
  não uma reabertura da antiga, já que a relação com a NC é 1:N).
- `contencaoRepository.listarContencoes` aceita filtros opcionais
  (`naoConformidadeId`, `estado`) — modelo a ser replicado quando
  `listarNC` for revisitada com os filtros do contrato de API original.
- Testado via API real de ponta a ponta, incluindo seis modos de falha
  específicos (disposição inválida, NC inexistente, filtro vazio,
  segunda contenção pra mesma NC, filtro de estado inválido, e a
  checagem de atribuição específica — alguém com papel certo mas sem
  ser colaborador daquela contenção específica).
- **Lacuna identificada, ainda não resolvida**: `contencaoFechamentoSchema`
  existe mas nenhuma função do `service` o utiliza — mesma lacuna de
  `ncFechamentoSchema` em NC. Revisar junto quando decidirmos como/quando
  a validação de fechamento deveria disparar (relacionado a
  `submeterNCParaFechamento`, ainda bloqueada).

### Entidade `Classificacao` — em andamento

- `model Classificacao` criado, com chave compartilhada dupla (`Registro`
  - `NaoConformidade`, ambas `onDelete: Cascade`) — mesmo padrão de
    `Contencao`. `ClassificacaoNC` (enum `MAIOR`/`MENOR`) existia só no
    Prisma desde a Fase 0; criado o desacoplado
    (`compartilhado/entidades/classificacao-nc.ts`) que faltava.
- `classificacao.schema.ts`: **sem** schema de fechamento — diferente de
  NC/Contenção, `Classificacao` não tem campos que só fazem sentido
  "depois de tudo decidido"; `classificacaoPublicacaoSchema` já cobre
  tudo, um schema de fechamento seria idêntico e redundante.
- `criarRascunhoClassificacao`: usa a ação `CLASSIFICAR` (não
  `GERENCIAR_RASCUNHO`) na checagem de permissão, por RN-20. O criador
  ainda vira `COLABORADOR` (não `APROVADOR`) — decisão consciente de
  manter a mesma separação de responsabilidade que as outras entidades
  têm (definir aprovador continua sendo um passo explícito e separado,
  via `atribuicaoService.definirAprovador`, mesmo sabendo que só um
  `APROVADOR` pode ter criado a Classificação em primeiro lugar).
- `salvarRascunhoClassificacao`: pronta, mesma estrutura de
  `salvarRascunhoContencao`, checando `CLASSIFICAR` + `ehColaborador`.

**Problema de arquitetura identificado, ainda não resolvido — bloqueia
`publicarClassificacao`:**

`cicloVidaService.publicar` (e provavelmente `submeter`/`decidir`
também) tem a ação de permissão **fixa** internamente (`"PUBLICAR"`,
`"SUBMETER"`, `"APROVAR"`) — a função genérica não sabe que, para
`Classificacao` especificamente, a ação correta seria `"CLASSIFICAR"`
(RN-20). Chamar `cicloVidaService.publicar` direto para uma
`Classificacao` deixaria um `EDITOR` sem papel `APROVADOR` publicá-la,
violando RN-20.

Duas linhas de solução a avaliar na próxima sessão:

1. `publicarClassificacao` faz sua própria checagem manual de
   `CLASSIFICAR` **antes** de chamar `cicloVidaService.publicar` — que
   ainda vai checar `PUBLICAR` por dentro, redundantemente (mas
   `PUBLICAR` inclui `EDITOR`/`GERENTE`, então um `APROVADOR` sozinho,
   sem também ser `EDITOR`, falharia nessa segunda checagem — **isso
   quebraria o fluxo**, precisa ser pensado com cuidado, não é só
   "checagem a mais").
2. `cicloVidaService.publicar` (e as demais transições que dependem de
   `podeExecutar`) passam a aceitar a ação como **parâmetro**, em vez de
   fixa internamente — mudança mais profunda, mas resolve de forma
   genérica para qualquer entidade futura com a mesma necessidade
   (mudar a ação sem mudar a assinatura toda vez).

Decidir isso é pré-requisito para `publicarClassificacao`,
`submeterClassificacao` e `decidirClassificacao` — as três ficam
bloqueadas até resolver.

- **`nc.schema.ts`**: campo `cliente` estava `.optional()`, mas dados vindos
  do Prisma trazem `null` (não `undefined`) para colunas nuláveis não
  preenchidas — o Zod rejeitava. Corrigido para `.nullish()` (aceita
  `undefined` **e** `null`). Regra geral: todo campo opcional que é
  validado contra dados vindos do banco precisa de `.nullish()`, não só
  `.optional()`.
- **`schema.prisma`**: `Atribuicao.registro` não tinha `onDelete: Cascade`,
  diferente de `NaoConformidade.registro`. Isso impedia excluir um
  `Registro` em `RASCUNHO` sempre que ele já tivesse pelo menos uma
  `Atribuicao` (o que é sempre o caso, por RN-14 — o criador já é
  colaborador desde a criação). Corrigido adicionando o cascade.
- **`atribuicaoService.adicionarColaboradores`/`removerColaboradores`**:
  o mesmo `usuarioId` repetido dentro do array recebido na mesma
  requisição causava erro `500` (`P2002`, violação de chave primária) —
  o filtro B2 (checagem contra `ehColaborador`) só olhava o estado do
  banco, nunca duplicatas dentro do próprio array de entrada. Corrigido
  com `[...new Set(colaboradoresId)]`, eliminando duplicatas antes do
  filtro, nas duas funções.

### Módulo `atribuicao/` — completo e testado

- Implementado do zero: `atribuicaoRepository` (7 funções — `ehColaborador`,
  `ehAprovador`, `existeAprovador`, `contarColaboradores`, `buscarAprovador`,
  `inserirAtribuicao`/`removerAtribuicao`, genéricas por `FuncaoAtribuicao`),
  `atribuicaoService` (`adicionarColaboradores`, `removerColaboradores`,
  `definirAprovador`), `atribuicaoController`, `atribuicaoRoutes`.
- `GERENCIAR_COLABORADORES` (renomeado de `ADICIONAR_COLABORADOR`) cobre
  tanto adicionar quanto remover colaboradores — mesma regra de papel
  (`EDITOR`/`GERENTE`), sem checagem de atribuição prévia.
- `removerColaboradores` valida RN-12 (não deixar o registro sem nenhum
  colaborador) contando o total atual e comparando com quantos serão de
  fato removidos (após dedupe e após filtrar quem já não era colaborador).
- `definirAprovador` valida que o **alvo** (não o ator) tem papel
  `APROVADOR` antes de atribuí-lo; segue o padrão "hard delete do vigente
  - insert" para respeitar o índice único parcial.
- Ambas as operações de lote (`adicionarColaboradores`/`removerColaboradores`)
  usam filtro "B2": separam quem já satisfaz a condição (já é/não é
  colaborador) do que precisa de fato ser processado, devolvendo os dois
  grupos na resposta (`adicionados`/`jaEramColaboradores`,
  `removidos`/`naoEramColaboradores`) — em vez de falhar ou ignorar
  silenciosamente.
- Testado via API real de ponta a ponta (10 categorias de modo de falha,
  incluindo estado, regras de negócio, atribuição específica, validação,
  auto-aprovação, id inexistente, JWT adulterado/expirado, e os cenários
  específicos deste módulo) — eliminou de vez a necessidade de inserir
  `Atribuicao` manualmente via SQL nos testes.

### Infraestrutura

- **`fastify-type-provider-zod`** adotado para validação de rota, em vez de
  `.parse()` manual dentro dos controllers. Controllers agora usam
  `FastifyRequest<{ Body: ..., Params: ... }>` tipado, sem validação
  redundante.
- **`app.ts`/`server.ts`** divididos conforme §10.5 do documento original —
  `app.ts` monta a instância (Fastify, JWT, Zod, error handler, rotas),
  `server.ts` só chama `.listen()`.
- **`setErrorHandler`** trata três casos: `ZodError` (validação manual
  dentro de services, via `.parse()` explícito), erros do tipo
  `FST_ERR_VALIDATION` (validação de rota pelo Fastify/type-provider,
  identificados por `instanceof Error && "code" in erro`, já que
  `FastifyError` não é uma classe real exportável para `instanceof`), e
  `AppError` (erros de domínio).

---

## Pendências em aberto

1. **Catálogo de ações de auditoria** (`acoes-auditadas.ts`) — ainda usa
   strings soltas no campo `acao` de cada chamada a `auditoriaRepository.
registrar`. Lista já em uso: `CRIAR_RASCUNHO`, `PUBLICAR`,
   `EXCLUIR_RASCUNHO`, `SUBMETER`, `APROVADO`/`REPROVADO`, `REABRIR`,
   `CANCELAR`, `DEFINIR_SENHA`. Falta ainda `CONCLUIR` (quando
   `Verificacao` for modelada). Quando reescrito como enum tipado, revisar
   todas as funções já escritas para trocar strings soltas pelo tipo.

2. **`ADICIONAR_COLABORADOR`** sem checagem de atribuição prévia — mesma
   pergunta que gerou o desmembramento de `DEFINIR_APROVADOR` ainda precisa
   ser formalmente revisada quando escrevermos `atribuicao.service`
   completo (as funções de escrita além de `adicionarColaboradores`, que
   já existe em `atribuicao.repository.ts`).

3. **`criarRascunhoNC`** atribui só o criador como colaborador (RN-14) —
   adicionar colaboradores extras no mesmo passo da criação fica para uma
   chamada separada, à rota `POST /registros/:id/colaboradores` (ainda não
   escrita).

4. **`fazerLogin`** deveria auditar tentativas de login, inclusive falhas
   (útil para detectar força bruta) — isso muda a natureza da função (hoje
   só leitura, via `prisma` direto, sem transação) e precisa ser desenhado
   com cuidado antes de implementar.

5. **`ignoreTrailingSlash`** em `app.ts` usa a forma deprecada
   (`Fastify({ ignoreTrailingSlash: true })`, aviso `FSTDEP022`). Migrar
   para `Fastify({ routerOptions: { ignoreTrailingSlash: true } })` numa
   passada de manutenção — não bloqueia nada agora.

6. ~~**`contencao/`** em estado intermediário~~ — **RESOLVIDO.** Módulo
   completo (schema, repository, service, controller, routes), testado
   via API de ponta a ponta. Ver seção "Entidade `Contencao`" acima.

7. **`submeterNCParaFechamento`** (a guarda de fechamento, RN-21 a RN-23) —
   ainda bloqueada. Depende das quatro entidades filhas restantes:
   `Classificacao`, `Investigacao`, `AcaoCorretiva`, `Verificacao`.

8. **Listagem de NCs (`listarNC`)** — hoje sem filtros nem paginação
   (Camada 1 apenas). Contrato de API original previa `?estado&
classificacao&origem&de&ate&minhas&cursor`. Camadas 2–4 (filtro por
   estado, paginação por cursor, demais filtros) ainda não implementadas.

9. **Módulo Feed** (comentários, respostas, menções `@`/`#`) — não
   iniciado. Depende do módulo `nc/` estar mais maduro.

10. **Documentação OpenAPI** — não iniciada. `fastify-type-provider-zod`
    já está em uso, o que facilita gerar isso a partir dos schemas
    existentes quando chegarmos nessa etapa.

11. **Arquivos de teste manual** (`requests.http`, `requests-modos-falha.http`,
    `requests-contencao.http`, `setup-usuarios-teste.sql`) reorganizados
    da raiz do projeto para a pasta `testes/`.
