---
name: item
description: O ciclo de um item da fase, do planejamento ao commit — escolhe o próximo item pelo plano e pelo handoff, diz de quem é e o que tem de novo, chama as skills do agent-skills que o item pedir (interview-me, idea-refine, doubt-driven, source-driven, TDD, incremental), revisa o diff do item (code-simplification e code-review-and-quality), verifica pela /verificar e registra nos documentos. Use quando Matthew disser "próximo item", "vamos para o próximo passo", pedir para começar uma entrega do plano, ou chamar /item.
---

# Um item da fase

O roteiro chama as skills do `agent-skills` **pelo nome**, no momento certo, e acrescenta só o
que é do projeto. Não copie o conteúdo delas para cá: o plugin é atualizado e a cópia
envelheceria. Peça antes de cada commit. O push, Claude dá depois da `/verificar` (`CLAUDE.md`, "Ambiente").

## 1. Escolher o item

- O próximo pela ordem: o "Próximo passo" do `handoff.md` e a tabela da fase no
  `docs/plano-implementacao.md` (o que não está **Feito**). Matthew pode escolher outro.
- Diga, em poucas linhas (regra do `CLAUDE.md`):
  - **de quem é**: 🧑 (Matthew escreve, no passo a passo combinado em 2026-10-05) ou 🤖;
  - **o que tem de novo** para Matthew, ou "já aprendido" (e onde: o `handoff.md` §2 lista o
    que ele aprendeu na fase);
  - **que arquivos** o item toca, depois de ler o código (não pelo nome).
- **Espere o "pode"** antes de seguir. Matthew pode pegar um item 🤖 de volta.

## 2. Antes do código (só o que o item pedir)

Uma por vez, com o ok de Matthew:

| Situação | Skill |
|---|---|
| Regra vaga, decisão de produto em aberto | `agent-skills:interview-me` |
| Mais de um caminho técnico, decisão de arquitetura | `agent-skills:idea-refine` |
| Alto risco: sessão, permissão, migration, concorrência | `agent-skills:doubt-driven-development` |
| Biblioteca nova ou dúvida de API (Fastify, Prisma, Zod) | `agent-skills:source-driven-development` |
| Funcionalidade nova grande (bloco C) | `/agent-skills:spec`, depois `/agent-skills:plan` |

As skills do bloco atual estão na linha da fase da tabela §2 do `docs/colinha-agent-skills.md`.

**Suposição que não se confirmar no código** (como o `listarX` que não era igual nos seis, no
lote 5 da A5): pare, mostre o que achou e pergunte antes de mudar o rumo combinado.

**Decisão de arquitetura** (padrão de módulo, contrato da API, algo que outra fase vai herdar):
vai para o `docs/changelog-arquitetura.md` antes de mexer no código.

## 3. Executar

- `agent-skills:test-driven-development`: regra nova e bug começam por um teste que falha.
  Trava que passa de primeira precisa de prova de quebra (`/verificar` §2).
- `agent-skills:incremental-implementation`: mais de um arquivo → fatias. Cada fatia termina
  com a `/verificar` no nível B e pode virar um commit.
- **Item 🧑:** um passeio curto pelo código que o item toca, depois um passo por vez (o
  conceito, qual arquivo, onde, o que escrever); Claude revisa e roda os testes antes do
  próximo. Sem colar a solução inteira, salvo se ele pedir.
- **Achou um bug no caminho:** `/bug` (registrar), o teste que falha, o conserto, `/bug`
  (fechar).
- **Quebrou e a causa não é óbvia:** `agent-skills:debugging-and-error-recovery`.
- Notou algo fora do item: anote (handoff, pendências) em vez de consertar junto.

## 4. Revisar o diff do item

Com os testes verdes, sobre o diff do item (`git diff <commit antes do item>`, mais o que
ainda não foi commitado). É o "refatorar" do TDD, que não se pula:

1. `agent-skills:code-simplification`: **mostre a proposta antes de aplicar** e aplique só
   com o ok de Matthew. Limpeza aplicada sem ele ver faz o código deixar de ser reconhecível.
2. `agent-skills:code-review-and-quality`: os achados por severidade. O obrigatório se resolve
   antes do commit (bug pelo `/bug`); o opcional é decisão de Matthew; o que fica para depois
   vai para o handoff ou para o plano.

Diff acima de **~400 linhas**: revise por fatia (acima disso a revisão perde eficácia). A
revisão do fim da fase (`/abrir-pr` §7) continua, com outro foco: o conjunto dos itens.

## 5. Verificar

`/verificar`, no nível C (é o último commit do item), depois da revisão, para cobrir o que
ela mudou.

## 6. Registrar e commitar

1. **Documentos** (só o que mudou):
   - plano: a entrega com **Feito** (`<AAAA-MM-DD>`) e o resumo do que entrou; linha no
     histórico se o plano mudou;
   - changelog: a decisão e o porquê (`agent-skills:documentation-and-adrs` se for uma decisão
     com alternativas descartadas);
   - `CLAUDE.md`: se o item mudou uma regra que a seção de arquitetura ou de entidades
     descreve;
   - `handoff.md`: o "Próximo passo", o número da suíte (§2) e o que Matthew aprendeu.
2. **Commits:** código e documentação em commits separados (`feat:`/`fix:`/`refactor:` e
   `docs:`), formatação automática à parte. Mostre os arquivos e as mensagens, com o resumo da
   `/verificar`, e espere o ok.
3. **PR:** se a descrição do PR da fase não fala do item, avise; o `/abrir-pr` atualiza.

## 7. Próximo

Diga qual é o próximo item (passo 1) e espere: Matthew decide se segue, para ou troca de PC.
