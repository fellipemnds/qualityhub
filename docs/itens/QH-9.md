---
id: QH-9
titulo: O login e o definir senha (T-01 e T-02)
estado: a fazer
silo: Front-End
gate: 0C
responsavel: ia
rotulos: [feature]
ordem: 7
depende: [QH-6, QH-8]
criado: 2026-11-12
atualizado: 2026-11-12
---

## Por quê

As primeiras telas de verdade: a prova do caminho do token à tela.

## Aceite

- [ ] 1. Com usuário e senha certos, o login leva à rota `/`
- [ ] 2. Com a senha errada, a T-01 mostra o erro sem limpar o usuário
- [ ] 3. O link do convite abre a T-02, e a senha nova entra
- [ ] 4. As duas telas funcionam só com o teclado

## Fora

- O fundo Prism do login: fica na C0 do plano, ainda sem item
- A tela inicial por papel: fica na C0 do plano, ainda sem item

## Onde

- O front, as rotas da A4

## Notas

- 2026-11-12 · Veio do `docs/plano-implementacao.md` (o SG-15 do Sunglass).
