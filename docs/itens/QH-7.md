---
id: QH-7
titulo: As variáveis do CSS vêm do DESIGN.md
estado: a fazer
silo: Front-End
gate: 0C
responsavel: ia
rotulos: [feature]
ordem: 5
depende: [QH-5]
criado: 2026-11-12
atualizado: 2026-11-12
---

## Por quê

Os tokens do Figma (B3) viram as variáveis do CSS, e o Code Connect prova o caminho (`ui-ux.md` §2.2, item 4).

## Aceite

- [ ] 1. Os semânticos de cor viram variáveis em `:root` e `.dark`, e os primitivos entram no tema do Tailwind, pela tabela do `DESIGN.md` §2.6
- [ ] 2. O Code Connect liga um componente do Figma ao arquivo React dele, ou fica registrado por que não, e a tabela do `DESIGN.md` §3 continua sendo a ponte
- [ ] 3. Nenhuma tela desenha um anel ou uma dica de foco própria: o anel vem do `--ring`, e a dica, do `Tooltip` do shadcn

## Fora

- O tema por empresa (o SaaS, depois do MVP)

## Onde

- `DESIGN.md`, o CSS do front

## Notas

- 2026-11-12 · Veio do `docs/plano-implementacao.md` (o SG-15 do Sunglass).
- 2026-11-12 · No Figma ficaram 6 anéis e 5 dicas de foco soltos na Mockups, sobra da B3.
