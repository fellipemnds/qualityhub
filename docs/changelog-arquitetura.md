# Changelog de Arquitetura — QualityHub

Este documento registra todas as decisões tomadas durante a implementação que
divergem do "Chat de arquitetura" original, ou que preenchem lacunas que ele
deixou em aberto. Serve como fonte para a próxima revisão consolidada do
documento de arquitetura.

---

## Decisões já aplicadas

### Planejamento em seis documentos; shadcn/ui no lugar do Mantine

- **Planejamento reorganizado** em `docs/prd.md` (produto),
  `docs/fluxo-app.md` (telas e navegação) e `docs/ui-ux.md` (fundações
  visuais, componentes, wireframes), com TRD, Esquema Backend e Plano de
  Implementação a seguir. Decisões de produto revisadas com a analista
  ficam no PRD (§9); este changelog continua sendo o registro das
  decisões de arquitetura.
- **Frontend usará shadcn/ui (Radix + Tailwind), não Mantine** — diverge
  do ADR-28 do documento original. Escolha de Matthew. Consequências
  registradas em `docs/ui-ux.md` §1.1: Tailwind entra na stack, e
  complementos são necessários para o que o shadcn/ui não traz pronto
  (TanStack Table, react-day-picker, Sonner, Tiptap para menções,
  react-dropzone para anexos). Regra: nenhuma biblioteca além dessas
  sem registrar o motivo aqui.
- **TRD** (`docs/trd.md`) registra os ADRs novos, 33 a 38: shadcn/ui;
  anexos só via backend (onde ficam: junto com a hospedagem); sessão em
  cookie httpOnly com usuário/papéis conferidos a cada requisição
  (corrige o atraso de até 5 h para revogar papel, porque hoje os papéis
  vão dentro do JWT); testes automáticos **antes** das correções de
  regra; OpenAPI + Orval; remoção do barramento de eventos sem uso.
  **ADR-30 (on-premise) em revisão**: sem TI envolvida e com volume
  pequeno (54 NCs no total), as opções de hospedagem estão comparadas no
  TRD §10.6.
- **Revisão cruzada dos seis documentos com o código** (mesmo dia):
  encontrou os bugs B9–B13 (`docs/esquema-backend.md` §7) — o mais grave,
  B9, é a validação de `detectadoEm` com `new Date()` avaliado uma vez
  na carga do módulo. Duas decisões de produto novas: **filho herda o
  aprovador da NC** (RN-46; antes, nascia sem aprovador e travava o
  colaborador) e **rascunho não se cancela, só se exclui** (RN-06). A
  guarda de fechamento passa a ter dois grupos (filhos × envio), para a
  etapa "Pronta para fechamento" e a pendência correspondente não
  dependerem de campos que ninguém é avisado para preencher. Regra nova
  de fuso: todo cálculo de "dia" no backend usa `America/Sao_Paulo`.

### Filtros de listagem de NC, tipo `Ator`, reorganização em subpastas, e três bugs de schema de fechamento

- **Reorganização de `modulos/nc/` em subpastas por entidade** — resolve a
  pendência #12. `nc/nc/`, `nc/contencao/`, `nc/classificacao/`,
  `nc/investigacao/` (com `hipotese.*` junto — continua sem ciclo de vida
  próprio, decisão já registrada, sem rota HTTP dedicada), `nc/acao-corretiva/`,
  `nc/verificacao/`. Feito via `git mv` + ajuste de imports relativos,
  sem mudança de lógica.

- **Tipo `Ator` criado** (`compartilhado/entidades/ator.ts`,
  `{ id: string, papeis: Papel[] }`) — resolve a pendência #13.
  Substituídas 65 ocorrências do tipo inline em 10 arquivos
  (`pode-executar.ts`, `atribuicao.service.ts`, `ciclo-vida.service.ts`,
  os seis `*.service.ts` de entidade, `usuario.service.ts`).
  `types/fastify-jwt.d.ts` também passou a referenciar `Ator` para o
  `request.user`, em vez de repetir o shape uma terceira vez.

- **Filtros de listagem de NC implementados** (resolve a pendência #8):
  `GET /nc` aceita `estado`, `origem`, `classificacao`, `de`/`ate` (sobre
  `detectadoEm`), `minhas`, e paginação por `cursor`/`limit`.
  - `ncRepository.listar` reescrito para entrar por `NaoConformidade.
findMany` direto, igual às outras cinco entidades — antes entrava por
    `registroRepository.listar` (Registro-primeiro), única exceção ao
    padrão. `NaoConformidade.id` é o mesmo valor de `Registro.id` (chave
    compartilhada), então o cursor filtra/ordena direto ali.
  - `classificacao` filtra via `NaoConformidade.classificacoes` (relação
    já existente), exigindo `some: { valor, registro: { estado: "FECHADO" } }`
    — decisão consciente de **não** reviver o campo denormalizado
    `classificacaoAtual` (ver item abaixo): uma NC pode ter mais de uma
    Classificação ao longo da vida, e "qual é a atual" é regra de negócio
    que ninguém definiu; join ao vivo reflete o banco sem inventar isso.
  - `minhas` filtra via `Registro.atribuicoes` (`some: { usuarioId }`) —
    "atribuído a mim" (colaborador ou aprovador), não "criado por mim".
  - Novo helper compartilhado `compartilhado/registro/paginacao-cursor.ts`:
    schema Zod (`cursor`, `limit`, teto de 100) + função `paginar`, que
    corta o resultado de uma busca por `limit + 1` e calcula o próximo
    cursor. Só exige `{ id: string }` — nenhuma entidade específica —
    pensado pra ser reaproveitado pelas outras cinco quando precisarem
    de paginação.
  - `ncFiltrosListagemSchema`/`NCFiltrosListagemInput` centralizados em
    `nc.schema.ts`, reaproveitados em `nc.routes.ts`, `nc.controller.ts`,
    `nc.service.ts` e `nc.repository.ts` — schema único, tipo inferido,
    nunca reescrito à mão (mesmo padrão de todo outro input do projeto).

- **Campo órfão `NaoConformidade.classificacaoAtual` removido via
  migration** (`remove_classificacao_atual_orfa`). Existia desde a Fase 0
  (antes de `Classificacao` virar entidade própria com ciclo de vida
  completo) e nunca foi escrito por nenhuma função do código — dado morto
  do desenho original, confirmado via `git log -S` até o commit que o
  criou. Se um dia a analista de qualidade definir de propósito o que
  significa "a classificação atual" de uma NC com múltiplas
  Classificações, isso volta como campo real, com semântica por trás —
  não como cache de conveniência.

- **Três bugs da mesma família corrigidos — schema de fechamento existia,
  mas nunca era usado como validador de `submeter`.** Achados testando
  `testes/requests-fluxo-completo.http` (novo arquivo, encadeia as seis
  entidades ponta a ponta, feliz + modos de falha, criado nesta sessão):
  1. `nc.schema.ts` — `riscosRevisados`/`mudancasSGQ` só existiam no
     `.extend()` de `ncFechamentoSchema`, nunca em `ncBaseSchema`. Como
     `PATCH /nc/:id` valida contra `ncRascunhoSchema` (derivado do base),
     o Zod descartava os dois campos silenciosamente — a NC nunca
     conseguia ser fechada de verdade pela API. Corrigido movendo os dois
     pro `ncBaseSchema` como `.nullish()`, igual ao padrão de
     Contenção/Investigação.
  2. `acao-corretiva.schema.ts` — mesmo problema com `investigacaoId`: só
     existia como intersecção de tipo TypeScript manual em
     `acao-corretiva.controller/service/repository.ts` (sem efeito em
     runtime), nunca no schema Zod real. Toda `AcaoCorretiva` criada
     nascia com `investigacaoId: null`, silencioso até o ramo `NAO_EFICAZ`
     da Verificação (o único que checa essa vinculação pra reabrir a
     Investigação). Corrigido adicionando `investigacaoId: z.uuid()
.nullish()` ao `acaoCorretivaBaseSchema`.
  3. `contencao.service.ts` — `submeterContencao` validava contra
     `contencaoPublicacaoSchema` (campos opcionais) em vez de
     `contencaoFechamentoSchema` (campos obrigatórios) — era exatamente a
     lacuna já anotada na seção "Entidade `Contencao`" abaixo, reaparecida
     ao conferir se as outras entidades tinham o mesmo bug do item 1.
     Corrigido trocando o validador de `submeterContencao`. Testado via
     curl: sem `executadaEm`/`disposicao` → 400; preenchidos → 200.

  Limpeza relacionada: as intersecções manuais `& { investigacaoId?: string }`
  em `acao-corretiva.controller.ts`, `.service.ts` e `.repository.ts` (só
  tinham efeito em compile-time, redundantes desde que o campo entrou no
  schema Zod do item 2 acima) foram removidas numa sessão seguinte.

- **Auditoria em `criarUsuario` adicionada** — `EntidadeAuditada.USUARIO`
  + `acao: "CRIAR_USUARIO"`, mesmo padrão de `authService.definirSenha`.
  (`atualizarNC` já registrava auditoria desde antes desta sessão — a
  pendência original sobre isso estava parcialmente desatualizada.)

- **Lacuna nova identificada, ainda sem decisão de design**: o módulo
  `usuario` só tem `POST /usuarios` (criar). Não existe listagem/busca de
  usuário, não existe revogar um papel específico (`usuarioPapelRepository`
  só tem `concederPapel`), e não existe inativar um usuário (`Usuario` sem
  campo `ativo`/`desativadoEm`). `authService.fazerLogin` não checa nada
  disso porque não há o que checar. Relevante pra um sistema de
  aprovações (ex.: alguém sair da empresa e continuar como aprovador
  válido). Ver pendência nova na lista abaixo.

### Entidade `Verificacao` — completa e testada; MVP de backend fechado

- **`Verificacao` nunca é criada diretamente pelo usuário** — nasce
  automaticamente dentro de `finalizarExecucaoAcaoCorretiva`, já em
  `ABERTO` (pula `RASCUNHO` de propósito), com código gerado via
  `sequenciaService` (mesma lógica de `publicar`), `prazo` calculado
  (`hoje + diasParaVerificar`, informado pelo colaborador ao finalizar),
  `instrucoesVerificacao` copiado do plano da `AcaoCorretiva`, e o mesmo
  usuário atualmente atribuído como `APROVADOR` da `AcaoCorretiva` já
  atribuído como **`APROVADOR` e `COLABORADOR`** da `Verificacao` nova
  (as duas — evita um passo manual extra para a mesma pessoa poder
  editar e depois concluir).
- Por nascer sempre já publicada, `publicarVerificacao` foi removida do
  service/controller/routes — nunca haveria uso real para essa rota.
- `Verificacao.eficaz: Boolean?` virou `Verificacao.resultado:
ResultadoVerificacao?` (enum: `EFICAZ`, `PARCIALMENTE_EFICAZ`,
  `NAO_EFICAZ`) — RN-23 passa a ser "qualquer resultado diferente de
  `EFICAZ` bloqueia o fechamento da NC e exige nova Ação Corretiva".
  `Verificacao.evidencia` renomeado para `Verificacao.conclusao`
  (`AcaoCorretiva.evidencia` mantém o nome antigo — propósito diferente).
- Duas linhas de auditoria em `finalizarExecucaoAcaoCorretiva`: uma para
  o fechamento da Ação Corretiva (`FINALIZAR_EXECUCAO`), outra para o
  nascimento da Verificação (`GERAR_VERIFICACAO`) — a auditoria genérica
  de `criarRascunho` não é suficiente aqui porque a Verificação nasce
  por um caminho não convencional (pula rascunho, já ganha código,
  atribuições automáticas), então precisa de um registro próprio.
- **Conclusão sem portão** (`VERIFICACAO: []`), usando `cicloVidaService.
concluir` já existente desde a Fase 1 — exige colaborador com papel
  `APROVADOR` (`CONCLUIR_VERIFICACAO`), sem aprovação adicional.
- **Todas as seis entidades do domínio (NC, Contenção, Classificação,
  Investigação, Ação Corretiva, Verificação) estão completas e testadas
  de ponta a ponta** — fecha o MVP de backend do ciclo ISO 9001 completo
  de não conformidade, da detecção ao fechamento com verificação de
  eficácia.

### `AcaoCorretiva` — mudança de arquitetura para portão único

- **`ACAO_CORRETIVA` passou de dois portões (`["PLANO", "EXECUCAO"]`) para
  um só (`["PLANO"]`)** — decisão de produto: o QA só aprova o plano;
  a execução em si não precisa de aprovação separada, só precisa
  acontecer e ser registrada (`executadoEm`/`evidencia`).
- **`cicloVidaService.decidir` ganhou parâmetro
  `fecharAoAprovarUltimoPortao: boolean = true`** — quando `false`,
  aprovar o último (e único, no caso de Ação Corretiva) portão volta o
  item para `ABERTO` em vez de `FECHADO`. Valor padrão preserva o
  comportamento de todas as outras cinco entidades sem nenhuma mudança
  nas chamadas existentes. `decidirAcaoCorretiva` passa `false`.
- **`submeterAcaoCorretiva` sempre usa `acaoCorretivaPlanoSchema`** —
  não existe mais uma segunda submissão para a execução (ela nunca passa
  por `EM_APROVACAO`).
- **Nova função `finalizarExecucaoAcaoCorretiva`** — transição própria,
  fora do `cicloVidaService` genérico (não reaproveita `concluir`, que
  exige zero portões). Leva o item de `ABERTO` (`portaoAtual` continua
  `0`, nunca foi incrementado, porque o `decidir` com
  `fecharAoAprovarUltimoPortao: false` só muda `estado`) direto para
  `FECHADO`, exigindo `executadoEm`/`evidencia` preenchidos
  (`acaoCorretivaExecucaoSchema`), sem aprovação — feito pelo próprio
  colaborador.

### `Verificacao` — decisões de modelagem em andamento (código pendente)

Conversa em curso, decisões já tomadas mas **ainda não aplicadas** em
nenhum arquivo (nem schema Prisma, nem código):

1. **`AcaoCorretiva` ganha campo `instrucoesVerificacao: String?`** —
   preenchido no momento do plano (junto com `descricao`/`prazo`),
   descrevendo como o QA deve conduzir a verificação depois.
2. **Ao finalizar a execução, a pessoa informa um número de dias**
   (não uma data) — o sistema calcula `prazo = hoje + esses dias` e
   grava na `Verificacao` recém-criada. `finalizarExecucaoAcaoCorretiva`
   precisa de um parâmetro novo para isso (dias, não `Date` direto como
   estava na primeira tentativa).
3. **`instrucoesVerificacao` é copiado de `AcaoCorretiva` para dentro
   da `Verificacao`** recém-criada, no mesmo momento — nome do campo em
   `Verificacao` ainda a decidir (mesmo nome, ou algo como
   `comoVerificar`).
4. **`Verificacao.evidencia` renomeado para `Verificacao.conclusao`**
   (só em `Verificacao` — `AcaoCorretiva.evidencia` continua com esse
   nome, propósito diferente: evidência de execução vs. conclusão da
   análise do QA).
5. **`Verificacao.eficaz: Boolean?` vira `Verificacao.resultado:
ResultadoVerificacao?`**, um enum novo com três valores: `EFICAZ`,
   `PARCIALMENTE_EFICAZ`, `NAO_EFICAZ` (sem `PENDENTE` — redundante com
   o próprio `estado` do Registro). RN-23 passa a ser "qualquer
   resultado diferente de `EFICAZ` bloqueia o fechamento da NC e exige
   nova Ação Corretiva" — `PARCIALMENTE_EFICAZ` tem a mesma consequência
   prática de `NAO_EFICAZ`, só mais preciso informativamente. Enum
   desacoplado (`compartilhado/entidades/resultado-verificacao.ts`)
   ainda a criar.
6. **Ainda não decidido**: se a `Verificacao` recém-criada nasce com
   algum colaborador/aprovador atribuído automaticamente, ou se isso
   fica como passo manual via `atribuicaoService` depois.

**Próximos passos, na ordem**: ajustar `schema.prisma` (`AcaoCorretiva.
instrucoesVerificacao`, `Verificacao.conclusao`/`resultado` +
`ResultadoVerificacao`), migration, criar o enum desacoplado, reescrever
`finalizarExecucaoAcaoCorretiva` com o parâmetro de dias e a cópia de
`instrucoesVerificacao`, e então gerar `verificacao.schema/repository/
service/controller/routes.ts` do zero (nunca foram criados).

### Entidades `Hipotese` e `AcaoCorretiva` — completas e testadas

- **`AcaoCorretiva` aponta só para `Investigacao`** (`investigacaoId String?`),
  não para `Hipotese` individual — rollback de uma decisão anterior.
  Rastrear "essa ação resolve esse fator contribuinte específico" foi
  considerado controle excessivo; o julgamento de quais fatores
  contribuintes precisam de ação fica com o QA na aprovação (`decidir`
  com `REPROVADO` + motivo), não estruturado no banco.
- **`Hipotese` não tem ciclo de vida próprio** — não é uma entidade
  filha de `Registro` (sem publicar/submeter/decidir/rotas dedicadas).
  É gerida inteiramente dentro do fluxo de `Investigacao`
  (`hipotese.repository.ts` com `criar`/`atualizar`/`listarPorInvestigacao`/
  `excluir`, sem `service` próprio). Campos: `descricao`,
  `numeroIshikawa` (referência simples por número de posição — o
  Ishikawa em si continua livre dentro do `conteudo: Json` da
  investigação, decisão preservada), `classificacao`
  (`CAUSA_DIRETA | FATOR_CONTRIBUINTE | SEM_RELACAO`).
- **`descricao`/`classificacao` de `Hipotese` são nuláveis no banco** —
  hipóteses podem ser criadas incompletas durante o processo, só
  precisam estar completas na hora de submeter a Investigação.
  `submeterInvestigacao` agora também valida cada `Hipotese` existente
  contra `hipoteseFechamentoSchema`, além da checagem de `causaRaiz`
  (RN-24) já existente.
- **`submeterAcaoCorretiva` escolhe o schema de validação pelo
  `portaoAtual`** (`0` → `acaoCorretivaPlanoSchema`, exige `descricao`+
  `prazo`; `1` → `acaoCorretivaExecucaoSchema`, exige também
  `executadoEm`+`evidencia`, RN-25) — primeira vez que uma entidade usa
  os dois portões (`PLANO`, `EXECUCAO`) de verdade; `cicloVidaService`
  não precisou de nenhuma mudança nova além da parametrização de `acao`
  já feita para `Classificacao`.

### Bug real corrigido: `submeter` não validava conteúdo obrigatório

- **`submeterInvestigacao`/`submeterClassificacao` usavam o schema de
  publicação** (campos nullish) em vez de um schema de fechamento
  (campos obrigatórios) — permitindo submeter (e, por consequência,
  aprovar/fechar, já que ambas têm portão único) itens sem
  `causaRaiz`/`causaDireta` (Investigação, violando RN-24) ou sem
  `valor`/`justificativa` (Classificação). Descoberto testando RN-24 na
  prática.
- **`classificacaoFechamentoSchema` recriado** (tinha sido removido por
  parecer redundante com a publicação — mas os dois eram idênticos só
  porque a base nunca exigia nada; o problema estava um nível abaixo).
- **A régua consolidada**: `publicar` usa o schema de publicação
  (permissivo, permite conteúdo incompleto — a entidade "existe como
  evidência ISO" mas pode continuar em edição); `submeter` usa o schema
  de fechamento (exige tudo, porque é o último portão de qualidade antes
  de uma decisão que pode fechar definitivamente). `NC` e `Contencao`
  não tinham esse bug porque seus campos essenciais já eram obrigatórios
  desde a base (só o rascunho os relaxa via `.partial()`) — só
  `Investigacao`/`Classificacao` tinham campos opcionais mesmo na base,
  exigindo o schema de fechamento separado para `submeter`.
- Controller/routes de `submeter` não precisaram de nenhuma mudança — o
  schema de fechamento valida dados **já persistidos** (buscados do
  banco dentro do service), não o corpo da requisição de submeter, que
  não tem corpo.

### Regra geral revisada: edição permitida além de `RASCUNHO`

- **Descoberta ao testar `Investigacao`**: publicar não deveria travar o
  conteúdo — só formaliza que o item existe e ganha código. A edição
  deveria ficar bloqueada apenas a partir de `EM_APROVACAO` (quando o
  item está sob decisão formal — editar por baixo do aprovador seria
  incoerente), não a partir de `ABERTO`.
- Criado `compartilhado/registro/estados-editaveis.ts`, exportando
  `ESTADOS_EDITAVEIS = ["RASCUNHO", "ABERTO"]`. Aplicado nas quatro
  entidades já modeladas (`NaoConformidade`, `Contencao`, `Classificacao`,
  `Investigacao`) — todas seguem a mesma regra, sem exceção; a suspeita
  inicial de que `Classificacao` seria diferente (por ir rápido para
  decisão) não se confirmou — o bloqueio real é sobre `EM_APROVACAO`, não
  sobre "já publicado".
- **Renomeado `salvarRascunho<Entidade>` → `atualizar<Entidade>`** nas
  quatro entidades (service, controller, routes) — o nome antigo ficou
  impreciso, já que a função edita em mais de um estado agora, não só
  rascunho. Feito via rename symbol do editor, para atualizar todas as
  referências de uma vez.

### Entidade `Investigacao` — service completo

- Usa as ações **padrão** (`GERENCIAR_RASCUNHO`, `PUBLICAR`, `SUBMETER`),
  não `CLASSIFICAR` — diferente de `Classificacao`, investigação é
  conduzida pelo colaborador (`EDITOR`), com aprovação do `APROVADOR`
  só no final (portão `UNICA`), não exclusiva de `APROVADOR` do início
  ao fim.
- **Tem `cancelarInvestigacao`**, mas **não tem** `reabrirInvestigacao` —
  mesmo raciocínio de `Contencao`: uma investigação pode ser abandonada
  no meio (ex.: causa direta identificada errada, ou reclassificação da
  NC invalida a linha de investigação em curso), mas nunca reaberta —
  uma nova investigação é criada, mantendo evidente no histórico que a
  anterior foi cancelada e outra tomou seu lugar.
- `Prisma.JsonNull` necessário no repository (`criar`/`atualizar`) para
  o campo `conteudo: Json?` — `null` puro do JavaScript não é aceito
  pelo Prisma nesse tipo de campo (ambiguidade entre "coluna vazia" e
  "valor JSON `null` armazenado"). A conversão precisa vir **depois**
  do espalhamento de `...dados` no objeto `data`, nunca antes — spread
  posterior sobrescreve o anterior.

### Entidade `Investigacao` — modelo simplificado em relação ao documento

- **`conclusao` e `causaRaiz` fundidos num único campo (`causaRaiz`)** —
  documento original tinha os dois separados; decisão de Matthew que a
  conclusão da investigação **é** a causa raiz identificada, sem sentido
  prático em duplicar. RN-24 ("conclusão preenchida e ≥1 causa raiz")
  vira, na prática, uma única checagem: `causaRaiz` preenchida.
- **`CausaRaiz` deixou de ser tabela própria** (o documento previa
  `causas CausaRaiz[]`, pensada para 1:N). Depois de mapear o processo
  real com a analista, ficou claro que cada Investigação tem **uma
  única** causa raiz (1:1) — virou campo de texto simples
  (`causaRaiz: String?`) direto em `Investigacao`, buscável por palavra-
  chave sem precisar de tabela/agregação separada.
- **`realProblema` novo campo**, também dentro de `Investigacao` — cada
  Real Problema identificado a partir da NC gera sua própria
  Investigação (1 real problema = 1 investigação; uma NC pode ter
  várias). Diferente de `NaoConformidade.requisitoViolado` (constatação
  imediata na criação da NC) — `realProblema` é resultado de um processo
  de análise (etapa do A3 SPS), descoberto depois, não declarado de
  cara.
- **Estrutura completa da entidade ainda em desenho** (pendente):
  `Hipotese` (testes de hipótese do A3 SPS, classificados em
  `CAUSA_DIRETA | FATOR_CONTRIBUINTE | SEM_RELACAO`) e a forma como
  `AcaoCorretiva` vai apontar para "o que ela resolve" (a causa raiz de
  uma investigação, ou uma hipótese específica) — decisão de usar duas
  FKs nuláveis (`investigacaoId`/`hipoteseId`, nunca as duas ao mesmo
  tempo, checado no service, não no banco) ainda não implementada.

### Entidade `Investigacao` — decisão de metodologia (produto, não técnica)

- **`MetodoInvestigacao` divergiu do documento original.** O documento
  previa `CINCO_PORQUES|ISHIKAWA|OITO_D` como opções isoladas. Depois de
  conversa com a analista de qualidade, decidido usar **só `A3_SPS`**
  por ora — metodologia composta (baseada na experiência prévia da
  analista na Novo Nordisk) que já **inclui** Ishikawa e 5 Porquês como
  etapas internas do próprio fluxo, dentro do `conteudo: Json` da
  Investigação. `PEOPLE_SUDOKU` foi cogitado e descartado por ora — nem
  Matthew nem a analista têm certeza da estrutura completa dele; revisar
  quando (se) isso for mapeado com confiança.
- **Estrutura esperada do `conteudo` (Json) para `A3_SPS`** — documentada
  aqui porque o banco não valida isso (é JSON livre), mas o frontend vai
  precisar seguir essa sequência ao montar o formulário:
  `PERCEPÇÃO INICIAL → DESCRIÇÃO → REAL PROBLEMA → ISHIKAWA → CAUSA
DIRETA → 5 PORQUÊS → CAUSA RAIZ → CONTRAMEDIDAS → CHECK DE
EFETIVIDADE`. A "causa raiz" identificada ao final do processo é a
  mesma que deve ser **extraída** e registrada como uma linha real em
  `CausaRaiz` (RN-24 exige ≥1) — o campo dentro do JSON é rascunho do
  processo, a linha em `CausaRaiz` é o dado consultável ("quais causas
  mais se repetem?").

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
- ~~**Lacuna identificada, ainda não resolvida**: `contencaoFechamentoSchema`
  existe mas nenhuma função do `service` o utiliza~~ — **RESOLVIDO.**
  `submeterContencao` agora usa `contencaoFechamentoSchema` como validador.
  Ver seção "Filtros de listagem de NC, tipo `Ator`..." no topo do
  documento.

### Entidade `Classificacao` — completa e testada

- **Descoberta de arquitetura**: `cicloVidaService.publicar`/`submeter`/
  `excluirRascunho` tinham a ação de permissão fixa internamente
  (`"PUBLICAR"`, `"SUBMETER"`, `"GERENCIAR_RASCUNHO"`) — impossível para
  `Classificacao` exigir `"CLASSIFICAR"` (RN-20: só `APROVADOR`/`GERENTE`
  cria/edita/publica/submete/exclui, nunca `EDITOR` puro). Corrigido
  adicionando parâmetro opcional `acao: Acao` com valor padrão igual à
  ação original em cada função — zero impacto nas chamadas existentes
  (NC, Contenção), `Classificacao` passa `"CLASSIFICAR"` explicitamente.
  Aproveitado para corrigir `antes: dadoValidado` → `antes: registro` em
  `publicar` (bug: registrava o resultado da validação, não o estado
  real anterior do Registro).
- Sem `cancelarClassificacao` nem `reabrirClassificacao` — mesmo raciocínio
  de `Contencao`: ciclo de vida é curto, excluir rascunho já cobre
  "desistir cedo", reclassificar sempre gera uma nova instância (1:N com
  a NC), nunca uma reabertura da anterior.
- Criador sempre vira `COLABORADOR` (nunca `APROVADOR` automaticamente),
  mesmo precisando ter papel `APROVADOR` para criar — preserva a
  possibilidade de designar formalmente outra pessoa como aprovadora via
  `atribuicaoService.definirAprovador`, em vez de travar nisso implicitamente.
- Testado de ponta a ponta (13 casos), incluindo a checagem estrita de
  `decidir` (papel certo mas não é o aprovador designado → 403) e RN-20
  em três pontos (criar, publicar, excluir — todos bloqueiam EDITOR).

- `model Classificacao`: chave compartilhada dupla (`Registro` +
  `NaoConformidade`, ambas `onDelete: Cascade`), mesmo padrão de
  `Contencao`. `ClassificacaoNC` desacoplado criado (só existia no Prisma).
- `classificacao.schema.ts`: sem schema de fechamento — nenhum campo só
  faz sentido "depois de tudo decidido" nesta entidade.

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

> **A partir de 2026-09-24, a lista viva de trabalho é
> `docs/plano-implementacao.md`** (com a fase de cada item na tabela de
> rastreabilidade, §8). A lista abaixo fica como histórico; as
> pendências ainda abertas nela já estão no plano.

1. **Catálogo de ações de auditoria** (`acoes-auditadas.ts`) — ainda usa
   strings soltas no campo `acao` de cada chamada a `auditoriaRepository.
registrar`. Lista já em uso: `CRIAR_RASCUNHO`, `PUBLICAR`,
   `EXCLUIR_RASCUNHO`, `SUBMETER`, `APROVADO`/`REPROVADO`, `REABRIR`,
   `CANCELAR`, `DEFINIR_SENHA`, `CRIAR_USUARIO`, `ADICIONAR_COLABORADORES`,
   `REMOVER_COLABORADOR`, `DEFINIR_APROVADOR`, `FINALIZAR_EXECUCAO`,
   `GERAR_VERIFICACAO`, `CONCLUIR_VERIFICACAO`. Quando reescrito como enum
   tipado, revisar todas as funções já escritas para trocar strings soltas
   pelo tipo.

2. ~~**`ADICIONAR_COLABORADOR`** sem checagem de atribuição prévia~~ —
   **RESOLVIDO.** Virou `GERENCIAR_COLABORADORES` no módulo `atribuicao/`,
   sem checagem de atribuição prévia; mantido de propósito na revisão do
   PRD (`docs/prd.md`, Q9 / RN-18).

3. ~~**`criarRascunhoNC`** atribui só o criador como colaborador~~ —
   **RESOLVIDO em parte.** A rota `POST /registros/:id/colaboradores` já
   existe. O PRD (Q10 / RF-01) decidiu que a criação da NC aceita
   colaboradores no mesmo passo — implementação pendente.

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

7. ~~**`submeterNCParaFechamento`** (a guarda de fechamento) ainda
   bloqueada~~ — **implementada** em `submeterNC`, mas a regra foi revista
   no PRD (`docs/prd.md`, Q1 / RN-21): passa a exigir também todos os
   planos de Ação Corretiva aprovados. Junto, a reação a `NAO_EFICAZ` deve
   reabrir só o que estiver fechado (Q2 — hoje dá erro se a NC estiver
   aberta) e `PARCIALMENTE_EFICAZ` deve copiar todos os colaboradores (Q3).
   Implementação pendente.

8. ~~**Listagem de NCs (`listarNC`)** — hoje sem filtros nem paginação~~ —
   **RESOLVIDO.** `GET /nc` aceita `estado`, `origem`, `classificacao`,
   `de`/`ate`, `minhas` e `cursor`/`limit`. Ver seção "Filtros de listagem
   de NC, tipo `Ator`..." no topo do documento.

9. **Módulo Feed** (comentários, respostas, menções `@`/`#`) — não
   iniciado. Depende do módulo `nc/` estar mais maduro.

10. **Documentação OpenAPI** — não iniciada. `fastify-type-provider-zod`
    já está em uso, o que facilita gerar isso a partir dos schemas
    existentes quando chegarmos nessa etapa.

11. **Arquivos de teste manual** (`requests.http`, `requests-modos-falha.http`,
    `requests-contencao.http`, `setup-usuarios-teste.sql`) reorganizados
    da raiz do projeto para a pasta `testes/`.

12. ~~**Reorganizar `modulos/nc/` em subpastas por entidade**~~ —
    **RESOLVIDO.** `nc/nc/`, `nc/contencao/`, `nc/classificacao/`,
    `nc/investigacao/`, `nc/acao-corretiva/`, `nc/verificacao/`.

13. ~~**Criar tipo `Ator`**~~ — **RESOLVIDO.**
    `compartilhado/entidades/ator.ts`, 65 ocorrências substituídas em 10
    arquivos. Ver seção "Filtros de listagem de NC, tipo `Ator`..." no
    topo do documento.

14. **Gerenciamento de usuários** — o módulo `usuario` só tem `POST
    /usuarios` (criar). Faltam: listagem/busca (nem por email), revogar
    um papel específico (`usuarioPapelRepository` só tem `concederPapel`,
    sem `revogarPapel`, sem campo `revogadoEm` em `UsuarioPapel`), e
    inativar um usuário (`Usuario` sem campo `ativo`/`desativadoEm` —
    `authService.fazerLogin` não tem o que checar). Descoberta desta
    sessão, sem decisão de design ainda sobre como deveria funcionar
    (revogar papel × inativar usuário × os dois, e o que acontece com
    atribuições/registros que a pessoa já tinha).