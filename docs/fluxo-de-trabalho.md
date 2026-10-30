# Fluxo de trabalho com modelos e esforços

> **v1, aprovada por Matthew em 2026-10-30** (§1 a §9 e §11). O §10, os
> portões para o deploy, continua **proposta** da v0 (2026-10-21), sem o ok.
> O §11 diz o que falta construir e de quem é cada parte.

## 1. O princípio

A confiança para o deploy vem dos **portões** que pegam o erro de qualquer
modelo (testes, tipos, CI, revisão, teste manual), não da escolha do
modelo. Modelo e esforço mudam o custo, a velocidade e quantos erros chegam
aos portões.

O que trava Matthew é a **janela de 5 horas** do plano Pro (a semanal acabou
pela primeira vez em 2026-10-29, um dia antes de renovar). A economia vem de
três lugares, nesta ordem:

1. **Nenhum modelo onde um script basta** (o degrau 0, §2).
2. **Contexto enxuto**: cada mensagem reenvia a conversa inteira, e cada
   subagente recebe o `CLAUDE.md` (§8). Em 2026-10-30, uma sessão longa chegou
   a 220 mil tokens; um subagente de pesquisa gastou 132 mil.
3. **O modelo certo para cada papel** (§2 e §3).

## 2. Os degraus

| Degrau | Modelo e esforço | Faz | Nunca |
|---|---|---|---|
| **0. Automático** | nenhum | O que se confere sozinho: `npm run verificar`, o pre-commit, os bloqueios, o aviso de início de sessão (§9) | — |
| **Buscador** | Haiku 5.5, `low` | Inventários, "onde isso é usado", "existe ou não existe", o log do CI, conferir se os dois PCs estão no mesmo commit | Escrever código, revisar, decidir, explicar para Matthew |
| **Implementador** | Sonnet 5.5, `medium` | Repetição de um padrão que Matthew já escreveu e validou, componentes a partir do mockup, testes a partir da spec, documentos | Item 🧑; item de alto risco |
| **Planejador** | Opus 5.5, `high`; `xhigh` em sessão, permissão, migration e concorrência | Spec da fase, plano do item de risco, `idea-refine`, `doubt-driven-development` | — |
| **Revisor** | Opus 5.5, `high`, **em contexto limpo** | A revisão de cada item e da fase, com as lentes do `agent-skills` (`code-review-and-quality`; `security-and-hardening` em sessão, permissão ou entrada de usuário; `test-engineer` nos testes) | Revisar o que ele mesmo escreveu |

- **O Haiku só no que se confere por um número ou uma citação** (o código de
  saída, o hash, `arquivo:linha`), e Claude confere esse número antes de
  dizer "passou". O `/verificar` **não** é dele: é do degrau 0.
- **O buscador leva escritas nele** as regras de que depende (a busca lida
  inteira, sem `head`/`tail`, com `arquivo:linha`; nenhum `--force`; português),
  porque é ali que o incidente de 2026-10-21 aconteceria de novo.
- **O revisor é sempre Opus.** Sonnet revisando Sonnet tem os mesmos pontos
  cegos. Se a cota apertar, o primeiro corte é o plano dos itens de
  repetição, **nunca** a revisão.
- Quem escreve continua pela regra do `CLAUDE.md` ("Como trabalhamos"): os
  itens 🧑 são de Matthew; os papéis acima são para o que é do Claude (🤖).

## 3. A sessão principal

A sessão onde Matthew conversa tem o modelo do **tipo da fase**:

- **Opus:** as fases de decisão (design, arquitetura, a revisão da fase, o
  `/comecar-fase`).
- **Sonnet:** as fases de código que repete padrão (boa parte do bloco C).

O modelo se escolhe **ao abrir a sessão**, nunca no meio: trocar no meio
relê a conversa inteira no modelo novo, sem cache. Para trocar: o handoff em
dia, commit, e uma sessão nova. A tabela das entregas do `/comecar-fase` tem
a coluna **"quem do time"**, com o papel e o modelo de cada entrega.

**Uma sessão, um assunto.** A ponte entre sessões é o `handoff.md`, não a
memória da conversa.

## 4. A delegação

- **Itens 🤖:** Claude avisa e segue (a autorização de 2026-10-28 no
  `CLAUDE.md`), e delega sozinho ao degrau certo.
- **Aprovação antes:** só nos itens 🧑 e nas decisões de produto ou de marca
  (as mesmas do "perguntar só o que for muito importante").
- **A linha "Time:"**, só nas respostas em que houve delegação: quem fez, o
  modelo, o resultado e, quando se sabe, os tokens. Exemplo:
  `Time: buscador (Haiku), 82 rotas, nenhuma sem teste.`

## 5. O ciclo de um item

1. **Plano:** o planejador, só nos itens de risco (a tabela do `/item` §2);
   Matthew aprova antes de qualquer código.
2. **Teste que falha:** Matthew, nos itens 🧑; o implementador, nos de
   repetição.
3. **Código:** o implementador; nos de risco, o planejador.
4. **`npm run verificar`**, no nível que o `CONSTRAINTS.md` §4 pede.
5. **Revisão em contexto limpo:** o revisor, sobre o diff do item. O
   obrigatório se resolve antes do commit; o opcional, Matthew decide.
6. **Matthew lê o diff e explica em duas frases** o que mudou e por quê. É a
   trava contra "deixei de reconhecer o código" (2026-10-05), e o que o ajuda
   a julgar a qualidade.
7. **Commit, push e uma linha no handoff.** O handoff vai em dia a cada item
   fechado, para o fim de sessão (§6) sair barato.

## 6. O protocolo do limite

| Janela de 5 horas | O que acontece |
|---|---|
| **70%** | Claude avisa, com o horário em que renova |
| **90%** | Claude termina o passo, atualiza o handoff, commit e push. Nada fica só na conversa |
| **Acabou** | O Antigravity (§7), ou o que Matthew adianta sozinho: um item 🧑, o roteiro de um teste, o estudo |

- **De onde vem o número:** no terminal, a barra de status (ela recebe
  `rate_limits.five_hour.used_percentage`); no app, Claude consulta o uso nas
  fronteiras de item (uma chamada, não a cada mensagem).
- **O ritmo da semana**, no começo de cada sessão: a semanal renova na
  sexta, às 5h; o ritmo seguro é cerca de **14% por dia**.

## 7. A passagem para o Antigravity e a volta

O plano B é o Antigravity CLI (`agy`), pela assinatura Gemini Pro
(`SETUP.md` §12.4). Nunca o OpenCode com o login do Google.

**Indo:**

1. Claude escreve no `handoff.md` §6 a **ficha de passagem**: a tarefa exata,
   o que está feito, o que falta, os arquivos, o que não tocar e como saber
   que terminou.
2. Commit e push na branch de trabalho.
3. O `agy` lê o `AGENTS.md`, que manda ler o handoff, e começa pela ficha.

**Lá:** o `agy` trabalha numa branch própria, `agy/<branch de trabalho>`,
saída da branch de trabalho. Commita com `[agy]` no começo da mensagem e dá
push **só nela**, nunca na branch de trabalho nem na `main`. Assim o trabalho
passa de um PC para o outro sem entrar na branch de trabalho sem revisão. No
fim, uma linha no handoff dessa branch: o que fez e o que ficou.

**Voltando:**

1. O `/retomar` vê a `agy/<branch>` com commits novos.
2. O revisor confere o diff dela contra a branch de trabalho, em contexto
   limpo, com o `npm run verificar`.
3. Aprovado: a branch de trabalho avança até ela (`git merge --ff-only`) e a
   `agy/` é apagada. Com achado: conserta-se antes, como em qualquer revisão.

## 8. Contexto enxuto

- **O `handoff.md` em cerca de 10 KB**: só o estado (as 6 seções). O
  histórico vai para `docs/historico/`, e as skills que citam o handoff
  apontam para o lugar novo no mesmo commit.
- **O `CLAUDE.md` abaixo de 200 linhas** (a recomendação oficial). As regras
  de cada área (backend, front, testes) vão para `.claude/rules/`, com os
  `paths` de cada uma, e entram só quando o trabalho mexe ali. O `AGENTS.md`
  inclui essas regras também, porque o `agy` não lê o `.claude/rules/`.
- **Pesquisa é cara**: um subagente de pesquisa só quando a dúvida trava uma
  decisão.

## 9. Os automáticos (o degrau 0)

1. **`npm run verificar`**: o `/verificar` num script, que imprime `PASSOU`
   ou `FALHOU` por check e sai com erro se algum falhar.
2. **O pre-commit versionado** (`.githooks/pre-commit`, ligado pelo
   `npm run preparar` com o `core.hooksPath`): o lint antes de todo commit, de
   Claude, do `agy` ou de Matthew.
3. **Os bloqueios nas permissões** do `.claude/settings.json`, como no `agy`
   (`sudo`, `--force`, `git reset --hard`, push na `main`, `--no-verify`, o
   `.env`). São rede de proteção, não garantia: um `sh -c` passa por cima. A
   proteção real da `main` é a regra do GitHub.
4. **O aviso de início de sessão** (hook `SessionStart`, sem rede): o Docker
   está aberto? A branch está atrás da última busca da remota?
5. **A barra de status** no terminal, com o uso da janela e os avisos de 70%
   e 90%.

## 10. Os portões que faltam para o deploy (proposta da v0, sem o ok)

Valem com qualquer modelo. Hoje o plano não tem teste no navegador: "os
fluxos completos continuam garantidos pelos testes de API" (plano §5). A API
pode estar certa e a tela, quebrada.

1. **Playwright nas jornadas críticas** (J1 registrar, J2 classificar, J5
   ação corretiva, J6 fechar e J8 aprovar, do `fluxo-app.md` §5), contra a
   API de verdade com o banco do Testcontainers, no CI, a partir da C1.
2. **`axe` dentro desses testes:** a acessibilidade do G5 a cada push.
3. **O cliente gerado pelo Orval** (já na C0): se a API mudar, o front para
   de compilar.
4. **O ensaio de voltar versão** (rollback) na D1, com o teste de
   restauração do backup.
5. **Congelar antes do piloto (D2):** só entra conserto de bug, e todo bug
   começa por um teste que falha.

## 11. O que falta construir

Na ordem. 🧑 é de Matthew, passo a passo (configuração também é dele, regra
do `CLAUDE.md`); 🤖 é do Claude.

| # | O quê | Quem | Novo para Matthew |
|---|---|---|---|
| 1 | O handoff enxuto e o `docs/historico/`, com as skills apontando para lá | 🤖 implementador | — |
| 2 | `npm run verificar` | 🧑 | script de shell com código de saída |
| 3 | O pre-commit versionado e o `core.hooksPath` no `preparar` | 🧑 | hook do Git |
| 4 | Os bloqueios no `.claude/settings.json` | 🧑 (repete o do `agy`) | permissões do Claude Code |
| 5 | Os agentes `buscador`, `implementador`, `planejador` e `revisor` em `.claude/agents/` | 🧑 (dita); conferir o cabeçalho na documentação antes | agentes e frontmatter |
| 6 | As skills (`/item`, `/comecar-fase`, `/retomar`, `/encerrar`, `/abrir-pr`) e o `AGENTS.md` seguindo este documento | 🤖 implementador | — |
| 7 | O `CLAUDE.md` abaixo de 200 linhas e o `.claude/rules/` | 🤖 implementador; o revisor confere que nenhuma regra se perdeu | — |
| 8 | O hook `SessionStart` e a barra de status | 🧑 | hooks do Claude Code |
| 9 | O `/usage` depois de uma semana de uso, para ajustar | Matthew e Claude | — |

## 12. Custo

Opus em `high` como planejador e revisor gasta a cota mais rápido. O
primeiro corte é o plano dos itens de repetição; o segundo, sessões mais
curtas. **Nunca** a revisão.

## Histórico

| Data | Mudança |
|---|---|
| 2026-10-21 | v0 — proposta: os quatro papéis, o ciclo do item e da fase, e os portões que faltam (Playwright, `axe`, rollback, congelamento) |
| 2026-10-30 | v1 — aprovada: o degrau 0 (automáticos), o Haiku só no que se confere, o revisor sempre Opus, o modelo da sessão por tipo de fase escolhido ao abrir, a delegação de 2026-10-28, o protocolo do limite (70% e 90%), a passagem para o Antigravity numa branch `agy/`, o contexto enxuto e o que falta construir. Desenhada com Matthew, revisada por um agente adversário em contexto limpo |
