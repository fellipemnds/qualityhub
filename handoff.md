# Handoff — estado da sessão

> Lido no **início de toda sessão** (regra no `CLAUDE.md`) e atualizado
> no **fim de toda sessão** ou quando Matthew disser "vou trocar de
> computador". Aqui fica só o que muda de sessão para sessão; o que é
> estável mora nos documentos apontados.

**Última atualização:** 2026-09-30.

## 1. Objetivo

Fechar a fase **A2 — rede de proteção** (`docs/plano-implementacao.md`,
seção A2) e começar a **A3 — correções de regra** (B1–B18, RN-47, RN-48).

## 2. Estado atual

- **Todos os itens da A2 feitos.** Branch **`fase/a2-rede-protecao`**,
  PR **#3 ainda em rascunho**
  (https://github.com/fellipemnds/qualityhub/pull/3). Falta o CI verde
  e o merge.
- Suíte: **129 passando + 3 falhas esperadas** (`it.fails`: B15 e os
  dois do B18), 28 arquivos, **~108 s**. Lint e typecheck limpos.
- Feito nesta sessão:
  - **Concorrência** (Matthew escreveu): `src/compartilhado/sequencia/sequencia.test.ts`.
    Achou o **B15**.
  - **Atribuições**: `src/compartilhado/atribuicao/atribuicao.routes.test.ts`.
    Achou o **B16** e o **B17**; Matthew decidiu a **RN-47** e a **RN-48**
    (PRD Q15, Q16).
  - **`.http` aposentados**: os casos que só eles cobriam viraram teste
    (ciclo de vida pela Contenção, reabrir pela NC, listagens nos seis
    tipos, `POST /usuarios`, definir senha). Achou o **B18**. A pasta
    `testes/old/` não existe mais.
  - Changelog com a seção da A2; plano com a A2 no histórico.
- O que Matthew aprendeu hoje: condição de corrida; `FOR UPDATE` ×
  `UPDATE` atômico (o `increment` do Prisma); `Promise.all` para
  disparar requisições ao mesmo tempo (o `await` fica fora do `map`);
  `sort()` em array de objetos não ordena; `it.fails` (e que ele passa
  com qualquer falha); `@unique` protege o dado, mas o usuário vê 500;
  laço contado (`for (let i…)`) × `for...of`; spread (`...`) e atalho
  de propriedade (`{ ultimoNumero }`).

## 3. Arquivos no meio de uma mudança

Nenhum.

## 4. O que foi alterado nesta sessão

`git log e3f778b..fase/a2-rede-protecao`. Decisões registradas no
`docs/changelog-arquitetura.md` (seção "Fase A2"); bugs em
`docs/esquema-backend.md` §7; regras no `docs/prd.md` §7 e §9.

**Push pendente:** tudo depois de `e3f778b`.

## 5. Falhas (e o porquê)

| O que falhou | Por quê | Situação |
|---|---|---|
| `npm audit`: 4 vulnerabilidades altas | Herdadas do Prisma 7 | **Aberto**, risco baixo — `docs/trd.md` §13. Nunca `npm audit fix --force` |
| Aviso "Update available 7.10.0 → 8.0.0-rc" do Prisma | É release candidate e versão major | **Não atualizar** |
| Aviso no CI: `ubuntu-latest` vira Ubuntu 26 em 19/10/2026 | Migração do GitHub | Nada a fazer; se o CI quebrar depois dessa data, começar por aqui |
| `npx biome` rodou um pacote errado pelo Node do Windows | O shell do Claude não carrega o nvm | Claude: `source ~/.nvm/nvm.sh` antes de npm/npx, e `npx --no-install` |
| Prova de quebra do B15 passou verde da primeira vez | Tirar só o `FOR UPDATE` não quebra nada: o `UPDATE ... increment` é atômico | Entendido — changelog, seção A2 |

**Pendências anotadas:**
- Na D1: excluir `**/*.test.ts` e `src/testes/` do build.
- **Suíte em ~108 s.** Medir antes de otimizar; um banco por worker é a
  opção de maior ganho. **Não** montar cenário direto no banco.
- **Rever o `podeExecutar`**: aceita colaborador **ou** aprovador
  designado; o PRD §8 pede colaborador para publicar, submeter e
  excluir. Decidir com a analista se vira bug antes de mexer (detalhe no
  changelog, seção A2).
- Quando o `/retirar` (RN-48) existir, as tabelas de máquina de estados
  e de permissões ganham a ação nova.

## 6. Próximo passo

1. `git push`, conferir o **CI verde** no PR #3 (`gh pr checks 3`),
   tirar do rascunho (`gh pr ready 3`) e fazer o merge.
2. Criar a branch da A3 a partir da `main` atualizada.
3. **A3, ordem 1: B9 — Matthew escreve** (primeiro TDD: o teste que
   falha antes do conserto). Antes, Claude explica TDD e por que o
   `new Date()` no schema é calculado uma vez só.
