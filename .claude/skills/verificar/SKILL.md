---
name: verificar
description: A verificação local do projeto, num lugar só — prepara o shell, escolhe o nível pelo CONSTRAINTS.md §4 (lint e typecheck, os testes do que mudou, ou a suíte completa com cobertura) e, antes do push, o diff-cover. Use antes de pedir um commit, antes do push, quando outra skill (/item, /abrir-pr, /trocar-pc) mandar, ou quando Matthew chamar /verificar.
---

# Verificar

Quando cada check roda é decidido no `CONSTRAINTS.md` §4. Aqui fica **como** rodar sem cair
nas armadilhas do `handoff.md` §5. Check vermelho se resolve consertando o código; afrouxar,
nunca (`CONSTRAINTS.md` §6).

## 0. Preparar o shell

- `source ~/.nvm/nvm.sh` antes de qualquer npm/npx (sem ele, cai no Node do Windows).
- `npx --no-install`, nunca `npx biome`.
- `export PATH="$HOME/.local/bin:$PATH"` (o CLI do Claude Code mora lá).
- Todo check é conferido pelo **código de saída** (`&& echo OK`, ou `echo EXIT=$?`), nunca
  pela última linha da saída: o `-s` esconde o resumo, e o erro fica acima dela.

## 1. O que mudou

`git status -s` e `git diff --name-only` (e `origin/main...HEAD` antes do push). Pelo
`CONSTRAINTS.md` §4, escolha o nível:

| O que mudou | Nível |
|---|---|
| Só documentação ou só formatação | **A**: lint e typecheck |
| Parte de um item, fora do compartilhado | **B**: A + `npx --no-install vitest run <os testes do que mudou>` |
| Último commit do item, mudança no compartilhado (a lista do §4), ou antes do push | **C**: A + `npm run test:cobertura` |

Na dúvida, o nível de cima.

## 2. Rodar

- **Lint e typecheck:** `npm run -s lint` e `npm run -s typecheck`. Lint vermelho só de
  formatação no código novo: `npx --no-install biome check --write <arquivo>` e rode de novo.
  Formatação de código que já existia vai num commit **separado**.
- **Suíte** (nível B ou C), com o **Docker Desktop aberto** (`docker info`):
  - antes, lembre Matthew de fechar o Apple Music na web (o player deixa a suíte lenta);
  - em background, com a saída **inteira** num arquivo da pasta temporária da sessão, e o código
    de saída no fim (`...; echo EXIT=$?`). Filtrar a saída antes de guardar já escondeu uma
    rodada com 0% de cobertura e nenhum teste rodado;
  - enquanto ela roda, **não edite `src/`**: um arquivo de teste importado depois pegaria o
    código alterado no meio da rodada.
- **Prova de quebra** (quando o item pede: teste novo que passou de primeira, trava nova):
  **copie** o arquivo antes de quebrar e restaure pela cópia. O `git checkout` volta ao último
  commit e apaga o que ainda não foi commitado.

## 3. Ler o resultado

Do arquivo guardado: `EXIT`, `Test Files`, `Tests`, `Duration` e a cobertura (`Statements`,
`Lines`). Confira:

- `EXIT=0` e nenhum teste falhou;
- o número de testes não caiu (comparado com o do `handoff.md` §2) e não está zerado;
- a cobertura acima da trava do `vitest.config.ts`.

Vermelho: pare e mostre o trecho do erro. Nada de commit com a suíte vermelha.

## 4. Antes do push: o diff-cover

O CI exige 100% das linhas novas cobertas (`CONSTRAINTS.md` §2) e só ele rodava isso. Depois
de um nível C verde, com o relatório **desta** rodada:

```bash
git fetch -q origin
git add -N $(git ls-files --others --exclude-standard src)   # arquivo novo ainda sem commit
uvx diff-cover==10.6.0 coverage/cobertura-coverage.xml --compare-branch=origin/main --fail-under=100 --exclude src/criar-admin.ts   # X5
```

O `diff-cover` só enxerga o que o Git rastreia: um arquivo **novo** ainda sem commit fica fora do
diff e passa "100%" sem ser conferido (o `setor.service.ts` da F6a passou assim e o CI recusou,
2026-10-08). O `git add -N` avisa o Git do arquivo sem pô-lo no commit. Ou rode depois do commit.

Sem `uvx` (o Ubuntu vem sem `pip`): baixe o binário do `uv` para a pasta temporária da
sessão, com o `UV_CACHE_DIR` lá também. Linha sem cobertura: um teste que a execute, ou
exceção na §5 do `CONSTRAINTS.md` com o ok de Matthew; nunca baixar a trava.

## 5. Resumo

Uma linha por check, para ir no pedido de commit e na descrição do PR: o nível, lint,
typecheck, `<n> testes passando`, a cobertura e o diff-cover (se rodou). Se a suíte completa
rodou verde, atualize o número no `handoff.md` §2 junto do próximo commit de documentação.
