---
name: abrir-pr
description: Abre (ou atualiza) o Pull Request da branch atual com título e descrição no padrão do projeto, e acompanha o CI até o fim. Também tira o PR de fase do rascunho quando o "pronto quando" está cumprido. Use quando Matthew pedir para abrir o PR, atualizar a descrição, ou chamar /abrir-pr.
---

# Abrir o Pull Request

Nunca dê push, merge nem `gh pr merge`: o push e o merge são de Matthew.
Publicar no GitHub é ação externa: **mostre o título e a descrição e espere o ok** antes de
criar ou editar o PR.

## 0. Preparar o shell

`source ~/.nvm/nvm.sh` antes de npm/npx; checks pelo código de saída (`&& echo OK`).

## 1. Conferir a branch

- `git status -sb`. Na `main`: pare (ela é protegida; o trabalho vai numa branch).
- Mudança sem commit: liste e pergunte (o PR mostra só o que foi commitado).
- Commits sem push (`ahead`): pare e passe o comando exato para Matthew
  (`git push`, ou `git push -u origin <branch>` sem upstream). Continue depois do push.

## 2. Verificação local (`CONSTRAINTS.md` §4)

`git diff --name-only origin/main...HEAD`:

- Mudou código (`src/`, `prisma/`, `package*.json`, `vitest.config.ts`, `tsconfig.json`,
  `biome.json`, `.github/`): rode lint, typecheck e a **suíte completa** (`npm test`), a não ser
  que ela já tenha rodado verde **depois** do último commit de código nesta sessão.
- Só documentação: lint e typecheck bastam.
- Vermelho: pare e mostre. PR não se abre com check vermelho.

## 3. O PR já existe?

`gh pr list --head <branch> --state open --json number,url,isDraft`.

- Existe: o caminho é **atualizar** a descrição (`gh pr edit <n> --body-file -`) e, se o escopo
  mudou, o título. Mostre o que muda em relação à descrição atual (`gh pr view <n> --json body`).
- Não existe: criar (`gh pr create --base main --head <branch> --title ... --body-file -`).
  **PR de fase** (`fase/...`) com a fase ainda em andamento nasce **em rascunho** (`--draft`).

## 4. Título

- Fase: `Fase <ID> — <nome da fase no plano>` (ex.: "Fase A3 — correções de regra"), com o
  nome exato do título da seção no `docs/plano-implementacao.md`.
- Outra branch: uma frase que diga o conteúdo (ex.: "Análise do repositório: ...").

## 5. Descrição

Em português, curta, para quem não acompanhou a conversa:

1. **Um parágrafo:** o objetivo, com a seção do plano (ou o motivo da branch), e se muda regra
   de negócio.
2. **O que entra**, agrupado por assunto, não por commit (`git log --oneline origin/main..HEAD`
   como fonte). Cite os IDs (B-xx, RN-xx, achados) e onde ficou o registro de cada decisão
   (changelog, esquema §7, plano).
3. **PR de fase:** a lista de entregas da fase no plano, marcada `- [x]` / `- [ ]` com o que
   está feito.
4. **Verificação:** quantos testes passam (o número da última suíte), lint e typecheck, e a
   prova de quebra, se houve.
5. Última linha: `🤖 Generated with [Claude Code](https://claude.com/claude-code)`.

## 6. Acompanhar o CI

Rode em background: `gh pr checks <n> --watch --interval 30`. Ao terminar:

- Verde: diga o tempo, confira `gh pr view <n> --json mergeable` e avise Matthew que pode fazer
  o merge (ou tirar do rascunho, passo 7).
- Vermelho: `gh run view <id> --log-failed`, resuma a causa em poucas linhas e proponha o
  conserto. Nada de mudar código sem o ok, e nunca afrouxar um check (`CONSTRAINTS.md` §6).

## 7. Tirar do rascunho (só PR de fase)

Quando Matthew disser que a fase acabou:

1. Confira o "pronto quando" do `docs/plano-implementacao.md` §1.1, item por item, e mostre
   o resultado. O último item ("Matthew consegue explicar o que a fase mudou e por quê") é dele:
   ofereça umas perguntas rápidas sobre a fase.
2. Com tudo marcado e o ok dele: `gh pr ready <n>`.
