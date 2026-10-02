# Colinha — skills do `agent-skills`

> Para deixar aberta do lado. Os nomes conferem com o plugin instalado
> (`agent-skills@addy-agent-skills`, v0.6.10). Para chamar, escreva "atue com
> `<skill>`", ou use um atalho de barra da §4.

## 1. Roteiro rápido: avançar um passo

**Início do dia:** `/retomar`.

**Começo de fase** (depois do `/fechar-fase`):
1. Ler a seção da fase no plano, juntos.
2. Regra ainda vaga → `interview-me`. Duas saídas técnicas → `idea-refine`.
   Alto risco (sessão, migration, concorrência) → `doubt-driven-development`.
3. Funcionalidade nova grande (Bloco C) → `/agent-skills:spec` e depois `/agent-skills:plan`.
4. `/abrir-pr`, para o PR nascer em rascunho.

**Cada item da fase:**
1. O Claude diz o que é novo para você e espera o "pode".
2. Bug → `test-driven-development` (o teste que falha primeiro). Regra nova → idem.
3. Mais de um arquivo → `incremental-implementation` (fatia, verifica, fatia).
4. Biblioteca nova ou dúvida de API → `source-driven-development`.
5. Quebrou e não se sabe por quê → `debugging-and-error-recovery`.
6. Ficou pesado → `code-simplification`. Decidiu algo → `documentation-and-adrs`.
7. Commit pedido, com a verificação do `CONSTRAINTS.md` §4.

**Fim da fase:**
1. `code-review-and-quality` no diff da fase; `security-and-hardening` se mexeu em
   login, sessão, permissão ou entrada.
2. `documentation-and-adrs` para conferir os documentos contra o código.
3. `/abrir-pr`: "pronto quando" (§1.1), PR fora do rascunho, CI verde, mensagem do merge.
4. Você faz o merge → `/fechar-fase`.

**Saída:** `/trocar-pc`.

## 2. Por fase do nosso plano

| Fase | Skills que mais ajudam |
|---|---|
| **A4** Sessão nova | `test-driven-development`, `code-simplification` (o `ciclo-vida`), `security-and-hardening` (cookie, `helmet`), `doubt-driven-development` (auth), `ci-cd-and-automation` (os checks do `CONSTRAINTS.md`) |
| **A5** Contrato da API | `api-and-interface-design`, `documentation-and-adrs`, `source-driven-development` (`@fastify/swagger`) |
| **A6** Usuários e setores | `interview-me` (a trava da RN-43), `spec-driven-development`, `test-driven-development` |
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
| `/abrir-pr` | Abrir ou atualizar o PR, acompanhar o CI e receber a mensagem do merge |
| `/fechar-fase` | Depois do merge: voltar para a `main` e abrir a próxima branch |
| `/bug` *(planejada, A4)* | Registrar e fechar bug nos documentos |
