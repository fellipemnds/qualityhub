---
name: trocar-pc
description: Rotina de saída quando Matthew vai trocar de computador (trabalho ↔ casa) — verificações, foto do ambiente, handoff e commit proposto. Use quando ele disser "vou trocar de computador" ou chamar /trocar-pc.
---

# Trocar de computador (saída)

Nunca dê push nem merge: o push é de Matthew. Peça antes de cada commit.

## 0. Preparar o shell

O passo 0 da `/verificar` (sem o `~/.local/bin` no `PATH`, a foto acusa o Claude Code como
"não instalado").

## 1. Qual máquina é esta

`hostname`, comparado com a linha `hostname:` de `docs/ambiente/trabalho.txt` e `casa.txt`.
Se não bater com nenhuma, pergunte.

## 2. Estado do Git

`git status -sb`: branch, arquivos sem commit e commits sem push.
Mudança sem commit: liste e pergunte o que fazer (commitar junto, deixar, descartar).
Nunca descarte sem ordem explícita.

## 3. Verificação rápida

`/verificar` no nível A (lint e typecheck). Vermelho: pare e mostre o erro.
Não se troca de PC com check vermelho sem Matthew decidir. Commits de código ainda sem push:
o diff-cover da `/verificar` §4 antes do push.

## 4. Foto do ambiente

`npm run ambiente -- <máquina>`; resuma o `git diff docs/ambiente/<máquina>.txt`
(o que mudou nesta máquina desde a última foto).

## 5. Handoff

Atualize o `handoff.md`, com as mesmas 6 seções, apontando para os documentos em vez de repetir.
Em "Chegando no outro PC", diga o que ele vai precisar:

- migrations novas desde a última foto do outro PC
  (`git log --format=%h -1 -- docs/ambiente/<outro>.txt`, depois
  `git diff --name-only <hash>..HEAD -- prisma/migrations`);
- chaves novas no `.env.example`;
- dependências novas (`package-lock.json` mudou → o `npm run preparar` resolve).

## 6. Commit

Mostre os arquivos e a mensagem `docs: foto do ambiente de <máquina> e handoff de <AAAA-MM-DD>`,
e espere o ok. Se estiver na `main` (protegida), proponha uma branch antes.

## 7. Push

Termine com o comando exato, num bloco `bash`: `git push`, ou `git push -u origin <branch>`
se ainda não houver upstream.
