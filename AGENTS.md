# QualityHub — regras para agentes que não são o Claude Code

Lido pelo Antigravity (Gemini), o plano B de quando o limite semanal do
Claude acaba. As regras do projeto moram no `CLAUDE.md`, incluído abaixo;
aqui fica só o que muda para um agente que não é o Claude Code.

## O que muda

- **Responder sempre em português do Brasil.**
- **Início da sessão:** ler o `handoff.md` (seções 1, 2 e 6) e conferir a
  branch (`git status -sb`). Antes de código, o `CONSTRAINTS.md`.
- **As skills (`/retomar`, `/item`, `/verificar`...)** são do Claude Code e
  ficam em `.claude/skills/<nome>/SKILL.md`. Aqui não rodam sozinhas: leia o
  arquivo e siga os passos à mão. As ferramentas que elas citam e que não
  existem aqui (plano de tarefas, Figma, outras sessões) ficam de fora.
- **Uso de baixo risco:** documentos, estudo, revisão, explicar código, e os
  itens 🧑 em que Matthew escreve e o agente revisa. Mudança estrutural ou
  item 🤖 grande espera o Claude voltar.
- **Commit e push só quando Matthew pedir** (a autorização de commit e push
  sem pedir, no `CLAUDE.md`, é do Claude). Antes do commit, `npm run lint` e
  `npm run typecheck` com o código de saída conferido; push só na branch de
  trabalho, nunca na `main`.
- **Nada de `--force`**, `git reset --hard`, `sudo`, nem ler ou mostrar o
  `.env` (tem segredos).
- **No fim:** uma linha na "Última atualização" do `handoff.md` dizendo que
  a sessão foi pelo Antigravity e o que mudou, para o Claude retomar dali.

## As regras do projeto

@[CLAUDE.md](CLAUDE.md)
