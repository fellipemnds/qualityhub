# DESIGN.md — o sistema de design do Andon

> O contrato escrito do design, para os agentes lerem **antes de montar uma tela** na fase C.
> Até o fim da B3 a verdade esteve no Figma
> ([arquivo Andon](https://www.figma.com/design/I84yUUH486vPHJ65Xtg08K), páginas Fundações, Átomos,
> Moléculas, Organismos e Mockups). A partir da C0, o CSS nasce deste arquivo, e uma mudança de
> token mexe nos três (Figma, este arquivo e o CSS) **no mesmo commit** (`docs/ui-ux.md` §2.2,
> regra 1). O porquê de cada decisão está no `docs/ui-ux.md`, no `docs/marca.md` e no checklist
> `docs/identidade/revisao-wireframes.md` §0; aqui fica só o que se usa.

## 1. As regras que valem em toda tela

1. **Grafite, sem cor de destaque.** A interface é neutra; a cor diz **estado** (o ícone do
   estado, ≥ 3:1) e nunca vem sozinha: o rótulo ao lado vai em `texto/principal` (`docs/marca.md`).
2. **A luz é um lugar, nunca um componente.** Ela aparece em dois lugares: a **porta de entrada**
   (o Prism atrás do login, na tela inteira) e a **capa da NC** (a barra de vidro, com a luz parada
   no canto superior esquerdo). Botões, campos e o resto ficam no Grafite.
3. **Contraste:** texto ≥ 4,5:1 e ícone ou borda de controle ≥ 3:1, nos dois modos. **Sobre o
   vidro, texto só em `texto/principal`**, sem opacidade (o `texto/apoio` fica em 3,5:1 no pior
   ponto da luz). O controle desabilitado fica no cinza dele (fora da regra do WCAG).
4. **Uma fonte só:** a Figtree, servida pelo nosso servidor.
5. **Movimento** de 150 a 250 ms, sempre com uma função, e desligado com o "reduzir movimento"
   (o Prism fica parado; o esqueleto não pulsa).
6. **Os estados de cada tela** (o G4, `docs/fluxo-app.md` §8): Vazio, Carregando (o esqueleto
   cinza, pulsando), Erro (com o Tentar de novo), Sem permissão e Não encontrado, pelo organismo
   **Estado da tela**. Erro em tela inteira só quando não há tela para mostrar.
7. **Variante é enum.** As variantes do Figma usam os valores dos enums do backend
   (`src/compartilhado/entidades/`), e o componente do Figma tem o nome do componente React.
8. **Nada solto:** toda cor e medida vem de um token. No Figma, o
   `docs/identidade/figma/valor-solto.js` confere; a Mockups terminou a B3 com zero.

## 2. Os tokens

Duas camadas (`docs/ui-ux.md` §2.2): os **primitivos** guardam os valores e não aparecem nos
seletores; os **semânticos** dizem a função e apontam para um primitivo em cada modo. Tela e
componente usam só os semânticos.

### 2.1 Primitivos

| Token | Valor | | Token | Valor |
|---|---|---|---|---|
| `grafite/0` | `#FFFFFF` | | `azul/600` | `#2E6FE0` |
| `grafite/25` | `#FBFBFC` | | `azul/400` | `#6AA6FF` |
| `grafite/50` | `#F7F7F8` | | `violeta/600` | `#7C4FE0` |
| `grafite/100` | `#ECECEF` | | `violeta/400` | `#AE92FF` |
| `grafite/150` | `#E6E6EA` | | `verde/700` | `#16883F` |
| `grafite/400` | `#A1A1AA` | | `verde/400` | `#4CD486` |
| `grafite/500` | `#8A8A8F` | | `ambar/800` | `#975700` |
| `grafite/600` | `#68686D` | | `ambar/400` | `#F5B83D` |
| `grafite/800` | `#25252A` | | `vermelho/600` | `#D12E2E` |
| `grafite/900` | `#121214` | | `vermelho/400` | `#FF7B73` |
| `grafite/925` | `#0E0E11` | | | |
| `grafite/950` | `#09090B` | | | |

Com transparência (o vidro da capa da NC): `vidro/branco-50` `#FFFFFF` a 50%,
`vidro/grafite-45` `#161618` a 45%, `sombra/grafite-5` `#121214` a 5%, `sombra/preto-25`
`#000000` a 25%, `brilho/branco-30` `#FFFFFF` a 30%, `brilho/branco-3` `#FFFFFF` a 3%.

A luz (só para a aproximação do Prism no Figma, o componente **Luz do Prism**; no código, a luz
é o shader): `luz/vermelho` `#FF5E7E`, `luz/ambar` `#FFB547`, `luz/verde` `#7CF29A`,
`luz/ciano` `#4FD8F0`, `luz/azul` `#5B7CFF`, `luz/magenta` `#C86BFF`.

### 2.2 Semânticos de cor

| Token | Claro | Escuro | Uso |
|---|---|---|---|
| `fundo/pagina` | `grafite/50` | `grafite/950` | O fundo da página |
| `fundo/card` | `grafite/0` | `grafite/900` | Cartões, painéis, campos; a barra do topo do celular |
| `fundo/lateral` | `grafite/25` | `grafite/925` | O menu lateral |
| `fundo/selecao` | `grafite/100` | `grafite/800` | Item ativo, linha selecionada; o esqueleto |
| `texto/principal` | `grafite/900` | `grafite/100` | O texto principal; todo texto sobre o vidro |
| `texto/apoio` | `grafite/600` | `grafite/400` | Rótulos, datas, texto secundário |
| `borda/padrao` | `grafite/150` | `grafite/800` | Bordas de cartão e divisórias |
| `borda/controle` | `grafite/500` | `grafite/600` | A borda de campo (≥ 3:1) |
| `acao/primaria` | `grafite/900` | `grafite/100` | O botão principal, o link, a seleção |
| `acao/primaria-texto` | `grafite/0` | `grafite/950` | O texto sobre o botão principal |
| `foco/anel` | `grafite/900` | `grafite/100` | O anel de foco do teclado |
| `acao/destrutiva` | `vermelho/600` | `vermelho/400` | Excluir, cancelar, reprovar (só o que não se desfaz) |
| `estado/rascunho` | `grafite/600` | `grafite/400` | O ícone de Rascunho |
| `estado/aberta` | `azul/600` | `azul/400` | O ícone de Aberto |
| `estado/em-aprovacao` | `violeta/600` | `violeta/400` | O ícone de Em aprovação |
| `estado/fechada` | `verde/700` | `verde/400` | O ícone de Fechado |
| `estado/vence-em-breve` | `ambar/800` | `ambar/400` | O prazo em até 7 dias |
| `estado/vencida` | `vermelho/600` | `vermelho/400` | O prazo vencido |
| `marca/toque` | `grafite/900` | `grafite/100` | Reservado: a cor de uma empresa cliente, se o Andon virar SaaS |
| `vidro/tinta` | `vidro/branco-50` | `vidro/grafite-45` | O fundo da barra de vidro |
| `vidro/sombra-interna` | `sombra/grafite-5` | `sombra/preto-25` | A sombra interna de cima do vidro |
| `vidro/brilho-interno` | `brilho/branco-30` | `brilho/branco-3` | O brilho interno de baixo do vidro |

O contraste de cada par está no `docs/ui-ux.md` §3.1.

### 2.3 Medidas

| Token | Valor | Uso |
|---|---|---|
| `espaco/1` a `espaco/10` | 4, 8, 12, 16, 20, 24, 32, 40 | O espaço (múltiplos de 4; `espaco/7` e `espaco/9` não existem) |
| `raio/chip` | 4 | Chip, barra do esqueleto |
| `raio/controle` | 6 | Botão, campo |
| `raio/card` | 8 | Cartão, painel |
| `raio/pilula` | 999 | Pílula, avatar |
| `raio/folha` | 20 | Os cantos de cima da folha que sobe no celular |
| `raio/vidro` | 20 | A barra de vidro da capa da NC |
| `altura/controle` | 36 | Botão |
| `altura/campo` | 40 | Campo |
| `altura/toque` | 44 | O alvo de toque mínimo no celular |
| `layout/folga-da-doca` | 128 | O espaço embaixo da tela do computador para a doca flutuante |
| `layout/recuo-da-gaveta` | 46 | O recuo dos itens de uma gaveta da T-03 |

### 2.4 Texto (Figtree)

| Estilo | Peso | Tamanho / linha | Uso |
|---|---|---|---|
| `Título/Página` | SemiBold | 24 / 32 | O título da tela |
| `Título/Seção` | SemiBold | 16 / 24 | O título de um cartão ou seção |
| `Corpo/Padrão` | Regular | 14 / 20 | O texto da interface |
| `Corpo/Médio` | Medium | 14 / 20 | Botão, item ativo |
| `Corpo/Longo` | Regular | 16 / 24 | Texto corrido (a descrição, o comentário) |
| `Apoio/Padrão` | Regular | 13 / 18 | Texto secundário |
| `Rótulo/Pequeno` | Regular | 12 / 16 | Rótulo, legenda |
| `Número/Indicador` | SemiBold | 32 / 40 | O número protagonista (os relatórios) |
| `Marca/Logotipo` | SemiBold | 24 / 32, letra −2% | O logotipo provisório |

### 2.5 Efeitos

**`Vidro/Capa da NC`**: no Figma, o efeito **Glass** (refração 0,5, profundidade 20, luz 0,4 a
−45°, dispersão 0,4, desfoque 4) e duas sombras internas (em cima, `0 1px 4px`
`vidro/sombra-interna`; embaixo, `0 −1px 3px` `vidro/brilho-interno`), com o fundo em
`vidro/tinta` e os cantos em `raio/vidro`. **No código**, a refração é desenhada por nós sobre o
Prism (a luz passa por uma lente: aumenta 5% no meio e se curva nas bordas), porque o Liquid Glass
do navegador só funciona no Chrome (`docs/ui-ux.md` §7.3); as sombras viram `box-shadow: inset`.

### 2.6 A ponte com o código (na C0)

Os primitivos vão para o tema do Tailwind; os semânticos, para as variáveis do shadcn/ui, em
`:root` (claro) e `.dark` (escuro), cada uma apontando para um primitivo. A correspondência
proposta, **a conferir na documentação do shadcn na C0**:

| shadcn | Andon |
|---|---|
| `--background` | `fundo/pagina` |
| `--card`, `--popover`, `--input` (fundo) | `fundo/card` |
| `--sidebar` | `fundo/lateral` |
| `--accent`, `--muted` | `fundo/selecao` |
| `--foreground`, `--card-foreground` | `texto/principal` |
| `--muted-foreground` | `texto/apoio` |
| `--border` | `borda/padrao` |
| `--input` (borda) | `borda/controle` |
| `--primary` / `--primary-foreground` | `acao/primaria` / `acao/primaria-texto` |
| `--ring` | `foco/anel` |
| `--destructive` | `acao/destrutiva` |
| `--radius` | `raio/card` |

Os `estado/*`, o `marca/toque` e os `vidro/*` não têm par no shadcn: viram variáveis próprias.

## 3. Os componentes: Figma → React

A pasta do front se decide na C0; os caminhos abaixo são relativos à raiz do código do front,
com os componentes do shadcn/ui em `components/ui/` e os nossos em `components/`
(`docs/ui-ux.md` §5). O Code Connect fica a provar na C0; enquanto isso, esta tabela é a ponte.

### 3.1 Átomos

| Figma | Variantes | React |
|---|---|---|
| `Botão` | Tipo: Primário, Secundário, Mais, Destrutivo · Estado: Padrão, Hover, Foco, Desabilitado, Bloqueado | `components/ui/button.tsx` (Primário = `default`, Secundário = `outline`, Destrutivo = `destructive`; o Mais abre um `DropdownMenu`); o Bloqueado é o `components/BotaoBloqueado.tsx` |
| `Campo/Texto` | Estado: Padrão, Foco, Erro, Desabilitado · Preenchido · Ajuda | `components/ui/input.tsx` com `label` e `form` |
| `Campo/Senha` | as mesmas | `components/CampoSenha.tsx` (o `input` com o olho) |
| `Campo/Área` | as mesmas | `components/ui/textarea.tsx` |
| `Campo/Seleção` | Estado · Preenchido | `components/ui/select.tsx` |
| `Item/Estado` | Rascunho, Aberta, Em aprovação, Fechada, Cancelada (o `EstadoRegistro`); Ativo, Inativo, Desativado, Convite enviado (a situação de pessoas e setores) | `components/EstadoBadge.tsx` |
| `Item/Etapa` | — | `components/EtapaNC.tsx` |
| `Item/Prazo` | Vencido, Vence em breve, Em dia | `components/Prazo.tsx` |
| `Avatar` | Forma: Pessoa, Setor · Tamanho: 24, 32, 40 | `components/ui/avatar.tsx`, gerado pelo nome (`docs/marca.md`) |
| `Contador` | Tom: Forte, Suave | `components/ui/badge.tsx` |
| `Tag` | — | `components/ui/badge.tsx` (`variant="outline"`) |
| `Indicador` | — | `components/Indicador.tsx` |
| `Interruptor` | Ligado · Estado | `components/ui/switch.tsx` |
| `Caixa de seleção` | Marcada · Estado | `components/ui/checkbox.tsx` |
| `Pílula` | Ativa · Estado · contagem | `components/ui/toggle-group.tsx` |
| `Aba` | Ativa · contagem | `components/ui/tabs.tsx` |
| `Controle segmentado` | Opção ativa | `components/ui/toggle-group.tsx` |
| `Tecla` | — | `components/ui/kbd.tsx` |
| `Ícone/*` (53) | — | o ícone de mesmo desenho do `lucide-react` |

### 3.2 Moléculas

| Figma | Variantes | React |
|---|---|---|
| `Aviso` | Tipo: Erro, Informação, Sucesso | `components/ui/alert.tsx` |
| `Item/Linha de pendência` | — | `components/ItemPendencia.tsx` |
| `Anexos/Área de arrastar` | — | `components/AreaDeArrastar.tsx` |
| `Assinatura da empresa` | — | `components/AssinaturaEmpresa.tsx` |

### 3.3 Organismos

| Figma | Variantes | React |
|---|---|---|
| `Shell/Doca` | Ativo: Pendências, NCs, Relatórios, Usuários, Setores | `components/shell/Doca.tsx` |
| `Shell/Barra inferior` | Ativo: Pendências, NCs, Eu | `components/shell/BarraInferior.tsx` |
| `Shell/Barra superior · raiz` / `· item` | — | `components/shell/BarraSuperior.tsx` (as duas são variantes) |
| `Shell/Menu da pessoa` | — | `components/shell/MenuDaPessoa.tsx` (`DropdownMenu`) |
| `Shell/Abas do item` | Ativa: Resumo, Detalhes, Itens, Feed | `components/AbasDoItem.tsx` (`tabs`) |
| `Feed/Dia`, `Feed/Evento`, `Feed/Comentário` | Evento: Enviou, Aprovou, Publicou, Mudou | `components/Feed.tsx` |
| `Estado da tela` | Vazio, Carregando, Erro, Sem permissão, Não encontrado, Erro inesperado | `components/EstadoVazio.tsx`, `components/Esqueleto.tsx` (o `skeleton`), `components/ErroComRetry.tsx`, `components/SemPermissao.tsx`, `components/NaoEncontrado.tsx` |
| `Luz do Prism` | — | `components/Prism.tsx` (o Prism do React Bits, licença MIT + Commons Clause, exceção decidida por Matthew), usado no fundo do acesso e na capa da NC |
| `Bloco do título` | Tipo: NC · computador, NC · celular, Filho · computador, Filho · celular · Envolvido 2, 3 e 4 · Indicadores · Indicador 2 · Ação 3 · Espera · Nota | NC: `components/CapaNC.tsx` (o vidro do estilo `Vidro/Capa da NC`, a refração e a luz). Filho: `components/CabecalhoItem.tsx` (o caminho de volta, o título, o estado e os envolvidos). Os indicadores são o `Indicador`; as ações, a `BarraDeAcoes` |
| `Atalho/Atividade deste item` | — | `components/AtalhoAtividade.tsx`: abre o `PainelAtividade` filtrado pelo item |
| `Fundo do acesso` | — | **não usar**: era o Estuary da decisão (o), trocado pelo Prism na (r) |

Os componentes de domínio sem peça própria no Figma (o `DialogoMotivo`, o `ChecklistFechamento`,
os `ItensDaNC`, o `PainelAtividade` e os outros) estão no `docs/ui-ux.md` §5.1, com a base do
shadcn de cada um.

## 4. Histórico

| Data | O quê | Por quê |
|---|---|---|
| 2026-10-21 | As coleções Cor (claro e escuro) e Medida, e os estilos de texto | A B3 adiantada na nuvem: os valores da B1 viram variáveis |
| 2026-10-28 | A coleção Primitivos e os semânticos como alias; o `marca/toque` reservado | O método de duas camadas (`docs/ui-ux.md` §2.2); 18 cinzas parecidos viraram 12 degraus |
| 2026-10-28 | `raio/folha`, `layout/folga-da-doca`, `layout/recuo-da-gaveta`, o `Número/Indicador` em 32 px | As telas da B3 pediram (a folha do celular, a doca, as gavetas da T-03, a T-08) |
| 2026-10-28 | `fundo/destaque` e `texto/sobre-destaque` | O bloco escuro do título da NC |
| 2026-10-29 | **Saíram** `fundo/destaque` e `texto/sobre-destaque` | A barra preta saiu (decisão (s)): pesada demais para a Calma; ninguém mais os usava |
| 2026-10-29 | `vidro/*`, `sombra/*`, `brilho/*`, `luz/*`, `raio/vidro`, o estilo `Vidro/Capa da NC` e o componente `Luz do Prism` | A capa da NC numa barra de vidro líquido, com a luz do Prism (decisões (r) e (s)) |
| 2026-10-29 | O `Fundo do acesso` marcado "não usar" | O Prism do React Bits entrou no lugar do Estuary (decisão (r)) |
| 2026-10-29 | O esqueleto em ASCII, testado e desfeito; os estilos `Esqueleto/ASCII` saíram | Matthew viu no Figma e animado, e preferiu o cinza (decisão (t)) |
| 2026-10-29 | Este arquivo | O fim da B3: o contrato que a fase C lê |
| 2026-10-29 | Os organismos `Bloco do título` e `Atalho/Atividade deste item`; as 65 cópias do bloco e as 43 do atalho na Mockups viraram instâncias | Eram 118 cópias soltas: uma mudança no bloco precisava ser refeita à mão em cada tela, e a fase C não sabia que a peça existia. As 10 das telas de Carregando ficam como estão (são o esqueleto) |
