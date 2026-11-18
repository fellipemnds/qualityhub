---
id: QH-4
titulo: Toda rota ganha um operationId
estado: a fazer
silo: Back-End
gate: 0C
responsavel: ia
rotulos: [feature]
ordem: 2
depende: [QH-2]
criado: 2026-11-12
atualizado: 2026-11-12
---

## Por quê

Sem o `operationId`, o Orval inventa o nome das funções a partir do caminho. O Redocly avisa nas 82 operações.

## Aceite

- [ ] 1. Um script do `package.json` passa o OpenAPI pelo Redocly, e ele não avisa de `operationId` em nenhuma operação
- [ ] 2. Uma trava no `app.test.ts` falha se uma rota nova vier sem `operationId`

## Fora

- Gerar o cliente: é o [[QH-6]]

## Onde

- As rotas em `src/`, `app.test.ts`

## Notas

- 2026-11-12 · Veio do `docs/plano-implementacao.md` (o SG-15 do Sunglass).
- 2026-11-12 · O aviso do Redocly veio da revisão do portão de 2026-10-09. Hoje não há script: o `@redocly/cli` rodou uma vez, à mão (`changelog-arquitetura.md`, A5), e o OpenAPI sai do `app.swagger()`, só em desenvolvimento.
