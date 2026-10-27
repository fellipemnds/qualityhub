---
name: desenhar
description: O fluxo de uma decisão de desenho, de uma tela ou de um componente — entende o que a tela faz, busca telas reais no Mobbin, junta as regras das skills de front, monta duas variantes no Figma com os componentes e as variáveis do arquivo, avalia cada uma (UX e factibilidade, com a escada do componente) e registra a decisão de Matthew. Use quando uma tela ou um componente pedir uma decisão de desenho, quando Matthew pedir variantes ou referências, disser "vamos desenhar X", ou chamar /desenhar.
---

# Desenhar (uma decisão de tela)

Roda **só quando a tela pede uma decisão**. Na revisão tela por tela, Matthew responde "ok" ou
uma frase por frame, e o fluxo entra só se a frase abrir uma dúvida de desenho. Matthew decide;
Claude conduz, recomenda e diz o porquê. O roteiro chama as skills **pelo nome**, sem copiar o
conteúdo delas. Testado em 2026-10-22, nas decisões (b), (c) e (e) da B2; fechado em 2026-10-23.

## 0. Preparar

- **Figma:** `create_session` com a chave do arquivo (`I84yUUH486vPHJ65Xtg08K`). Antes de
  qualquer `use_figma`, a skill `figma-use` (pelo `get_figma_skill`); para montar uma tela, a
  `figma-generate-design` junto. O conector **não lê comentários** do Figma.
- **Mobbin:** sem as ferramentas `mcp__mobbin__*` na sessão, o `handoff.md` §5 diz como
  reconectar.
- **A letra da decisão:** a próxima do `docs/identidade/revisao-wireframes.md` §0.

## 1. Entender a tela

Do `ui-ux.md` §7 (o wireframe em texto), do `fluxo-app.md` (§5 a jornada, §7 as ações por
estado, §8 os estados da tela) e das RN do `prd.md`. Sai em 3 a 5 linhas: o trabalho da tela,
quem usa, a ação principal e o que não pode faltar. Mostrar a Matthew antes de buscar.

## 2. Referências (Mobbin)

1. `search_screens`, e `search_flows` quando a dúvida for uma jornada: `platform` `web` para o
   computador e `ios` para o celular; `output_destination: "design_tool"`, `output_tool: "Figma"`.
   A consulta diz o tipo de tela e de produto, sem palavra de estilo.
2. 5 a 8 telas, uma linha cada, **com o link do Mobbin** (`mobbin_url`). Se vier o
   `ai_usage_notice`, mostrá-lo como veio.
3. Matthew escolhe 1 ou 2, com uma frase do porquê.
4. As escolhidas vão para a coleção "Andon · <tela>" no Mobbin (`list_collections` antes, para
   não duplicar; depois `create_collection` e `save_content`), e a frase dele, para o
   `docs/identidade/referencias-interface.md`. **Imagem de outro autor nunca entra no
   repositório**, que é público.

## 3. Regras

Uma lista curta (até 8 itens) do que as variantes têm de cumprir, tirada de:

- `design-taste-frontend` (tela de app); no celular, `apple-design` e `mobile-native`; com
  gráfico (T-08), `dataviz`; no acabamento, `emil-design-eng`.
- As nossas, que valem mais que as skills: `docs/marca.md` (o Grafite, sem cor de destaque; o
  que evitar), `ui-ux.md` §9 (acessibilidade) e §10 (textos), e o `CONSTRAINTS.md`.

## 4. Variantes no Figma

- **Duas**, lado a lado (três só quando Matthew trouxer uma proposta dele), numa seção
  "Decisão (x) · <tema> (<data>)" na página **Decisões (histórico)**.
- Montadas com os componentes e as variáveis do arquivo, sem cor nem medida solta. Faltando um
  token ou um componente, a variante diz qual: é custo, e vai para a ficha.
- Com o mesmo conjunto de dados das telas que já existem (os números batem entre as telas).

## 5. Avaliar (as duas fichas)

Ao lado de cada variante, no Figma, e resumidas no chat.

**UX:** a jornada do `fluxo-app.md` §5 se completa; a ação certa aparece no estado certo (§7);
contraste, alvo de 44 px, nada só por cor e foco pelo teclado (`ui-ux.md` §9); os estados
vazio, carregando, erro e sem permissão (`fluxo-app.md` §8). A crítica pela `impeccable` (no
modo de crítica) e pela `design-taste-frontend`.

**Factibilidade**, três perguntas:

1. **A API dá?** A rota e o campo conferidos no código (`*.routes.ts`, `*.schema.ts`,
   `prisma/schema.prisma`), com a busca inteira lida (o "existe ou não existe" do `CLAUDE.md`).
   O que não existe vira **escopo novo**, com a fase que o traria.
2. **O componente existe?** A escada, parando no primeiro degrau que resolve, conferida na
   documentação (`source-driven-development`), não de memória:
   1. o shadcn tem;
   2. dá para compor com o que o shadcn tem;
   3. um registro da comunidade do shadcn tem;
   4. um pacote de fora, pelos critérios: **peso** no que a tela baixa, **manutenção** (último
      lançamento, mantenedores, issues com resposta), **acessibilidade** (teclado e leitor de
      tela), **encaixe** (aceita os tokens e o Tailwind, sem estilo próprio; React 19) e
      **licença e segurança** (MIT ou Apache; sem alerta no `osv-scanner`);
   5. escrevemos o nosso.

   Degrau 4 ou 5 escolhido vai para o changelog quando o código entrar (TRD, princípio 2).
3. **Os tokens dão?** Token novo segue a governança (`ui-ux.md` §2.2).

Dúvida que a ficha não resolve (como algo rola, anima ou responde ao toque): um protótipo
descartável pela skill `prototype`, só para aquela pergunta, fora do repositório.

## 6. Decidir e registrar

1. Matthew decide pelo que vê.
2. A variante escolhida vai para a página **Wireframes** (na B3, **Mockups**), no lugar da
   antiga; o "Antes" fica num quadro na seção da decisão.
3. Os documentos, cada um com a linha do histórico: o `ui-ux.md` (a seção da tela), o
   `fluxo-app.md` (se mudar navegação, ação ou jornada), o plano (o item da fase) e o checklist
   (§0, com o link da seção).
4. Commit só de documentos, pedido antes (`CLAUDE.md`), e o push depois.
