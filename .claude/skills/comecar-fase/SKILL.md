---
name: comecar-fase
description: Rotina de começo de fase — lê a seção da fase no plano com Matthew, aponta as skills que vão ajudar, classifica cada entrega (de quem é, o que tem de novo, o que pede interview-me, doubt-driven ou spec antes do código) e abre o PR em rascunho. Use depois do /fechar-fase, quando Matthew for começar uma fase, ou chamar /comecar-fase.
---

# Começar a fase

Nada de código aqui: a skill termina no primeiro item da fase, na regra do `CLAUDE.md`.
Peça antes de cada commit.

## 0. Preparar o shell

O passo 0 da `/verificar`.

## 1. A branch

- `git status -sb`. Mudança sem commit: pare e pergunte.
- O certo é uma `fase/<id>-<assunto>` saída da `main` atualizada (o `/fechar-fase` costuma
  criá-la). Na `main` ou em outra branch: diga qual é a próxima fase pela ordem do
  `docs/plano-implementacao.md`, proponha o nome e espere o ok antes de criar.

## 2. Ler a fase, juntos

Mostre a seção da fase no plano (objetivo, entregas, aprendizado) e o que o `handoff.md` deixou
pendente para ela. Resuma em poucas linhas e pergunte se algo mudou desde que o plano foi
escrito. Mudou: o plano se atualiza primeiro (linha no histórico), com o ok de Matthew.

## 3. As skills da fase

A linha da fase na tabela §2 do `docs/colinha-agent-skills.md`: diga quais skills ajudam e em
qual entrega. Fase sem linha: proponha uma e, com o ok, acrescente.

Plugin `agent-skills` ausente nesta máquina: avise (o `/retomar` diz como instalar) e siga sem
ele.

## 4. Cada entrega

Uma tabela, uma linha por entrega do plano, na ordem dele:

- **Quem:** 🧑 (Matthew escreve, passo a passo, regra no `CLAUDE.md`) ou 🤖, como está no plano.
- **Novo para Matthew:** o conceito que a entrega ensina, ou "já aprendido" (e onde).
- **Antes do código**, quando couber:
  - regra vaga ou decisão de produto em aberto → `interview-me`;
  - mais de um caminho técnico → `idea-refine`;
  - alto risco (sessão, migration, concorrência, permissão) → `doubt-driven-development`;
  - funcionalidade nova grande (bloco C) → `/agent-skills:spec` e depois `/agent-skills:plan`.

Essas skills rodam com o ok de Matthew, uma por vez, quando a entrega chegar; antes, só se a
dúvida travar o plano da fase inteira.

## 5. O PR em rascunho

O PR nasce agora, não no fim. Ele precisa de pelo menos um commit na branch (o registro do
`/fechar-fase` serve). Commit sem push: `git push -u origin <branch>`. Depois, `/abrir-pr`: PR de fase em andamento nasce em rascunho.

## 6. Retomar

O primeiro item da fase pela `/item`, que começa dizendo se é algo que Matthew já aprendeu e
espera a confirmação antes de executar.
