# Colinha — skills do `agent-skills`

> Para deixar aberta do lado. Os nomes conferem com o plugin instalado
> (`agent-skills@addy-agent-skills`, v0.6.10). Para chamar, escreva "atue com
> `<skill>`", ou use um atalho de barra da §4.

## 1. Roteiro rápido: avançar um passo

**Início do dia:** `/retomar`.

**Começo de fase:** `/comecar-fase` (o `/fechar-fase` aponta para ela). Lê a fase no plano
com você, puxa a linha da §2, diz em cada entrega o que é seu e o que é novo, e quando cabe
`interview-me`, `idea-refine`, `doubt-driven-development` ou `spec` + `plan`. Termina com o PR
em rascunho.

**Cada item da fase:** `/item`. Diz o que é novo para você e espera o "pode"; antes do
código, chama `interview-me`, `idea-refine`, `doubt-driven-development` ou
`source-driven-development` se o item pedir; executa com `test-driven-development` e
`incremental-implementation`; revisa o diff do item com `code-simplification` (proposta
mostrada antes) e `code-review-and-quality` (por fatia, acima de ~400 linhas); verifica pela
`/verificar`; registra nos documentos e pede o commit.

**Verificação (antes de commit e de push):** `/verificar`. Escolhe o nível pelo
`CONSTRAINTS.md` §4 e, antes do push, roda o diff-cover.

**Fim da fase:** diga "a fase acabou" e chame o `/abrir-pr`. O §7 dele roda
`code-review-and-quality`, `security-and-hardening` (se mexeu em login, sessão, permissão,
entrada ou CI) e `documentation-and-adrs` no diff da fase, confere o "pronto quando" (§1.1),
tira o PR do rascunho e entrega a mensagem do merge. Você faz o merge → `/fechar-fase`.

**Saída:** `/trocar-pc`.

## 2. Por fase do nosso plano

| Fase | Skills que mais ajudam |
|---|---|
| **A4** Sessão nova | `test-driven-development`, `code-simplification` (o `ciclo-vida`), `security-and-hardening` (cookie, `helmet`), `doubt-driven-development` (auth), `ci-cd-and-automation` (os checks do `CONSTRAINTS.md`) |
| **A5** Contrato da API | `api-and-interface-design`, `documentation-and-adrs`, `source-driven-development` (`@fastify/swagger`), `security-and-hardening` (L4, L5, CSP da documentação), `idea-refine` (as funções repetidas dos services) |
| **A6** Usuários e setores | `interview-me` (a trava da RN-43), `spec-driven-development`, `test-driven-development`, `security-and-hardening` (permissões de `ADMIN`, convite, inativação), `doubt-driven-development` (convite novo invalida os antigos, senha redefinida derruba as sessões), `idea-refine` (o script do primeiro acesso) |
| **B** Design | Fora do `agent-skills`: as skills de design instaladas (`impeccable`, `taste-skill`) |
| **C** Frontend | `spec-driven-development` por fatia, `frontend-ui-engineering`, `browser-testing-with-devtools`, `performance-optimization` |
| **D** Produção | `shipping-and-launch`, `ci-cd-and-automation`, `observability-and-instrumentation`, `security-and-hardening` |

---

## 3. Qual skill, em que momento

### Antes do código

| Skill | Quando |
|---|---|
| `interview-me` | A ideia ou a regra está vaga. Uma pergunta por vez, até ficar claro |
| `idea-refine` | Há mais de um caminho. Abrir as opções e depois escolher uma |
| `spec-driven-development` | Funcionalidade nova ou mudança grande, sem spec escrito |
| `constraint-driven-development` | Calibrar o `CONSTRAINTS.md` (já feito; usar de novo quando a régua mudar) |
| `doubt-driven-development` | Decisão de alto risco (sessão, migration, concorrência): cada premissa passa por revisão antes de valer |

### Estrutura

| Skill | Quando |
|---|---|
| `api-and-interface-design` | Rotas, schemas Zod de entrada e saída, status HTTP, fronteiras entre módulos |
| `deprecation-and-migration` | Remover ou renomear coluna, rota ou função; trocar versão de biblioteca |
| `source-driven-development` | Conferir na documentação oficial (Fastify, Prisma, Zod) antes de implementar |

### No código

| Skill | Quando |
|---|---|
| `planning-and-task-breakdown` | O spec está aprovado e precisa virar tarefas pequenas, em ordem |
| `incremental-implementation` | A tarefa mexe em mais de um arquivo: fatias pequenas, cada uma verificada |
| `test-driven-development` | Toda regra e todo bug: o teste que falha vem antes |
| `debugging-and-error-recovery` | Algo quebrou e a causa não é óbvia: hipótese, teste, uma variável por vez |
| `git-workflow-and-versioning` | Separar mudanças misturadas em commits limpos, resolver conflito |

### Telas (Bloco C)

| Skill | Quando |
|---|---|
| `frontend-ui-engineering` | Componentes React, shadcn/ui, estados de carregando, erro e vazio, acessibilidade |
| `browser-testing-with-devtools` | Ver no navegador de verdade: console, rede, DOM |
| `performance-optimization` | Tela ou consulta lenta: medir antes de otimizar |

### Qualidade e entrega

| Skill | Quando |
|---|---|
| `security-and-hardening` | Mexeu em login, sessão, permissão ou entrada de usuário |
| `code-simplification` | Funciona e os testes passam, mas ficou pesado |
| `code-review-and-quality` | Antes de abrir o PR: revisão nos 5 eixos |
| `documentation-and-adrs` | Decidiu algo, criou rota, mudou variável de ambiente |
| `ci-cd-and-automation` | Mexer no CI (os checks do `CONSTRAINTS.md`, na A4) |
| `observability-and-instrumentation` | Logs, monitor e alertas de produção (D1) |
| `shipping-and-launch` | Checklist antes de produção, plano de rollback (D1–D3) |

### Sobre o próprio trabalho com o agente

| Skill | Quando |
|---|---|
| `using-agent-skills` | Não sabe qual skill usar: ela escolhe |
| `context-engineering` | As respostas pioraram, a conversa ficou longa, ou vai trocar de tarefa |

## 4. Atalhos de barra do plugin

| Atalho | Faz |
|---|---|
| `/agent-skills:spec` | Spec antes do código |
| `/agent-skills:plan` | Quebra em tarefas |
| `/agent-skills:build` | Implementa em fatias |
| `/agent-skills:test` | TDD |
| `/agent-skills:review` | Revisão de código |
| `/agent-skills:code-simplify` | Simplificação |
| `/agent-skills:constraints` | Contrato de qualidade |
| `/agent-skills:ship` | Preparar a entrega |
| `/agent-skills:webperf` | Auditoria de desempenho web |

O plugin também traz quatro agentes (`code-reviewer`, `security-auditor`, `test-engineer`,
`web-performance-auditor`). Eles só rodam quando você pede explicitamente ("use o agente X").

## 5. As nossas skills (`.claude/skills/`)

| Skill | Quando |
|---|---|
| `/retomar` | Chegou no PC (início do dia, ou depois de trocar de máquina) |
| `/trocar-pc` | Vai sair deste PC |
| `/abrir-pr` | Abrir ou atualizar o PR, acompanhar o CI e, no fim da fase, as revisões e a mensagem do merge |
| `/comecar-fase` | Começo de fase: ler a fase, as skills de cada entrega, PR em rascunho |
| `/fechar-fase` | Depois do merge: voltar para a `main`, abrir a próxima branch e, no fim de cada bloco (A, B, C, D), rever as skills |
| `/bug` | Achou um bug, ou terminou o conserto de um: registrar ou fechar nos documentos |
| `/item` | Cada item da fase: escolher, planejar (as skills de antes do código), executar, revisar, verificar e registrar |
| `/verificar` | Antes de commit e de push: lint, typecheck, testes no nível do `CONSTRAINTS.md` §4, diff-cover |

## 6. Entender o código sem encher o contexto

| Ferramenta | O que faz | Quando |
|---|---|---|
| Agente `Explore` (do Claude Code) | Lê os arquivos num contexto **separado** e devolve só a conclusão ("o item toca estes arquivos, o padrão é este"). Nada para manter | Dia a dia: descobrir o que um item toca antes de abrir arquivo. Peça "use o Explore para..." |
| `/understand-anything:understand` | Analisa o projeto e grava um **grafo de conhecimento** em `.ua/knowledge-graph.json` (arquivos, funções, camadas, quem chama quem, um resumo de cada um). As outras abaixo dependem dele | Uma vez, antes de usar as outras. Cara na primeira vez (vários agentes); `--language pt` para os textos em português, `--exclude` para os testes. Envelhece: `--auto-update` atualiza a cada commit |
| `/understand-anything:understand-onboard` | Roteiro guiado pelo código, em ordem didática | O passeio guiado pelo código (`handoff.md` §6) |
| `/understand-anything:understand-chat` | Perguntas sobre o código, respondidas pelo grafo | "Onde fica X?", "quem usa Y?" |
| `/understand-anything:understand-explain` | Explicação a fundo de um arquivo, função ou módulo | Reconhecer um pedaço do código antes de mexer |
| `/understand-anything:understand-diff` | O que um diff ou PR muda, o que afeta e onde está o risco | Revisão de um item ou de uma fase |
| `/understand-anything:understand-dashboard` | O grafo num painel interativo | Ver a arquitetura de cima |

Os resumos do grafo são escritos por IA: servem de mapa, e a decisão continua sendo tomada
lendo o código. **Em aberto** (decidir depois do passeio): o grafo fica, com a atualização
automática? O `.ua/` entra no Git (um JSON grande que muda a cada commit) ou cada PC gera o seu?
