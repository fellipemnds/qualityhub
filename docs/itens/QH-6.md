---
id: QH-6
titulo: O cliente da API gerado pelo Orval
estado: a fazer
silo: Front-End
gate: 0C
responsavel: ia
rotulos: [feature]
ordem: 4
depende: [QH-4, QH-5]
criado: 2026-11-12
atualizado: 2026-11-12
---

## Por quê

O front fala com a API por funções geradas do OpenAPI, sem escrever chamada à mão.

## Aceite

- [ ] 1. Um comando gera o cliente a partir do OpenAPI
- [ ] 2. Os nomes das funções vêm dos `operationId`
- [ ] 3. O `GET /api/saude` do [[QH-5]] passa a usar o cliente gerado

## Fora

- O OpenAPI em produção: só em desenvolvimento (A5)

## Onde

- O front, o `package.json`

## Notas

- 2026-11-12 · Veio do `docs/plano-implementacao.md` (o SG-15 do Sunglass).
