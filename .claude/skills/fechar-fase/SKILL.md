---
name: fechar-fase
description: Rotina depois do merge de um Pull Request — volta para a main atualizada, apaga a branch local, registra a fase concluída nos documentos e abre a branch da próxima fase. Use quando Matthew disser que fez o merge, pedir para fechar a fase, ou chamar /fechar-fase.
---

# Fechar a fase (depois do merge)

Nunca apague branch remota sem pedido explícito. O push da branch nova, Claude dá
(`CLAUDE.md`, "Ambiente").
Peça antes de cada commit.

## 0. Preparar o shell

O passo 0 da `/verificar`.

## 1. O merge aconteceu?

Ache o PR da branch atual: `gh pr list --head <branch> --state all --json number,state,mergedAt`.

- `MERGED`: siga.
- Aberto ou fechado sem merge: pare e diga o estado. Não há nada a fechar.

## 2. Voltar para a `main`

1. `git status -sb`: mudança sem commit nesta branch → pare e pergunte (o `switch` a levaria
   junto ou falharia).
2. `git switch main`, `git pull`, `git fetch --prune`.
3. `git log --oneline -1`: o commit de merge do PR tem de estar no topo (ou logo abaixo).
4. `git branch -d <branch>`. Só `-d`: ele recusa apagar o que não foi mesclado. Se recusar,
   pare e mostre; **nunca** `-D`.
5. A branch remota sumiu (`git branch -r`)? Se ainda existir, diga a Matthew (o GitHub pode
   apagar sozinho no merge); não a apague sem pedido.

## 3. A próxima branch

- Pela ordem do `docs/plano-implementacao.md`, diga qual é a próxima fase e proponha o nome
  `fase/<id>-<assunto>` (minúsculas, sem acento). Espere o ok antes de criar
  (`git switch -c <nome>`).
- Branch que não era de fase (ex.: `chore/...`): a próxima vem do "Próximo passo" do
  `handoff.md`. Pergunte antes de supor.

## 4. Registrar nos documentos (na branch nova: a `main` é protegida)

**Se a branch mesclada era de fase:**

- `docs/plano-implementacao.md`, histórico: a linha
  `| <AAAA-MM-DD> | **<ID> concluída** (branch \`<branch>\`, PR #<n>): <o que entregou, em uma frase> |`,
  no mesmo formato das linhas das fases anteriores.
- `docs/changelog-arquitetura.md`: confira se existe a seção `### Fase <ID> — ...`. Se não
  existir, avise (não invente decisões: elas vêm da conversa e dos commits).
- `CLAUDE.md`: frases sobre o estado da fase ("Falta fechar a fase", PR em aberto, bugs da
  fase) passam para o passado.

**Sempre:**

- `handoff.md`: objetivo e estado (a fase fechada, a branch nova), "Arquivos no meio de uma
  mudança" e "Próximo passo" (o primeiro item da fase nova, na ordem do plano). As mesmas
  6 seções.

Mostre os arquivos e a mensagem (`docs: <ID> concluída e abertura da <próxima>`, ou
`docs: abertura da <próxima>`) e espere o ok para o commit.

## 5. Rever as skills (fim de bloco)

Só quando a fase que fechou é a última do seu bloco do plano, isto é, a próxima começa com
outra letra (A6 → B, B → C0, C8 → D0; e a última fase da D). Nas outras, pule este passo.

Com Matthew, poucas perguntas sobre o bloco que fechou:

- O que foi feito à mão mais de uma vez e podia virar passo de uma skill nossa
  (`.claude/skills/`)?
- Algum passo de skill foi pulado, deu errado ou ficou desatualizado?
- As linhas das fases do próximo bloco na tabela §2 da `docs/colinha-agent-skills.md` ainda
  servem?

Mudança proposta: mostre o texto e espere o ok; entra num commit `chore:` próprio, separado
do registro da fase. Nada a mudar: diga e siga.

## 6. Retomar

- Branch nova de fase: o próximo passo é o `/comecar-fase`. Pergunte se Matthew começa agora
  ou depois (outro dia, outro PC); depois, o `handoff.md` já aponta para ele.
- Outra branch: o primeiro item do "Próximo passo" pela `/item`.
