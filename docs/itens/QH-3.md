---
id: QH-3
titulo: Sai o código morto da auditoria do Ponytail
estado: a fazer
silo: Back-End
gate: 0C
responsavel: ia
rotulos: [feature]
ordem: 1
depende: [QH-2]
criado: 2026-11-12
atualizado: 2026-11-12
---

## Por quê

A auditoria de 2026-10-13 achou código sem uso. Sai antes de tudo na C0, num `refactor:`.

## Aceite

- [ ] 1. O `compartilhado/acoes/acoes.ts` não existe mais
- [ ] 2. Nenhum tipo `*Input` sem import sobra nos `*.schema.ts`
- [ ] 3. A suíte e o lint ficam verdes

## Fora

- Outros achados da auditoria

## Onde

- `src/compartilhado/acoes/`, os `*.schema.ts`

## Notas

- 2026-11-12 · Veio do `docs/plano-implementacao.md` (o SG-15 do Sunglass).
- 2026-11-12 · O `acoes.ts` é um catálogo antigo, sem uso.
