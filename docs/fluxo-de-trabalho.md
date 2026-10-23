# Fluxo de trabalho com modelos e esforços

> **Proposta** (2026-10-21, na nuvem), para Matthew revisar. Nada daqui vale
> antes do ok dele; o que muda em outros documentos está no §7.

## 1. O princípio

A confiança para o deploy vem dos **portões** que pegam o erro de qualquer
modelo (testes, tipos, CI, revisão, teste manual), não da escolha do
modelo. Modelo e esforço mudam três coisas: o custo, a velocidade e quantos
erros chegam aos portões. Por isso este documento tem duas partes: quem faz
o quê (§2 a §5) e os portões que faltam (§6).

## 2. Os papéis

| Papel | Modelo e esforço | Quando |
|---|---|---|
| **Planejar e decidir** | Opus 5.5, `high`; `xhigh` em sessão, permissão, migration e concorrência | Spec da fase, plano do item, `idea-refine`, `doubt-driven-development` |
| **Fazer** | Sonnet 5.5, `medium` | Repetição de um padrão que Matthew já escreveu e validou, componentes a partir do mockup, testes a partir da spec, documentos |
| **Revisar** | Opus 5.5, `high`, **em contexto limpo** | A revisão de cada item e da fase. **Nunca** o mesmo agente que escreveu: quem revisa não pode ter os pontos cegos de quem fez |
| **Buscar** | Haiku 5.5, `low` | Inventários (como o das rotas, 2026-10-21), log do CI, "onde isso é usado" |

O que **não** tem modelo: a `/verificar` (lint, tipos, testes, cobertura,
diff-cover). Ela não opina, então é o portão mais confiável.

Quem escreve continua pela regra do `CLAUDE.md` ("Como trabalhamos"):
Matthew escreve o que ensina conceito novo (itens 🧑); os papéis acima são
para o que é do Claude (🤖).

## 3. Como se configura

- **A sessão principal** (onde Matthew conversa): Opus 5.5, trocado pelo
  `/model` quando fizer sentido.
- **Os outros papéis viram agentes do projeto**, um arquivo cada em
  `.claude/agents/` (versionados: os mesmos nos dois PCs e na nuvem), com o
  modelo e o esforço no cabeçalho. Os quatro: `planejador`, `implementador`,
  `revisor` e `buscador`. São configuração: Matthew escreve (ou dita).
  **Antes de escrever:** conferir o formato exato do cabeçalho na
  documentação do Claude Code (`source-driven-development`), em vez de
  supor.
- O `revisor` usa as skills de revisão do `agent-skills`
  (`code-review-and-quality`; `security-and-hardening` no que mexe em
  sessão, permissão ou entrada de usuário).

## 4. O ciclo de um item (o `/item` com papéis)

1. **Plano:** o `planejador` propõe; Matthew aprova antes de qualquer
   código.
2. **Teste que falha:** Matthew, nos itens 🧑; o `implementador`, nos de
   repetição.
3. **Código:** o `implementador`; nos de alto risco (sessão, permissão,
   migration, concorrência: a tabela do `/item` §2), o `planejador`
   escreve.
4. **`/verificar`**, no nível que o `CONSTRAINTS.md` §4 pede.
5. **Revisão em contexto limpo:** o `revisor`, sobre o diff do item. O
   obrigatório se resolve antes do commit; o opcional, Matthew decide.
6. **Matthew lê o diff e explica em duas frases** o que mudou e por quê,
   antes de pedir o commit. É a trava contra "deixei de reconhecer o
   código" (2026-10-05).

## 5. O ciclo de uma fase, com o design e o front

| Fase | Quem faz | Quem revisa |
|---|---|---|
| **B2** wireframes | Claude no Figma (sessão principal) | Matthew ajusta; conferir o G1 |
| **B3** fundações e mockups | Matthew, no Figma | `revisor` com o `design-taste-frontend` (telas de app) e o contraste nos dois modos |
| **B4** protótipo HTML | `implementador` | `revisor`; depois, o teste com 3 colegas |
| **C0–C8** fatias | A primeira tela de cada tipo, Matthew; as repetições, o `implementador` | `revisor` com o `frontend-ui-engineering`; a jornada da fatia no Playwright (§6) |
| **Fim de toda fase** | — | `/abrir-pr` §7: o `revisor` sobre o diff inteiro, com foco no conjunto |

## 6. Os portões que faltam para o deploy

Valem com qualquer modelo. Hoje o plano não tem teste no navegador: "os
fluxos completos continuam garantidos pelos testes de API" (plano §5). A
API pode estar certa e a tela, quebrada.

1. **Playwright nas jornadas críticas** (J1 registrar, J2 classificar, J5
   ação corretiva, J6 fechar e J8 aprovar, do `fluxo-app.md` §5), contra a
   API de verdade com o banco do Testcontainers, no CI, a partir da C1. Cada
   fatia da C acrescenta a jornada dela.
2. **`axe` dentro desses testes:** a acessibilidade do G5 conferida a cada
   push, e não só na C8.
3. **O cliente gerado pelo Orval** (já na C0): se a API mudar, o front para
   de compilar, em vez de quebrar em produção.
4. **O ensaio de voltar versão** (rollback) na D1, junto do teste de
   restauração do backup que ela já tem.
5. **Congelar antes do piloto (D2):** só entra conserto de bug, e todo bug
   começa por um teste que falha (como hoje).

## 7. O que muda em outros documentos (com o ok)

- `docs/plano-implementacao.md`: o Playwright e o `axe` na C0 (montar) e na
  C1 (a primeira jornada); o ensaio de rollback na D1; o congelamento na D2.
- `.claude/skills/item/SKILL.md`: os passos 4 e 6 do §4 acima (o `revisor`
  em contexto limpo e a explicação de Matthew antes do commit).
- `.claude/skills/abrir-pr/SKILL.md` §7: a revisão da fase pelo `revisor`.
- `CONSTRAINTS.md`: o Playwright como check do CI (bloqueia), quando
  existir.
- `CLAUDE.md`: uma linha na tabela de documentos, apontando para cá.
- `.claude/agents/`: os quatro agentes (Matthew).

## 8. Custo

Opus em `high` como `planejador` e `revisor` de todo item gasta a cota
mais rápido. Se apertar, o primeiro corte é o plano dos itens de repetição
(o `implementador` segue o padrão sem plano próprio), **nunca** a revisão.

## Histórico

| Data | Mudança |
|---|---|
| 2026-10-21 | v0 — proposta: os quatro papéis, o ciclo do item e da fase, e os portões que faltam (Playwright, `axe`, rollback, congelamento) |
