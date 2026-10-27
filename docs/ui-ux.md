# QualityHub — UI/UX

> **O que é este documento:** como o QualityHub **parece** e **se comporta
> ao toque** — fundações visuais, componentes, layout das telas, padrões
> de interação, acessibilidade e textos. *Quais* telas existem e o que
> fazem está em `docs/fluxo-app.md`; as regras de negócio, em
> `docs/prd.md`.
>
> **Status:** v1 (2026-09-24). Decisões na §1 e na §12. Valores de cor
> e fonte são provisórios até a identidade visual ser definida (fase B1:
> a plataforma **Andon**, com identidade própria, decidida em 2026-10-13;
> o nome, em 2026-10-15, no `docs/marca.md`).

---

## 1. Decisões

Com Matthew, em 2026-09-24:

| Decisão | Escolha | Observação |
|---|---|---|
| Biblioteca de componentes | **shadcn/ui** (Radix + Tailwind) | **Diverge do `arquitetura.md`** (ADR-28 recomendava Mantine). Os componentes são copiados para dentro do projeto e viram código nosso |
| Identidade visual | **Própria da plataforma Andon** (nome **provisório** desde 2026-10-20, `docs/marca.md`), com a **assinatura** da empresa (revisto em 2026-10-13; antes, "decidir depois"; o nome Andon é de 2026-10-15 e substitui "Dusk & Dawn" no texto ao lado, onde as **faces Dawn e Dusk estão suspensas** desde 2026-10-14, `docs/marca.md`) | A identidade oficial da empresa não combina com o app, e Matthew tem liberdade para decidir. **Andon** é o nome da **plataforma**, que vai ganhar módulos além das NCs (o roteiro no `README.md`); cada módulo mantém um nome que diz o que faz ("Andon · Qualidade"). O código continua `qualityhub`: o nome só aparece na tela. A plataforma tem **uma cara só**, com um login: as faces Dawn (colaborador) e Dusk (gestão) da direção de 2026-10-13 estão **suspensas** (`docs/marca.md`, "Suspenso"). O que muda por pessoa é o menu e a tela inicial, pelos papéis (`fluxo-app.md` §2.1 e §3). A autoria de Matthew fica numa tela **"Sobre"** ("Criado por Matthew", com o aviso de copyright), não na marca. A empresa aparece só como assinatura, com o logo dela **monocromático** (cinza ou a cor do texto, nunca as cores originais): no login, no menu da pessoa (que abre da doca do computador e na tela Eu do celular), no rodapé do e-mail de convite e no cabeçalho dos relatórios exportados. O ícone da aba, o topo das telas e os botões são do Andon. Os tokens continuam por **função** (`--perigo`, `--primary`...); a B1 definiu os valores (`docs/marca.md`: o **Grafite**, sem cor de destaque; as faces não entram no tema), e o `DESIGN.md` da B3 registra tudo |
| Processo de design | **Documento → Figma → protótipo HTML** | Wireframes e mockups no Figma; protótipo HTML clicável quando o design fechar, para o teste do gate G3 |
| Tema | **Claro e escuro** (revisto em 2026-10-13; antes, "só claro no MVP"; as duas faces saíram com o Dusk & Dawn) | Decidido na entrevista da B1 (`docs/marca.md`). As cores já são tokens, então o escuro não refaz telas; o custo fica na B3, com o contraste conferido nos dois modos |

### 1.1 O que a escolha do shadcn/ui traz junto

O shadcn/ui cobre a base (botão, campo, diálogo, menu, tabela simples,
calendário, popover...). O QualityHub precisa de algumas peças que ele
**não** traz prontas:

| Necessidade | Complemento | Por quê |
|---|---|---|
| Estilo | **Tailwind CSS** | Obrigatório no shadcn/ui |
| Formulários | **React Hook Form + Zod** | É o que o componente `Form` do shadcn/ui já usa; reaproveita a lógica dos schemas do backend |
| Tabelas com ordenação e filtro | **TanStack Table** | É o que o `Data Table` do shadcn/ui usa |
| Datas | **react-day-picker** + **date-fns** | É o que o `Calendar` do shadcn/ui usa; date-fns formata em pt-BR |
| Avisos rápidos ("Salvo") | **Sonner** | É o toast oficial do shadcn/ui |
| Editor de comentário com `@` e `#` | **Tiptap** + extensão *Mention* | Menções com sugestão são difíceis de fazer bem à mão |
| Anexos (arrastar e soltar) | **react-dropzone** | Valida tipo e tamanho antes de enviar |
| Ícones | **Lucide** | Padrão do shadcn/ui |

Versões e configuração ficam para o TRD. **Regra:** não adicionar
biblioteca além destas sem registrar o motivo no changelog, porque cada
dependência é mais uma coisa que pode quebrar (princípio do PRD §2).
Quando o shadcn/ui não tem o componente, a escada da §2.2 (regra 3 da
governança) decide entre compor, buscar um pacote ou escrever o nosso.

---

## 2. Processo de design e gates

Os gates vêm do `arquitetura.md` §11. Cada um tem um critério de saída e
um lugar onde acontece:

| Gate | Onde | Critério de saída |
|---|---|---|
| **G0 — Jornadas** | `fluxo-app.md` §5 | ✅ **Feito.** Todo RF aparece em alguma jornada |
| **G1 — Wireframes** | Este documento (§7) → **Figma** | Toda tela do mapa (`fluxo-app.md` §2) tem wireframe; toda ação da §7 do fluxo é alcançável |
| **G2 — Fundações visuais** | Este documento (§3–§5) → **Figma** (Variables + componentes) | O badge cobre os 5 estados; contraste ≥ 4,5:1; nada comunicado só por cor |
| **G3 — Protótipo navegável** | **Protótipo HTML** | 3 colegas completam sem ajuda: registrar NC com rascunho, aprovar item, comentar com menção |
| **G4 — Handoff** | Figma, por tela | Cada tela tem os estados vazio, carregando, erro e sem permissão (`fluxo-app.md` §8) |
| **G5 — Revisão pós-código** | Frontend pronto | Jornadas do G3 funcionam só com teclado; foco visível; rótulos presentes |

### 2.1 Estrutura do arquivo no Figma

As páginas de componentes seguem o Atomic Design (§2.2; revisto em
2026-10-23, antes uma página só, "Componentes"):

| Página | Conteúdo |
|---|---|
| **Fundações** | Variables de cor (primitivos e semânticos, §2.2), tipografia, espaçamento e raio, com os mesmos nomes dos tokens da §3 |
| **Átomos** | As peças que não se dividem: botão, campo, estado/etapa/prazo, ícone, avatar |
| **Moléculas** | Átomos juntos com uma função (a linha de pendência, o campo com rótulo e erro) |
| **Organismos** | As partes inteiras de uma tela (a doca, a barra do celular, o feed, a seção de filhos) |
| **Wireframes** | Cinza, sem cor, um frame por tela (desktop e, quando indicado, celular) |
| **Mockups** | As mesmas telas com os componentes e as fundações aplicados, e os estados do G4 |
| **Decisões (histórico)** | Uma seção por decisão de desenho, com as variantes comparadas e o "Antes" (skill `/desenhar`) |

Em todas: as variantes têm os nomes do enum (`RASCUNHO`, `EM_APROVACAO`...),
e o componente tem o nome do componente React (§5), assim o handoff é
mecânico: o nome no Figma é a chave no código.

### 2.2 Como o Design System é construído (B3)

Decidido com Matthew em 2026-10-23, na B2, antes da B3. Os componentes
seguem o **Atomic Design** de Brad Frost como **modelo para organizar e
dar nome** (átomos, moléculas, organismos, telas), não como ordem de
construção: o próprio Frost diz que ele não é um processo em linha reta.
A ordem é puxada pelas telas, sobre uma base de tokens.

1. **Os tokens em duas camadas.** Os **primitivos** são a paleta crua,
   sem função (`cinza/900`, `vermelho/600`); os **semânticos** dizem a
   função e apontam para um primitivo em cada modo (`estado/vencida` → um
   vermelho no claro, outro no escuro). O modo escuro é trocar para onde o
   semântico aponta, e o contraste se confere nos pares de primitivos.
   **Token de componente** (`botao/primario/fundo`) só por exceção, com o
   motivo escrito: quando um componente precisar fugir do semântico. Em
   2026-10-23, a coleção Cor tem só os 18 semânticos, com o valor direto: a
   B3 começa criando os primitivos embaixo deles.
   **Reservado: `marca/toque`** (2026-10-23), o único semântico onde a
   cor de uma empresa cliente poderia entrar, se o Andon virar SaaS (a
   sessão antes da C0, no plano): só em lugar sem significado (o fundo do
   login, o anel do avatar, o ícone da aba), nunca num estado nem numa
   ação, e com o contraste conferido nos dois modos antes de valer. Começa
   no cinza.
2. **A construção: uma base comum, depois as telas puxam.** A base são os
   tokens das duas camadas e os 5 átomos que toda tela usa (botão, campo,
   estado/etapa/prazo, ícone e avatar). Depois, uma tela por vez, na ordem
   das fatias da fase C: T-01 Login (C0; testa o caminho do token à tela)
   → T-05, T-06 e T-04 (C1) → T-07 (C2) → T-03 (C3) → T-09 a T-12 (C6) →
   T-08 (C7). Cada tela monta só as moléculas e os organismos que faltam e
   reaproveita o resto. Quando ela não cabe num componente, o ajuste é
   **no componente**, nunca uma cópia solta na tela. A ordem também cobre a
   B4 a tempo: a Nova NC, a aprovação e o comentário vêm cedo.
3. **A governança**, cinco regras:
   1. **Onde está a verdade:** no Figma, durante o Bloco B. O `DESIGN.md`
      (fim da B3) é o contrato escrito que os agentes leem na fase C. A
      partir da C0, o CSS nasce do `DESIGN.md`, e uma mudança de token
      mexe nos três no mesmo commit.
   2. **Quem decide:** Matthew decide, Claude propõe. Semântico novo só
      com uma função nova (um estado novo, por exemplo), nunca por "um tom
      diferente"; primitivo novo só quando nenhum dos que existem passa o
      contraste; token de componente, com o motivo escrito.
   3. **Quando um componente entra:** quando uma tela precisa e nada do
      que existe serve. A mesma função é **variante** (variante = enum,
      §2.1), não componente novo. No código, a escada da `/desenhar`, que
      para no primeiro degrau que resolve: o shadcn tem → compor com o que
      ele tem → um registro da comunidade do shadcn → um pacote de fora
      (pesado pelo peso, manutenção, acessibilidade, encaixe nos tokens e
      licença) → escrever o nosso. Degrau 4 ou 5 vai para o changelog
      (§1.1).
   4. **Quando um componente está pronto:** toda cor e medida ligada a
      uma variável, sem valor solto (Claude confere pelo conector, com um
      script que lista o que está sem variável); os estados que fizerem
      sentido (padrão, hover, foco, desabilitado, erro); claro e escuro,
      com o contraste conferido; a descrição de uso no Figma; o nome no
      padrão (§2.1).
   5. **Registro e saída:** toda mudança numa tabela de histórico do
      `DESIGN.md` (data, o quê, por quê), sem número de versão (um
      produto e um time: o histórico e o Git bastam). O componente que sai
      não é apagado: vai para o histórico marcado "não usar" e sai de vez
      quando nenhuma tela o usar.
4. **A ponte com o código** (na C0). Os primitivos ficam no tema do
   Tailwind, e os semânticos, nas variáveis do shadcn (claro e escuro),
   cada um apontando para um primitivo; o formato exato é conferido na
   documentação na hora. Os valores vão do Figma para o `DESIGN.md` e o
   CSS pelo conector, escritos pelo Claude (uns 40 tokens, uma plataforma
   só), sem o Style Dictionary, que existe para gerar para várias
   plataformas e seria dependência sem motivo. O componente do Figma tem
   o nome do componente React, e as variantes, os valores dos enums do
   backend (`compartilhado/entidades/`). **O Code Connect fica a
   conferir na C0.** A ajuda do Figma diz que ele vale no plano
   Professional (uma biblioteca e um framework) com um assento Full ou Dev,
   e Matthew tem um assento Full no plano de estudante; mas o conector
   recusou a leitura em 2026-10-23, pedindo um plano Organization ou
   Enterprise. A prova na C0: publicar a biblioteca, ligar um componente
   pelo Dev Mode ("Connect to code") e ler pelo conector. Se não
   funcionar, fica a tabela no `DESIGN.md` (componente do Figma → arquivo
   React), que Claude lê antes de montar cada tela. O script que compara os tokens do
   `DESIGN.md` com os do CSS só entra se os dois se desencontrarem na
   prática.

---

## 3. Fundações (tokens)

### 3.1 Cores

Os nomes abaixo são os **semânticos** (a função, não a cor), que na B3
passam a apontar para os **primitivos** (§2.2). Os valores são **provisórios** (tons
da paleta padrão do Tailwind); os da marca, com o contraste conferido,
estão no `docs/marca.md` (B1) e entram aqui na B3. O contraste é conferido no G2.

**Base** (mapeiam direto nas variáveis do shadcn/ui):

| Token | Uso | Provisório |
|---|---|---|
| `--background` | Fundo da página | branco |
| `--foreground` | Texto principal | `slate-900` |
| `--muted` / `--muted-foreground` | Fundos secundários / texto de apoio | `slate-100` / `slate-600` |
| `--border` | Bordas e divisórias | `slate-200` |
| `--primary` | **Destaque**: ação principal de cada tela | o **grafite** da marca, `#121214` / `#ECECEF` (definido em 2026-10-20: sem cor de destaque, `docs/marca.md`) |
| `--destructive` | Ações destrutivas (excluir, cancelar, reprovar) | `red-600` |
| `--ring` | Contorno de foco do teclado | o grafite, como o `--primary` (2026-10-20); o link é sublinhado |

**Semânticas** (nossas, adicionadas ao tema):

| Token | Uso | Fundo / texto provisórios |
|---|---|---|
| `--sucesso` | Aprovado, eficaz, fechado | `green-50` / `green-700` |
| `--alerta` | Prazo vencendo, parcialmente eficaz | `amber-50` / `amber-800` |
| `--perigo` | Prazo vencido, não eficaz, reprovado | `red-50` / `red-700` |
| `--info` | Aberto, em andamento | `blue-50` / `blue-700` |
| `--aprovacao` | Aguardando decisão | `violet-50` / `violet-700` |
| `--neutro` | Rascunho, cancelado | `slate-100` / `slate-700` |

Por que o destaque provisório é **quase preto e não uma cor**: em uma
ferramenta de trabalho, o que deve chamar atenção é o **estado** das
coisas (vencido, reprovado, aguardando você). Um botão principal colorido
competiria com os badges.

### 3.2 Tipografia

- **Fonte:** **Figtree** (decidida na B1, 2026-10-13; `docs/marca.md`).
  Servida pelo **nosso próprio servidor**, porque o sistema roda
  *on-premise* e pode não ter acesso a serviços externos de fonte.
  Números tabulares por `font-variant-numeric: tabular-nums` (a Figtree
  tem o recurso `tnum`, mas os dígitos não são tabulares por padrão):
  obrigatório em tabelas, códigos, datas e indicadores.
- **Escala** (Tailwind): `text-xs` 12 · `text-sm` 14 (**padrão** de
  tabelas e formulários) · `text-base` 16 (texto corrido, feed) ·
  `text-lg` 18 · `text-xl` 20 (título de seção) · `text-2xl` 24 (título
  de página).
- **Números tabulares** (`tabular-nums`) em códigos, datas e colunas de
  números, para alinharem.
- **Códigos** (`NC-2026-0042`) em peso médio, nunca em fonte mono (lê
  melhor e cabe mais).

### 3.3 Espaçamento, raio e densidade

- **Espaçamento:** escala do Tailwind (múltiplos de 4 px).
- **Raio:** `--radius` = 8 px (padrão do shadcn/ui).
- **Densidade:** **compacta no computador** (linhas de tabela de ~40 px,
  campos de 36 px), **confortável no celular** (alvos de toque ≥ 44 px).
  Ferramenta de trabalho: a pessoa quer ver mais linhas, não mais ar.

### 3.4 Breakpoints

| Nome | Largura | Layout |
|---|---|---|
| Celular | < 768 px | Uma coluna; navegação inferior; tabelas viram cartões |
| Tablet | 768–1023 px | Uma coluna, menu recolhível |
| Computador | ≥ 1024 px | Doca flutuante embaixo + a tela inteira para o conteúdo (§6.1); detalhe da NC com coluna lateral |

---

## 4. Mapa de estados, etapas e valores

Princípios (do `arquitetura.md` §11, mantidos):

1. **O backend devolve o enum cru** (`"EM_APROVACAO"`), nunca cor ou
   rótulo.
2. **Um mapa tipado por enum** no frontend
   (`Record<EstadoRegistro, ConfigEstado>`): ao criar um valor novo no
   enum, o TypeScript obriga a configurar o visual dele.
3. **Nunca só cor:** todo badge tem **ícone + texto**.

As seis entidades são femininas em português (a Não Conformidade, a
Ação...), então os rótulos são sempre no feminino.

### 4.1 Estado (`EstadoRegistro`)

| Enum | Rótulo | Tom | Ícone (Lucide) |
|---|---|---|---|
| `RASCUNHO` | Rascunho | `--neutro` | `pencil` |
| `ABERTO` | Aberta | `--info` | `circle-dot` |
| `EM_APROVACAO` | Em aprovação | `--aprovacao` | `hourglass` |
| `FECHADO` | Fechada | `--sucesso` | `circle-check` |
| `CANCELADO` | Cancelada | `--neutro`, texto riscado | `circle-slash` |

### 4.2 Etapa da NC (`fluxo-app.md` §4)

A etapa aparece **ao lado** do estado, em texto simples com ícone, não
como um segundo badge colorido (dois badges coloridos lado a lado
confundem):

| Etapa | Ícone |
|---|---|
| Rascunho / Cancelada | — (o badge de estado já diz) |
| Aguardando aprovação do fechamento | `hourglass` |
| Aguardando classificação | `tag` |
| Em investigação | `search` |
| Aguardando contenção | `shield` |
| Pronta para fechamento | `flag` |
| Fechada · ação em execução | `wrench` |
| Fechada · em verificação | `scan-search` |
| Concluída | `badge-check` |

**Indicadores paralelos** são etiquetas pequenas: *Contenção em
andamento* (`--info`), *Prazo vencido* (`--perigo`), *Reaberta*
(`--alerta`).

### 4.3 Outros valores

| Enum | Valores → rótulo e tom |
|---|---|
| `ResultadoVerificacao` | `EFICAZ` → Eficaz (`--sucesso`) · `PARCIALMENTE_EFICAZ` → Parcialmente eficaz (`--alerta`) · `NAO_EFICAZ` → Não eficaz (`--perigo`) |
| `ClassificacaoNC` | `MAIOR` → Maior (`--perigo`) · `MENOR` → Menor (`--alerta`) |
| `Disposicao` | `ACEITO` → Aceito · `CORRIGIDO` → Corrigido · `ANULADO` → Anulado · `EM_ANALISE` → Em análise (todos `--neutro`: é informação, não alerta) |
| `ClassificacaoHipotese` | `CAUSA_DIRETA` → Causa direta · `FATOR_CONTRIBUINTE` → Fator contribuinte · `SEM_RELACAO` → Sem relação |
| `OrigemNC` | `AUDITORIA_INTERNA` → Auditoria interna · `AUDITORIA_EXTERNA` → Auditoria externa · `OPERACAO` → Operação · `RECLAMACAO_CLIENTE` → Reclamação de cliente |
| `Papel` | Visualizador · Editor · Aprovador · Gerente · Administrador |
| Prazo | Vencido → "Vencido há N dias" (`--perigo`) · até 7 dias → "Vence em N dias" (`--alerta`) · resto → a data, sem destaque |

---

## 5. Componentes

Base = componente do shadcn/ui por trás. Os componentes do produto ficam
em `components/` (os do shadcn/ui, em `components/ui/`).

### 5.1 Do domínio

| Componente | Base | O que faz |
|---|---|---|
| `EstadoBadge` | Badge | Estado de qualquer item (§4.1) |
| `EtapaNC` | — | Etapa + indicadores paralelos (§4.2) |
| `Prazo` | Badge | Data com o destaque de vencido/vencendo |
| `CabecalhoItem` | Breadcrumb | Caminho de volta para a NC + código + título + estado |
| `BarraDeAcoes` | Button, DropdownMenu | Ações do estado atual (`fluxo-app.md` §7). Ação principal em destaque; secundárias ao lado; destrutivas (cancelar, excluir) num menu "Mais" |
| `BotaoBloqueado` | Button + Popover | Botão desabilitado que, ao passar o mouse ou tocar, mostra **a lista do que falta** (princípio 3 do fluxo). Precisa funcionar no toque e no teclado, não só no mouse |
| `ChecklistFechamento` | — | Requisitos da RN-21 com ✅/❌ e link para resolver |
| `SecaoFilhos` | Card, Table | Uma seção por tipo de filho na página da NC |
| `PainelAtribuicoes` | Avatar, Command, Popover | Colaboradores e aprovador; busca de pessoas para adicionar |
| `DialogoMotivo` | Dialog, Textarea | Confirmação que exige motivo (reprovar, cancelar, reabrir) |
| `DialogoEfeito` | AlertDialog | Confirmação que explica um efeito automático (concluir verificação, finalizar execução) |
| `Feed` | ScrollArea | Linha do tempo com eventos e comentários |
| `EditorComentario` | Tiptap | Texto com sugestão de `@pessoa` e `#item` |
| `AreaDeArrastar` | react-dropzone | A área de arrastar anexos, só no computador: ícone, a frase da tela e o apoio com o que o sistema aceita (JPEG, PNG, WebP ou PDF, até 10 MB; TRD §8). No Figma, `Anexos/Área de arrastar`. No celular, o "+ Anexar" abre a câmera ou os arquivos (B2, 2026-10-26) |
| `CampoData` | Input, Button | O campo de data com atalhos ao lado: Hoje e Ontem quando a data é passada (executada, verificada), Em 15 dias e Em 30 dias quando é futura (o prazo); o campo abre o calendário (B2, 2026-10-26) |
| `EtapasA3` | — | A Investigação no celular: a entrada com o índice das 10 etapas (o estado de cada uma e o que falta nas que estão pela metade) e uma etapa por tela, com a barra de segmentos e o ponto na etapa atual (§7.5, decisão (i)) |
| `Anexos` | react-dropzone | Lista de arquivos + área de envio, com tipo e tamanho validados antes de enviar |
| `IndiceA3` | — | Índice lateral da Investigação, com o preenchimento de cada etapa |
| `ItemPendencia` | Card | Uma linha de "Minhas pendências" |
| `ItensDaNC` | Collapsible, ToggleGroup, DropdownMenu | Os itens filhos no Detalhe da NC: agrupados por tipo ou não, em lista ou cartões, ordenados por estado ou criação, com o medidor em segmentos (§7.3) |
| `PainelAtividade` | Sheet (sem véu, empurrando a página) | O feed inteiro da NC à direita (com os eventos dos filhos, PRD Q25), com Tudo · Comentários · Histórico; ao abrir, a coluna lateral vira a faixa de resumo (§7.3). Aberto pelo atalho de um filho, vem filtrado por ele |
| `Medidor` | — | O progresso em segmentos: um por item, os feitos preenchidos; contínuo acima de 10 (os itens, o checklist) |
| `FiltrosNC` | Select, Popover, Calendar | Filtros da lista de NCs, refletidos na URL (dá pra compartilhar um link filtrado) |

### 5.2 De estado de tela (`fluxo-app.md` §8)

| Componente | Base | Uso |
|---|---|---|
| `EstadoVazio` | — | Ícone + frase + ação que resolve |
| `Esqueleto` | Skeleton | Forma da tela enquanto carrega |
| `ErroComRetry` | Alert | Mensagem + "Tentar de novo" |
| `SemPermissao` / `NaoEncontrado` | — | Página inteira com link de volta |

---

## 6. Layout

### 6.1 Estrutura geral

**Computador** (decisão (e) da B2, 2026-10-22; Figma, página Decisões
(histórico), seção "Decisão (e)"; o componente `Shell/Doca`): uma **doca
flutuante embaixo, no centro**, e a tela inteira para o conteúdo, sem
menu lateral nem barra de topo. É a mesma ideia da barra flutuante do
celular.

```
┌──────────────────────────────────────────────────────────────┐
│ NC-2026-0042 · Vazamento na linha 3          [Enviar] [⋯]    │
│ ● Aberta  Em investigação                                    │
│                                                              │
│                     conteúdo da tela                         │
│                                                              │
│              (96 px livres no fim do conteúdo)               │
│  ╭────────────────────────────────────────────────────────╮  │
│  │ ⌕ Buscar │ Pendências ④  NCs  Relatórios │ Usuários  Setores │ ◯ ⌃ │
│  ╰────────────────────────────────────────────────────────╯  │
└──────────────────────────────────────────────────────────────┘
```

1. **A doca fica fixa no rodapé da janela**, centralizada, com ícone e
   rótulo em cada item; o item ativo com a pílula cinza; o contador das
   Pendências vira um selo (depende do `GET /pendencias`, que chega na
   C3). Os itens de administração vêm depois de uma divisória e só para
   quem tem o papel (`fluxo-app.md` §2.1).
2. **Toda tela deixa 96 px livres embaixo do conteúdo** (a altura da doca
   e a margem). Sem isso, a doca cobriria o fim das listas, o "Carregar
   mais" e o campo de comentário do feed, o risco apontado na decisão.
3. **Buscar é o primeiro item**, e o atalho **Ctrl K** abre a mesma
   busca: uma janela no centro, com os resultados em Itens, NCs e "Ir
   para". Procura pelo código e pelo texto (os filhos não têm título,
   §10.3). Depende do `GET /registros/busca`, planejado para a C4.
4. **A pessoa fica no fim da doca:** o avatar gerado pelo nome
   (`docs/marca.md`) com a seta. O **menu da pessoa abre para cima**: nome,
   setor e papel, **Tela inicial**, **Sair**, **Sair de todos os
   aparelhos** (`fluxo-app.md` §2.1) e, embaixo, a **assinatura da
   empresa**.
5. **Sem barra de topo:** o caminho de volta fica na linha do título,
   dentro da tela, e a ação da tela (Enviar, Salvar, Mais) fica no canto
   superior direito, sem nada por cima.
6. **Com outros módulos** (pendência no handoff): a doca cabe uns 8 itens
   na largura mínima do computador (1024 px). Quando passar disso, os
   módulos viram um item só, com um seletor, como no celular.

As alternativas (o trilho estreito à esquerda, colado ou flutuante, e o
trilho com uma barra fina no topo) estão na mesma seção do Figma, como
registro; o componente do trilho ficou lá, como "não escolhido".

**Celular** (U2, decidida em 2026-10-22, B2): barra superior com o
título + **barra flutuante** com três abas e o **＋** ao lado. Exceção:
a T-03 não tem a barra superior; a saudação faz o papel do título
(decisão (j), §7.1):

```
┌────────────────────────┐
│ Minhas pendências      │
├────────────────────────┤
│                        │
│    conteúdo (1 coluna) │
│                        │
│ ╭──────────────────╮ ● │
│ │ Pend.  NCs   Eu  │ ＋│
│ ╰──────────────────╯   │
└────────────────────────┘
```

1. **As abas:** Pendências · NCs · **Eu**. A barra é uma pílula
   flutuante, sem a faixa sólida no rodapé, acima da área do gesto do
   iPhone, com toque de 44 px no mínimo por aba e espaço embaixo da
   lista para o último item não ficar escondido.
2. **O ＋ ao lado da barra**, na mesma linha (variante A), em grafite
   como o botão primário (sem cor de destaque, `docs/marca.md`).
3. **A barra e o ＋ só nas três telas raiz.** Nas telas internas (o
   Detalhe da NC, os filhos, a Nova NC) eles somem e fica a seta de
   voltar no topo; assim não brigam com a barra de ações fixa da Nova NC.
4. **Na tela Eu, o ＋ sai e a barra cresce** até a largura toda (16 px
   de margem), com uma transição curta.
5. **O ＋ cria a coisa principal da tela.** Hoje é sempre Nova NC. Com
   outros módulos, cria no módulo atual; nas Pendências (que juntam
   todos), abre uma escolha rápida; e, quando a tela não deixar óbvio, o
   botão leva o rótulo ("＋ Nova NC"). A escolha rápida só se constrói
   com o segundo módulo.
6. **A tela Eu** (T-13, só no celular) substitui o avatar e o menu ☰:
   perfil (nome, e-mail, papéis), **Conta** (Tela inicial), **Gestão**
   (Relatórios para `GERENTE`; Usuários e Setores para `ADMIN`; só para
   quem tem o papel), **Sessão** (Sair, Sair de todos os aparelhos) e a
   assinatura da empresa embaixo. Relatórios e administração ganham
   versão de celular (`fluxo-app.md` §1, revisto em 2026-10-22).

**Com outros módulos** (pendência no handoff): a barra comporta até 5
abas, mas a variante A (com o ＋ ao lado) só cabe com 3. O plano: a aba
NCs vira **Módulos** (ou o módulo atual, com seletor), as Pendências
passam a juntar todos os módulos e o Eu fica. Se for preciso uma quarta
aba, o ＋ sobe para cima da barra, à direita (a variante B).

Os desenhos: Figma, página Decisões (histórico), seção "Decisão (a) ·
barra do celular (2026-10-22)" (as variantes A e B e a tela Eu). A
proposta de 2026-10-21 para o computador (sem barra de topo, o item ativo
com a pílula cinza) ficou confirmada pela decisão (e), acima, e o menu
lateral saiu.

**Os atalhos de teclado** (conjunto curto, pedido de Matthew, 2026-10-26;
só no computador). Além do Tab, Enter e Esc da acessibilidade (§9):

| Tecla | O que faz |
|---|---|
| **Ctrl K** | Abre a busca (decisão (e)) |
| **?** | Abre a janela com a lista de atalhos |
| **J** / **K** | Desce / sobe a linha selecionada numa lista (as gavetas da T-03, a T-04) |
| **Enter** | Abre a linha selecionada |
| **Esc** | Fecha a janela, a folha ou o painel aberto |
| **G** e depois **P** / **N** | Vai para as Pendências / para as NCs |

1. **Nenhum atalho age dentro de um campo de texto** (lá, as teclas
   escrevem).
2. **Os de uma tecla só (J, K, ?, G) podem ser desligados** no menu da
   pessoa ("Atalhos de teclado"), como pede a WCAG 2.1.4; a escolha fica
   no navegador. O Ctrl K e o Esc continuam.
3. **Sem ação por tecla** (aprovar, editar, comentar): cada uma pediria a
   mesma checagem de permissão do botão, e fica fora do MVP (§11).
4. A janela do **?** é desenhada no item 14 da B2, com a busca; os atalhos
   entram na C8.

### 6.2 A personalidade: os gestos da casa

Decidido com Matthew em 2026-10-23, na revisão dos wireframes: o
Detalhe da NC no celular tinha personalidade, e as outras telas ficaram
sem graça. A diferença não era enfeite, eram **gestos**, e eles passam a
valer para o app todo. A personalidade vem de repetir poucos gestos com
hierarquia, não de decorar cada tela. Os gestos 1 a 4 são estrutura (a
revisão da B2 confere cada um); o 5 é acabamento (B3).

1. **O bloco do título, com hierarquia.** Toda página de item abre com um
   bloco que dá o "rosto" do item: o código, o título (ou o rótulo, nos
   filhos, §10.3), o estado e quem está envolvido. **A NC é a casa**, a
   que agrupa tudo: só ela tem o bloco **escuro** (§7.3). Os **filhos** são
   da família: a mesma anatomia num tom **claro**, com o nome da NC em
   cima (o caminho de volta, `CabecalhoItem`), que diz a quem pertencem.
   Nenhuma outra tela usa o bloco escuro. **Nos filhos** (decisão (h),
   2026-10-26), o título do bloco é o **tipo** ("Classificação"), não o
   rótulo, que repetia o primeiro campo da página e podia contradizê-lo
   antes do Salvar; o código fica na barra de cima. E o estado vem
   **embaixo** do título: na NC ele fica em cima, porque embaixo dela vem
   a etapa, que os filhos não têm. **O estado secundário** (o selo "Plano
   aprovado", o prazo, quem salvou ou enviou) vai numa **linha de
   indicadores** no estilo da etapa da NC (ícone e texto em cinza,
   separados por "·"), nunca em pílula; só o ícone do prazo vencido tem
   cor (Matthew, 2026-10-26, na Ação Corretiva).
2. **A frase de estado.** Toda tela raiz abre com uma frase que diz o que
   importa agora ("4 itens esperam por você · 1 vencido"; "38 abertas · 3
   com prazo vencido"), em vez de só o título.
3. **O número protagonista.** O número que importa aparece grande, ou
   num medidor em segmentos (um por item, §5.1), e com o contexto ao lado ("2 de 6 atendidos", "82% (18 de 22)", "há 9
   dias"), no estilo Número/Indicador e com dígitos tabulares (§3.2).
4. **O formulário com ritmo.** Os campos em grupos com nome ("O que
   aconteceu", "Onde", "Evidência"), o opcional marcado e o valor padrão
   visível (a Nova NC já vem com "Detectada em: hoje"), em vez de uma lista
   de campos com o mesmo peso.
5. **Movimento e voz.** O bloco do título que encolhe ao rolar, a
   busca da T-04 no celular que some ao rolar e volta ao subir (§7.2), as
   transições curtas e o tom dos textos (§10.1). Entra na B3, com a cor.

---

## 7. Wireframes das telas núcleo

Wireframes em texto: **posição e hierarquia**, não aparência. Viram
frames no Figma no G1. As seis primeiras são as telas núcleo; da 7.7 em
diante, as que completam o mapa (`fluxo-app.md` §2), escritas na B2.

### 7.1 T-03 Minhas pendências

A tela de chegada: é a primeira que abre para quem tem `EDITOR` ou
`APROVADOR` (`fluxo-app.md` §3), no computador e no celular, e por isso
precisa ser **convidativa**. Responde duas perguntas: *o que eu faço
primeiro* (o cartão) e *como está o meu dia* (as gavetas). Decisão (j) da
B2 (2026-10-26), a C2: o cartão da A (Asana) com o resumo da B (Deel),
virado gavetinhas a pedido de Matthew.

**Computador:**

```
(FS)  Segunda, 26 de outubro                                    [Nova NC]
      Boa noite, Fulana
      4 coisas esperam por você. 1 está vencida.

┌──────────────────────────────────────────────────────────────────────────┐
│ [🔧]  O mais urgente · Executar ação  ⚠ Vencido há 2 dias · o prazo era 24/10 │
│       AC-2026-0003 · Trocar o fornecedor da junta de vedação da linha 3     │
│       📄 NC-2026-0042 · Vazamento na linha 3   (FS)(CL) Você e Ciclano Lima │
│                                               [Ver a NC] [Abrir a ação]     │
└──────────────────────────────────────────────────────────────────────────┘

Para você hoje                                           Suas NCs
┌───────────────────────────────────────────────┐       ┌────────────────────┐
│ ⚠ Vencidas                               1  ⌃ │       │ 📄 NC-2026-0042 · … │
│     AC-2026-0003 · Trocar o fornec…  ⚠ Vencido há 2 dias ›│  ▢ Em investigação │
│ ✓ Aprovar                                2  ⌃ │       │ 📄 NC-2026-0038 · … │
│     IV-2026-0007 · A junta resseca…   Enviada há 1 dia › │  ▢ Aguardando apro…│
│     NC-2026-0038 · Fechamento         Enviada há 3 dias ›│ Ver todas as suas NCs│
│ 👤+ Triagem                              1  ⌃ │       └────────────────────┘
│     NC-2026-0045 · Rótulo ilegível          [Assumir] │
│ ◯✓ Corrigir, Verificar e mais 3 tipos: em dia    │
└───────────────────────────────────────────────┘
```

**Celular:** a mesma ordem empilhada, sem a coluna Suas NCs, sem o avatar
e sem a barra de cima (a saudação faz o papel do título; a aba
Pendências ativa diz onde a pessoa está; é a única tela raiz sem ela). O
cartão leva o botão **Abrir a ação** na largura toda (44 px), e tudo
cabe numa tela.

1. **A saudação:** a data (dia da semana e do mês), "Bom dia / Boa tarde /
   Boa noite" pela hora no fuso de São Paulo, o primeiro nome (do
   `/auth/eu`) e a frase do dia: quantas coisas esperam e quantas estão
   vencidas.
2. **O mais urgente:** um cartão com a primeira pendência na ordem da
   rota (vencidos primeiro, `fluxo-app.md` T-03). No computador, com o
   ícone do tipo, a descrição inteira, a data do prazo, a NC e os
   responsáveis com avatar, e **Ver a NC** + **Abrir a ação**. É um
   **atalho**: o item continua na gaveta dele, senão a contagem da gaveta
   mentiria. Sem pendência, o cartão não aparece.
3. **Para você hoje, em gavetinhas:** uma gaveta por grupo, na ordem dos
   grupos abaixo, com o ícone, o nome, a contagem e o ⌄/⌃. O cabeçalho tem
   fundo `fundo/pagina` e 48 px; o conteúdo, 16 px acima e abaixo. **No
   celular, as gavetas começam fechadas** (um tipo só já vem aberto); **no
   computador, abertas**. Só aparecem os grupos com itens; os tipos que a
   pessoa pode ter e estão vazios viram uma linha **"em dia"** no fim,
   com o ✓ (a Triagem só entra nessa conta para quem tem `APROVADOR` ou
   `GERENTE`). Cada linha: o rótulo do item (§10.3), a NC ou o motivo
   (Corrigir mostra o último motivo da reprovação, L7), o prazo com ícone e
   texto (vencido em vermelho, vencendo em âmbar, F3) ou o "há quanto
   tempo", e o › (ou o **Assumir**, na Triagem).
4. **Suas NCs** (só no computador): até 5 NCs da visão Minhas da T-04
   (`GET /ncs?minhas`), com a etapa, e o link **Ver todas as suas NCs**.
5. **O vazio, em dois casos** (a `impeccable`): **em dia** ("Você está em
   dia" + "Quando alguém pedir sua aprovação ou um prazo chegar perto,
   aparece aqui.") e **primeiro dia** ("Aqui aparece o que espera por
   você" + os tipos em linguagem de gente). Os dois com o **Ver as NCs** e
   sem o selo na barra.

Grupos na ordem: **Vencidas** → Aprovar → Corrigir → Verificar → Executar
→ Enviar para fechamento → Triagem → Menções → Rascunhos. "Assumir" na
triagem define a própria pessoa como aprovadora (da NC ou do filho sem
aprovador), sem precisar abrir o item. Os ícones são do lucide (o
conjunto do shadcn): alerta, prancheta com ✓ (Aprovar), lápis (Corrigir),
lupa com ✓ (Verificar), chave (Executar), pessoa com + (Triagem), @
(Menções), relógio (vence em breve), círculo com ✓ (em dia).

Componentes (degrau 1 do shadcn): `Card`, `Button`, `Avatar` e o
`Accordion` (Radix: teclado e leitor de tela prontos, `type="multiple"`).

### 7.2 T-04 Lista de NCs

Decisão (f) da B2, 2026-10-23, a estreia da `/desenhar` (Figma, página
Decisões (histórico), seção "Decisão (f)"; as referências, o Qatalog e o
Jira Cloud, no `docs/identidade/referencias-interface.md`). Comparadas a
tabela plana com pílulas (a A, escolhida) e a lista agrupada por etapa,
com a folha de filtros (a B, que ficou como opção do computador). O quadro
(kanban) ficou de fora: arrastar o cartão muda a etapa, e aqui a etapa é
calculada (`fluxo-app.md` §4), ninguém a move.

**Computador:** a tabela plana, com uma pílula por coluna onde o valor é
uma categoria (o estado e o setor), e texto simples no resto.

```
Não Conformidades                                           [＋ Nova NC]
38 abertas · 3 com prazo vencido
Todas   Minhas   Vencidas
[⌕ código ou título ] [Estado ⌄] [Etapa ⌄] [Setor ⌄] [Mais filtros ⌄] [Agrupar: nenhum ⌄]

 Código        Título                 Estado       Etapa               Setor         Detecção
 NC-2026-0045  Rótulo ilegível        (● Aberta)   Aguardando classif. (Expedição)   22/09/2026
 NC-2026-0042  Vazamento na linha 3   (● Aberta)   Em investigação ⚠   (Produção)    15/09/2026
 NC-2026-0038  Atraso na calibração   (⧗ Em apr.)  Aguardando aprov.   (Metrologia)  02/09/2026
 Mostrando 6 de 38                                                 [ Carregar mais ]
```

**Celular:** a linha rica (o código e o título, o estado, a etapa e o
setor) e os filtros em pílulas que rolam para o lado.

```
┌────────────────────────────────┐
│ Não Conformidades              │
│ 38 abertas · 3 com prazo venc. │
│ [⌕ código ou título          ] │
│ [ Todas | Minhas | Vencidas  ] │
│ (Etapa ⌄)(Estado ⌄)(Setor ⌄)(… │
│ NC-2026-0045 · Rótulo…  ●Aberta│
│ Aguardando classif. · Expedição│
│ …                              │
│ Mostrando 5 de 38              │
│ [        Carregar mais       ] │
│ ╭────────────────────╮ ●       │
│ │ Pend.   NCs   Eu   │ ＋      │
└────────────────────────────────┘
```

1. **A visão e o filtro têm caras diferentes.** As visões (Todas · Minhas
   · Vencidas) são abas no computador e um controle segmentado no
   celular; os filtros são pílulas com ⌄. Antes, no celular, eram pílulas
   iguais, e o "Filtros" parecia uma quarta visão.
2. **O filtro ativo mostra o valor e sai com um toque:** a pílula fica
   escura, com o valor e o ✕ ("Etapa: Em investigação ✕"). Vale também
   para os filtros que chegam prontos pelo link dos Relatórios (J12).
3. **No celular, a pílula abre uma folha** que sobe do rodapé, com as
   opções e a contagem de cada uma, o "Limpar" e o "Ver 20 NCs". A pílula
   tem 32 px de desenho e **44 px de área de toque** (§9); as mais usadas
   vêm primeiro (Etapa, Estado, Setor), porque as últimas ficam fora da
   tela, na rolagem para o lado.
4. **Agrupar por etapa, opcional e só no computador** ("Agrupar: nenhum"
   por padrão): para quem gerencia a fila, os grupos por etapa com a
   contagem ("Em investigação · 20"), e as fechadas recolhidas.
5. **A busca fica visível.** No celular, ela some ao rolar a lista para
   baixo e volta ao rolar para cima (o movimento é da B3, gesto 5, §6.2).
   Sem "puxar para revelar": num app web, o gesto briga com o atualizar do
   navegador, e o §7.3 já o reserva. O ＋ continua criando (§6.1, regra 5):
   virar busca na T-04 mudaria a função do mesmo botão conforme a tela.
6. **O que a API ainda não dá:** a etapa, o setor e o prazo vencido (L5) e
   a busca por texto, na C1; e o **total e as contagens** (o "38 abertas",
   o "Mostrando 6 de 38", o "Ver 20 NCs", a contagem dos grupos): a lista
   devolve só a página e o cursor (`fluxo-app.md`, L10, na C1).

Paginação por "Carregar mais" (a API usa cursor, não páginas numeradas).

### 7.3 T-06 Detalhe da NC (computador)

Revisto em 2026-10-23 (decisão (g) da B2; Figma, página Decisões
(histórico), seção "Decisão (g)"; as referências, o Deel, o Linear, o
incident.io e o Jira, no `docs/identidade/referencias-interface.md`).

```
┌──────────────────────────────────────────────────────────────────────┐
│ █ NC-2026-0042 · Vazamento na linha 3     [Enviar p/ fech. ⓘ][Salvar][Mais ▾] █ │
│ █ ● Aberta  Em investigação · Contenção em andamento  (◐◐◐◐)         █ │
├───────────────────────────────────────────────┬──────────────────────┤
│ DADOS                                    [✎]  │ [💬 Atividade  ① ›]   │
│ Descrição, requisito, processo, setor, origem │ 1 comentário novo    │
│ Classificação  (Maior) CL-2026-0011           ├──────────────────────┤
│ Detectada em, cliente                         │ CHECKLIST            │
├───────────────────────────────────────────────┤ ▮▮▯▯▯▯ • 2 de 6       │
│ ITENS DA NC • 1 de 4 fechados ▮▯▯▯            │ ✓ Classificação      │
│                [⧉] [Ordenar ▾] [☰|▦] [+ Novo item ▾] │ ⧗ Investigação ›     │
│ › CLASSIFICAÇÃO 1 · fechada            + Nova │ ◉ Contenção ›        │
│ ⌄ CONTENÇÃO 1                          + Nova │ ◌ Riscos revisados › │
│   CT-2026-0019 · Isolar o lote 42…  ● Aberta  (CR) Ciclano Reis  25/09 │
│ ⌄ INVESTIGAÇÃO 1                       + Nova ├──────────────────────┤
│   IV-2026-0007 · A junta resseca…   ⧗ Em apr. (FS) Fulana Souza   —   │
│ ⌄ AÇÃO CORRETIVA 1 · nasce de uma investigação aberta │ ATRIBUIÇÕES │
│   AC-2026-0003 · Trocar o fornec…   ● Aberta  (FS) Fulana  ⚠ Vencido │
│ › VERIFICAÇÃO 0 · nasce sozinha ao finalizar uma ação │ (BL) Beltrana [Aprovadora] │
├───────────────────────────────────────────────┤ (FS) Fulana [Responsável] │
│ ENVIO PARA FECHAMENTO                         │ ANEXOS (3)  [+ Anexar]│
│ Riscos revisados · Mudanças no SGQ            │                      │
└───────────────────────────────────────────────┴──────────────────────┘
```

1. **O bloco do título, escuro,** como no celular (o gesto 1 da casa,
   §6.2): o código e o título, o estado, a etapa e os indicadores, a
   pilha dos envolvidos e as ações à direita.
2. **Os Dados** trazem a **classificação vigente** (a última aprovada,
   PRD Q19) como tag, mesmo repetida nos Itens: é o que mais diz sobre a
   NC. O ID fica em cinza ao lado da tag.
3. **Os Itens da NC num cartão só**, na ordem do processo
   (Classificação → Contenção → Investigação → Ação Corretiva →
   Verificação):
   - no cabeçalho, a contagem e o **medidor em segmentos** (um por item,
     os fechados preenchidos; acima de 10 itens, contínuo);
   - **Agrupar por tipo** (um botão de ícone, apertado quando ligado;
     ligado por padrão): os grupos **abrem e fecham**, com a contagem; o
     grupo todo fechado começa recolhido; o "+ Nova" fica no grupo, e o
     tipo que não pode ter um novo diz o porquê (RN-49). Desligado, a
     lista plana com o tipo como coluna;
   - **Ordenar** por estado (os abertos e vencidos primeiro) ou por
     criação;
   - **Lista ou Cartões**: na lista, as colunas alinhadas (o item com o
     ID em cinza, o estado, o responsável com o nome, o prazo); nos
     cartões, o ID pequeno e o estado com o avatar em cima, o título
     embaixo e o prazo quando existe. A escolha fica no navegador;
   - **o nome do responsável fica na lista** (o "de quem é" é das colunas
     mais lidas, e as iniciais sozinhas são ambíguas); só o avatar nos
     cartões, onde o espaço é pouco.
4. **O Envio para fechamento** (riscos revisados, mudanças no SGQ) vem
   **depois** dos Itens: é o último passo.
5. **A coluna lateral:** o botão **Atividade** em cima (cinza, com o que é
   novo: "1 comentário novo · 6 eventos" e o selo), o **checklist** com um
   ícone por estado (✓ atendido, ⧗ em aprovação, ◉ aberta, ◌ a preencher)
   e a seta nos pendentes, as **atribuições** uma pessoa por linha, com o
   avatar e a função como tag (a da aprovadora escura), e os **anexos**.
6. **O feed não fica na página:** o botão Atividade abre um **painel à
   direita, de 380 px, que empurra a página** (sem cobrir o conteúdo),
   com Tudo · Comentários · Histórico, o feed inteiro e o campo de
   comentário. **Com o painel aberto, a coluna lateral sempre se recolhe**
   numa faixa de resumo no topo do conteúdo (o checklist com o medidor, as
   pessoas com as tags, os anexos), de altura igual, cada parte abrindo o
   conteúdo inteiro; com ela aberta, a tabela de itens apertava
   (Matthew, 2026-10-23).
7. **O feed** (nos dois tamanhos): os **dias** como cabeçalho; os
   **eventos** numa linha do tempo, com um ícone por tipo e o código do
   item, e o **antes → depois** nas mudanças (a `Auditoria` guarda os
   dois); os **comentários** em cartão, com o avatar, a @menção em negrito
   e o **Responder** (só nos comentários: responder a um evento é
   comentar a NC). O botão do campo é "Comentar" (o "Enviar" é o nome do
   submeter, §10.2). **O feed é só da NC** (PRD Q25, 2026-10-26): ele
   junta os eventos de todos os filhos, e só se comenta aqui. O atalho
   "Atividade deste item" de um filho (§7.4) abre este feed filtrado por
   ele, com o filtro à vista (o código do filho, que se tira com um toque).

**No celular** (decisão (b) da B2, 2026-10-22; Figma, página Wireframes,
seção "Decisão (b) · Detalhe da NC no celular"): um bloco escuro com o
título no topo e a página em quatro abas.

```
┌──────────────────────────────┐
│ ←  NC-2026-0042            ⋯ │ ┐
│ [● Aberta]          (◐◐◐◐)   │ │
│ Vazamento na linha 3         │ │ bloco do título
│ ⌕ Em investigação ·          │ │
│   Contenção em andamento     │ ┘
│ Resumo  Detalhes  Itens (3)  Feed │
│──────────────────────────────│
│ conteúdo da aba              │
│                              │
│ [Enviar p/ fechamento ⓘ] [Salvar] │
└──────────────────────────────┘
```

1. **A barra do topo:** voltar, o código e o ⋯.
2. **O bloco do título** (o "título grande" do Fresha), em
   `fundo/destaque`, token novo para a B3: no claro, o grafite
   (#1C1C1F); no escuro, um degrau **acima** da página e dos cartões
   (#1D1D21), porque a página já é quase preta. Dentro dele, de cima para
   baixo:
   - o **estado** na caixinha e, à direita, a **pilha dos envolvidos**
     (avatares gerados pelo nome, `docs/marca.md`; o toque abre as
     atribuições em Detalhes; para o leitor de tela, "4 envolvidos:
     Beltrana (aprovadora), Fulana, Ciclano, Deltrano");
   - o **título grande e inteiro** (até 200 caracteres, `nc.schema.ts`),
     sem corte;
   - a **etapa** e, ao lado, os **indicadores** que valerem
     (`fluxo-app.md` §4); com os três, a linha pode quebrar.
3. **Ao rolar para baixo**, o bloco encolhe e o título vai para a barra
   em 1 linha; **ao voltar ao topo**, ele reaparece inteiro (o "título
   grande" do iOS). Sem gesto novo: puxar além do topo já é o "puxar para
   atualizar". Com movimento reduzido, a troca acontece sem animação.
4. **As abas** (abre no Resumo; a pendência de menção abre no Feed):
   - **Resumo:** a descrição em até 3 linhas, com "Ler mais"; o checklist
     de fechamento; a atividade recente (3 eventos, com "Ver tudo").
   - **Detalhes:** a descrição inteira; os dados; o envio para fechamento
     (riscos revisados e mudanças no SGQ, campos de texto); as
     atribuições, uma pessoa por linha, com o avatar e a função como
     tag (Aprovadora, Responsável); a classificação vigente como tag nos
     dados; os anexos.
   - **Itens (N):** o medidor e o "+ Novo item"; os grupos por tipo, que
     abrem e fecham, com a contagem e o "+ Nova"; os itens em cartões com
     fundo (o ID pequeno, o estado e o avatar em cima, o título, o prazo),
     sem divisórias, porque os cartões já separam.
   - **Feed:** completo, a mesma linha do tempo do computador (item 7,
     acima); o campo de comentário toma o lugar da barra de ações.
   - As **abas** são iguais na largura, a ativa em negrito com o traço
     grosso e a contagem dos itens numa pílula (o Deel; o componente
     `Shell/Abas do item`).
5. **A barra de ações** (`fluxo-app.md` §7) fica fixa no rodapé no
   Resumo, em Detalhes e em Itens.

As alternativas que ficaram de fora (as abas Resumo · Itens · Feed, a
página única no estilo do Linear e os cabeçalhos intermediários) estão na
mesma seção do Figma, como registro. A T-07 no celular **não** segue
este padrão: é uma página só, sem abas (decisão (h), §7.4).

### 7.4 T-07 Itens filhos: o padrão, e a Ação Corretiva

**O padrão dos cinco** (decisão (h) da B2, 2026-10-26; Figma, página
Decisões, seção "Decisão (h) · o celular dos filhos"; referências: o
Linear e o GitHub):

1. **O bloco do título claro** (§6.2, gesto 1): a NC em cima (o caminho
   de volta), o **tipo** como título, o estado e os envolvidos embaixo; o
   código na barra de cima. No computador, as ações à direita do bloco.
2. **No celular, tudo empilhado numa página só, sem abas:** o formulário
   do tipo, as atribuições (uma pessoa por linha, com as tags), os anexos
   e o atalho; a barra de ações fixa no rodapé. As abas como as da NC
   foram a variante A, recomendada pelo Claude e não escolhida (ficaram
   na seção da decisão).
3. **Sem feed próprio** (PRD Q25): no lugar, o atalho **"Atividade deste
   item · N eventos · no feed da NC"**, que abre o feed da NC filtrado por
   ele, **sem sair do filho** (Matthew, 2026-10-26): no computador, o
   painel Atividade da NC, empurrando a página; no celular, o mesmo painel
   como **folha que sobe**, com o filho escurecido atrás (a alça e o "×"
   fecham). O filtro aparece como a pílula "Só este item: CT-2026-0019 ×";
   o "×" mostra o feed inteiro da NC, o mesmo da página da NC. Um link
   "Feed da NC-2026-0042 ›" leva à NC de fato. Não há campo de comentário
   no filho: o campo do painel comenta na NC.
4. O formulário **sem cabeçalho** que repita o tipo (o título do bloco
   já diz).

**A Ação Corretiva** (revista em 2026-10-26, na B2):

```
NC-2026-0042 · Vazamento na linha 3 › AC-2026-0003
Ação Corretiva                 [ Finalizar execução ] [ Salvar ] [ Mais ▾ ]
● Aberta  ✓ Plano aprovado · ⚠ Vencido há 2 dias  (BL)(FS)(CR)

PLANO (aprovado · só leitura), em grade de duas colunas
  Descrição                       Instruções de verificação
  Prazo                           Investigação  IV-2026-0007 ›
EXECUÇÃO
  Executada em [dd/mm/aaaa] (Hoje) (Ontem)   ┌ área de arrastar ┐
  Prazo do plano: 19/10 · vencido há 2 dias  │ fotos ou PDF     │
  Para finalizar: a data e a evidência.      └──────────────────┘
  Evidência [ o que foi feito                                    ]
─── atribuições · anexos · Atividade deste item › ───
```

1. **Empilhado, em toda largura:** o Plano em cima, a Execução embaixo.
   Lado a lado, as duas colunas apertavam abaixo de 1440 e deixavam um
   vazio embaixo do Plano só de leitura. O Plano aprovado vira um
   **resumo em grade** (Descrição | Instruções; Prazo | Investigação), e a
   Execução usa **as mesmas duas colunas**: a data com a ajuda (o prazo do
   plano e o que falta para finalizar) à esquerda, a área de arrastar à
   direita, na altura da linha; a Evidência embaixo, na largura toda.
2. **O plano em edição** (antes da aprovação) usa a mesma grade, com os
   campos: Descrição | Instruções; o Prazo com os atalhos Em 15 dias e Em
   30 dias | a Investigação fixa ("o vínculo não muda", RN-49). A Execução
   aparece fechada ("abre depois que o plano for aprovado"), e o botão é
   **Enviar plano para aprovação**.
3. **Finalizar execução** abre um diálogo (no celular, uma folha):
   "A ação fecha, sem nova aprovação, e a Verificação nasce para a
   Beltrana Lima", com **"Verificar em quantos dias?"** e a data calculada
   embaixo (o `diasParaVerificar` da API).
4. **Em tela menor:** abaixo de 1440, a coluna lateral vira a **faixa de
   resumo no topo** (Atividade deste item · Atribuições · Anexos), a mesma
   da NC com a Atividade aberta (§7.3). A regra vale para todos os
   filhos: quem decide é a largura da coluna principal, não o aparelho.
5. **No celular:** o Plano com as instruções e a investigação; a
   Execução com o campo de data e a mesma ajuda; o prazo numa linha
   própria embaixo do estado.

### 7.5 T-07 Investigação A3 (computador e celular)

```
NC-2026-0042 › IV-2026-0007 · A junta resseca antes…      ● Aberta
[ Enviar para aprovação (bloqueado ⓘ) ]  [ Salvar ]  [ Mais ▾ ]
┌────────────────────┬───────────────────────────────────────────────┐
│ ÍNDICE A3          │ REAL PROBLEMA                                 │
│ ✓ Percepção inicial│ [ texto                                     ] │
│ ✓ Descrição        │                                               │
│ ✓ Real problema    │ ISHIKAWA                                      │
│ ◐ Ishikawa         │ Método · Máquina · Material · Mão de obra ... │
│ ○ Causa direta     │                                               │
│ ○ 5 Porquês        │ HIPÓTESES                        [+ Hipótese] │
│ ○ Causa raiz       │  #  Descrição            Ishikawa  Classific. │
│ ○ Contramedidas    │  1  Junta ressecada      2         Causa dir. │
│ ○ Check efetivid.  │  2  (incompleta)         —         —      ⚠   │
│                    │ ...                                           │
│ Ações vinculadas   │                                               │
│  (nenhuma) [+ AC]  │                                               │
└────────────────────┴───────────────────────────────────────────────┘
```

O índice fica fixo ao rolar. ✓ preenchida · ◐ parcial · ○ vazia.

**O computador com o desenho do celular** (B2, 2026-10-26, pedido de
Matthew: "tenta deixar o PC parecido com o celular"). As duas visões saem do
mesmo construtor, então são iguais por construção; muda só o que o estado
pede (quem preenche tem os campos, o "⋯", o "+ Causa" e o "+ Hipótese").

1. **O bloco claro** (com "Salva por…" ou "Enviada por…" na linha de
   indicadores) e, como a página não tem coluna lateral, a **faixa de
   resumo da T-06**: três cartões, a **Atividade deste item** com o mesmo
   desenho do atalho dos outros filhos (abre o painel Atividade da NC,
   empurrando a página, já filtrado por "Só este item"), as
   **Atribuições** (o avatar e a etiqueta da aprovadora, a pilha e a
   contagem dos responsáveis) e os **Anexos** (o clipe e a contagem). As
   duas últimas abrem com o "⌄" uma lista que cai da faixa: as pessoas com
   as etiquetas e o "+ Adicionar responsável"; os anexos com o "+ Anexar" e
   a **área de arrastar** (o componente `AreaDeArrastar`).
2. **Cada seção é um cartão com o título e a frase do que ela é**, as
   mesmas das etapas do celular; os campos sem o rótulo que repetiria o
   título.
3. **O Ishikawa em três colunas** (duas filas de três categorias, do mesmo
   tamanho por fila), com a anatomia da causa do celular (o número no
   círculo, a origem embaixo) e a legenda com os ícones.
4. **A tabela das hipóteses é a mesma nas duas visões:** o número, a
   hipótese com o como verificar, a causa no Ishikawa e a classificação
   (o ícone e o nome, ou "Falta classificar" em vermelho).
5. **A causa direta mostra de onde veio:** "◆ Da hipótese 2 · causa 2 ·
   Material" em cima do texto; sem hipótese de causa direta, a caixa
   "Nenhuma hipótese marcada…" com o atalho para as hipóteses.
6. **Os 5 porquês na linha do tempo do celular** (o real problema de
   ponto de partida, os porquês ligados por um fio; na leitura, terminando
   na causa raiz). Substitui os degraus da regra 2 abaixo.
7. **Contramedidas e check em cartões:** a contramedida com o código, o
   título e a linha do estado do plano, do prazo e do responsável. **O
   check é uma linha curta por contramedida** (Matthew, 2026-10-26: com
   várias, ele ficaria imenso): o código e o título, um **mini andamento**
   (três ícones ligados, com o passo atual escrito) e o "⌄"; aberta, ela
   mostra o completo num painel só, sem caixas esticadas: o como
   verificar, **quem vai verificar e quando** (o prazo sai do Finalizar
   execução) e o **andamento vertical** (Plano → Execução → Verificação),
   separados por uma divisória no computador e empilhados no celular. Os
   desenhos mostram duas ações (a AC-2026-0004, "medir a dureza no
   recebimento", ataca a outra metade da causa raiz), uma aberta e uma
   fechada.

**As duas visões** (decisão (c) da B2, 2026-10-22), as duas no Figma:
- **Quem preenche** (`ABERTO`, o desenho acima): o progresso no topo do
  índice ("5 de 10 etapas completas", com uma barra), as seções como
  campos editáveis, o "+ Hipótese", e o Enviar para aprovação bloqueado
  com a lista do que falta aberta embaixo dele (por exemplo, "Causa raiz:
  pelo menos 20 caracteres", "Hipótese 2: falta a classificação",
  "Plano da AC-2026-0003: ainda em aprovação"). No "Mais", o Cancelar
  (RN-50).
- **O aprovador** (`EM_APROVACAO`): tudo só para leitura, com Aprovar e
  Reprovar. **Sem "+ Nova ação corretiva"**: a ação só nasce ligada a uma
  investigação aberta (RN-49).

**Três regras das seções** (Matthew, 2026-10-22, valem nas duas visões):
1. **O Ishikawa é numerado.** Cada causa ganha um número, e é por ele que
   a hipótese se liga ao diagrama (o `numeroIshikawa` da hipótese é um
   número, não a categoria); a coluna da hipótese mostra "4 · Meio
   ambiente". Ao lado da causa, o símbolo da classificação da hipótese:
   ◆ causa direta, ◇ fator contribuinte, × sem relação; sem símbolo, a
   causa ainda não tem hipótese classificada. A legenda fica embaixo do
   diagrama, e o símbolo nunca vem sozinho: a tabela das hipóteses repete
   o texto, e o leitor de tela lê o nome. Losango e × para não confundir
   com o ✓ ◐ ○ do índice.
2. **Os 5 porquês em cadeia:** cada porquê ligado ao anterior por um fio,
   numa linha do tempo, do real problema até a causa raiz (2026-10-26: no
   lugar dos degraus, a mesma estrutura do celular nos dois tamanhos).
3. **O check de efetividade não se preenche:** ele resume, para cada
   contramedida, o código e o título da ação, as instruções de
   verificação do plano (`instrucoesVerificacao`) e o andamento ("a VE
   nasce ao finalizar a execução"; depois, a Verificação e o resultado).
   No índice, ele conta como completo quando toda contramedida tem as
   instruções.
4. **Toda hipótese diz como vai ser verificada** (Matthew, 2026-10-26):
   o campo **Como verificar** fica entre a causa no Ishikawa e a
   classificação, que é o resultado do teste. Sem ele, a hipótese está
   incompleta e trava o envio (PRD Q26, RN-24). O banco ainda não tem o
   campo (`fluxo-app.md` L13, na C2).
5. **A causa direta vem da hipótese marcada como causa direta**
   (Matthew, 2026-10-26): a seção traz a resposta da hipótese, pronta
   para confirmar ou ajustar a redação; com mais de uma, todas; com
   nenhuma, a seção não pede texto, diz "Nenhuma hipótese marcada como
   causa direta ainda" e leva às hipóteses. O envio exige ao menos uma
   hipótese marcada como causa direta (PRD Q26, RN-24).

**No celular** (decisão (i) da B2, 2026-10-26; Figma, página Decisões,
seção "Decisão (i) · a Investigação no celular", e a seção "Celular · 4c ·
Investigação"
da página Wireframes; referências: Cleo AI, Chime, Shopify e Public).
Matthew: "nem todos os trabalhadores aqui possuem computador". Revê o
princípio 4 do `fluxo-app.md` §1.

1. **Quem preenche: uma etapa por tela.** A entrada é o índice das 10
   etapas numa lista compacta (a variante B, como a Shopify), com o
   progresso ("5 de 10") num medidor em segmentos e o ✓ ◐ ◌ de cada
   etapa; só as etapas pela metade dizem o que falta ("Falta classificar
   a hipótese 2"). Embaixo, as atribuições, os anexos e o atalho da
   atividade; no rodapé, o Enviar para aprovação bloqueado.
2. **A tela da etapa** (como a Public): a seta para o índice, "IV-2026-0007
   · Etapa 4 de 10", a barra de segmentos (escuro é completa) com um
   ponto embaixo da etapa atual; o título, a frase do que a etapa é, um
   lembrete do que veio antes e o conteúdo; no rodapé, **Anterior** e
   **Salvar e próxima** (o salvar é sempre um botão, U4; sair com algo não
   salvo pergunta). A última, o Check de efetividade, só tem leitura e
   termina em "Voltar ao índice".
3. **As etapas com estrutura:** o **Ishikawa** com um mapa das seis
   categorias em blocos de duas colunas (do mesmo tamanho por fila) e um
   cartão por categoria, com as causas numeradas, o "⋯" e o "+ Causa"; as
   **Hipóteses** em cartões (o número, a causa no Ishikawa num seletor com
   a lista numerada, o Como verificar e a classificação em pílulas com os
   ícones); os **5 Porquês** numa linha do tempo, do real problema até o
   link para a causa raiz.
4. **A anatomia da causa:** o número num círculo, em negrito; o texto; e
   uma linha de origem embaixo, com o ícone da classificação e a
   hipótese ("◇ Fator contribuinte · hipótese 1", "Hipótese 2 · falta
   classificar", "Sem hipótese ainda"); no mapa, a versão curta ("◇
   hipótese 1"). Os três símbolos são ícones de 12 px, não caracteres (a
   Figtree não os tem, e cada um saía de um tamanho).
5. **O aprovador: uma página corrida de leitura**, com as etapas em
   cartões, o Ishikawa no mesmo mapa, as hipóteses com a verificação e a
   origem, os 5 porquês na linha do tempo terminando na causa raiz, e
   Reprovar e Aprovar no rodapé; um link leva à investigação inteira no
   computador. A variante A da entrada (os cartões, como a Cleo e a Chime)
   ficou na seção da decisão.

### 7.6 T-05 Nova NC (celular)

Revista em 2026-10-23 (o gesto 4 da casa, §6.2): os campos em grupos com
nome, a regra como ajuda fixa e os responsáveis também no celular.

```
┌────────────────────────┐
│ ✕  Nova NC             │
├────────────────────────┤
│ O QUE ACONTECEU        │
│ Título                 │
│ [                    ] │
│ Pelo menos 5 caracteres│
│ Descrição              │
│ [                    ] │
│ Pelo menos 20 caract.  │
│ Detectada em  [hoje   ]│
│ Origem        [      ▾]│
│ ONDE                   │
│ Setor         [      ▾]│
│ Processo afetado  ...  │
│ Cliente (opcional)     │
│ O QUE FOI VIOLADO      │
│ Requisito violado ...  │
│ Responsáveis (você + …)│
│ [📷 Tirar foto/anexar] │
├────────────────────────┤
│ [Salvar rascunho][Publicar]│
└────────────────────────┘
```

"Detectada em" já vem com **hoje**. O botão de anexo abre a câmera no
celular. A regra do título (5 caracteres) e da descrição (20) é a do
`nc.schema.ts`, numa ajuda fixa embaixo do campo, nunca só no
placeholder. No computador, os mesmos três grupos, com os responsáveis e
os anexos na coluna da direita. Os responsáveis na criação ainda não
existem na rota (a C1: "NC criada com colaboradores").

### 7.7 T-01 Login

```
┌──────────────────────────────────────┐
│                                      │
│  andon                               │
│                                      │
│  Entrar                              │
│                                      │
│  E-mail                              │
│  [                                 ] │
│  Senha                               │
│  [                             👁 ]  │
│  [ ] Manter conectado                │
│                                      │
│  [            Entrar              ]  │
│                                      │
│  Esqueceu a senha? Peça um novo      │
│  convite ao administrador.           │
│                                      │
│  ──────────────────────────────────  │
│  [logo da empresa, monocromático]    │
└──────────────────────────────────────┘
```

No computador, o cartão fica centralizado sobre o `--background`; no
celular, ocupa a largura toda. É a única tela com a marca no centro
(o logotipo provisório, `docs/marca.md`) e com a **assinatura** da
empresa embaixo (§1), como texto de apoio.

- **Erro de credencial:** uma mensagem só, no topo do formulário,
  "E-mail ou senha incorretos." (a API não diz qual dos dois errou).
- **Limite de tentativas** (5 por minuto, TRD §4.3): "Muitas tentativas.
  Espere um minuto e tente de novo."
- **Sem "esqueci minha senha"** no MVP (PRD §4.3): o caminho é o ADMIN
  gerar um novo convite (T-10), que também serve para redefinir.
- **Sessão expirada** (`fluxo-app.md` §8): volta para cá e, depois de
  entrar, para onde a pessoa estava.

### 7.8 T-02 Definir senha

```
┌──────────────────────────────────────┐
│  andon                               │
│                                      │
│  Crie a sua senha                    │
│  Ela vale para entrar no sistema     │
│  daqui em diante.                    │
│                                      │
│  Nova senha                          │
│  [                             👁 ]  │
│  Mínimo de 12 caracteres             │
│  Repita a senha                      │
│  [                             👁 ]  │
│                                      │
│  [         Definir senha          ]  │
│                                      │
│  ──────────────────────────────────  │
│  [logo da empresa, monocromático]    │
└──────────────────────────────────────┘
```

Aberta pelo link do convite (`/definir-senha?token=…`, válido por 72 h).
A tela não mostra o nome nem o e-mail da pessoa (Matthew, 2026-10-21):
mostrar exigiria uma rota pública que lê o convite sem usá-lo, mais uma
porta sem login para proteger, e quem manda o link é o ADMIN, que já fala
com a pessoa.

- **Regra da senha:** 12 caracteres ou mais; o limite de 72 bytes só
  aparece se for atingido ("Senha longa demais"). "Repita a senha" é
  conferido só na tela.
- **Link vencido, já usado ou inválido:** uma mensagem só, "Este link
  não vale mais. Peça um novo convite ao administrador." (F5).
- **Sucesso:** vai para o Login, com o aviso "Senha definida. Entre com
  o seu e-mail."

### 7.9 T-07 Classificação

Desenhada **como fica depois da C2** (PRD Q22, pedido de Matthew em
2026-10-26): colaborador e aprovador excludentes por item, e a
Classificação **sem portão**.

```
← CL-2026-0011
NC-2026-0042 · Vazamento na linha 3 ›
Classificação              [ Concluir classificação ]  [ Salvar ]
● Aberta  (BL)

SOBRE A NC (só leitura)                              Abrir a NC ›
  Descrição · Requisito violado · Setor · Origem · Detectada em · Cliente
( ) Maior   Afeta o cliente, a segurança ou um requisito legal
( ) Menor   Desvio pontual, sem efeito no produto final
Justificativa
[ por que esta classificação                              ]
Mínimo de 20 caracteres
─── atribuições · anexos · Atividade deste item › ───
```

**Ler e depois classificar:** o cartão **Sobre a NC** vem antes do
formulário, com os dados da NC só para leitura (Matthew, 2026-10-26: a
tela do computador estava vazia, e quem classifica precisa ler a NC sem
sair da página). No celular, compacto: a descrição em 3 linhas e o "Ler
mais", como no Resumo da NC. Os dados vêm do `GET /nc/:id`.

**Quem conclui:** o **papel** decide, não a etiqueta. Só quem tem o papel
`APROVADOR` ou `GERENTE` cria, edita, publica e conclui (RN-20); para o
`EDITOR`, a tela é só leitura e a barra de ações some. Nas atribuições, a
pessoa que classifica aparece como **Responsável**: com a Q22, a
Classificação não tem aprovador. "Concluir classificação" leva direto a
`FECHADA`, como o Concluir da Verificação. **Não há Cancelar** (§7 do
fluxo): quando a classificação muda, cria-se outra. Por isso, aberta, ela
não tem o "Mais": nada iria nele.

**A conferir na C2** (PRD Q21): ao escolher **Menor**, entra uma seção
**Abrangência** (as NCs dos últimos 12 meses, para marcar as relacionadas,
e a justificativa específica na 3ª ocorrência). Ainda sem desenho: no
frame, uma nota.

### 7.10 T-07 Contenção

Revista em 2026-10-26 (B2, item 12).

```
NC-2026-0042 · Vazamento na linha 3 › CT-2026-0019
Contenção          [ Enviar para aprovação (bloqueado ⓘ) ] [ Salvar ] [ Mais ▾ ]
● Aberta  (BL)(CR)

SOBRE A NC (só leitura)                                  Abrir a NC ›
AÇÃO IMEDIATA
  Descrição [ o que foi feito para conter o problema ]  Mínimo de 20 caracteres
EXECUÇÃO   Preencha depois de executar: as duas são necessárias para enviar.
  Executada em [dd/mm/aaaa] (Hoje) (Ontem)
  Disposição   ( ) Aceito      Usado como está, com a liberação de quem pode autorizar
               ( ) Corrigido   Ajustado ou refeito até atender ao requisito
               ( ) Anulado     Descartado, cancelado ou recolhido
               ( ) Em análise  Separado, esperando a decisão
─── atribuições · anexos · Atividade deste item › ───
```

1. **Sobre a NC** antes da ação: quem contém precisa saber o que
   aconteceu (o mesmo cartão da Classificação, com a classificação
   vigente).
2. **A data** com o `CampoData` (Hoje · Ontem ao lado; o campo abre o
   calendário). **A disposição** em quatro cartões com a explicação, em
   duas colunas no computador e empilhados no celular. As explicações são
   uma proposta do Claude, a conferir com a analista (o PRD só diz que os
   termos são genéricos).
3. Publicada só com a descrição (mínimo de 20 caracteres); a data e a
   disposição vêm depois de executar. Sem elas, o "Enviar para aprovação"
   mostra a lista do que falta (J3). No "Mais", o Cancelar, para o
   aprovador ou o `GERENTE`.
4. **A Contenção nova (rascunho)**, nos dois tamanhos, vale de exemplo
   para os cinco tipos: "Rascunho" no lugar do código, o estado Rascunho,
   **Publicar** e Salvar, e o **Excluir rascunho** no "Mais". O aprovador da
   NC já aparece (RN-46), e o atalho da atividade não aparece: o filho só
   entra no feed da NC quando é publicado (RN-10).
5. **Fechada**, a tela mostra embaixo do cabeçalho: "Não resolveu? Crie
   uma nova contenção na NC" (RN-42: a contenção não se reabre). Ainda sem
   desenho (item 14 da B2, os estados).

### 7.11 T-07 Verificação

Revista em 2026-10-26 (B2, item 12).

```
NC-2026-0029 · Rebarba no flange › VE-2026-0001
Verificação                 [ Concluir verificação ] [ Salvar ] [ Mais ▾ ]
● Aberta  🕒 Vence em 5 dias  (BL)

SOBRE A AÇÃO AC-2026-0001 ›  (só leitura)
  Plano · Instruções de verificação · Evidência · Executada em
RESULTADO   ( ) Eficaz        ( ) Parcialmente eficaz      ( ) Não eficaz
            Nada mais acontece  Cria uma nova ação          Reabre a investigação
                                corretiva em rascunho       e a NC
  Conclusão     [ o que foi conferido e o que se viu ]
  Verificada em [dd/mm/aaaa] (Hoje) (Ontem)
─── atribuições · anexos · Atividade deste item › ───
```

1. **Sobre a ação** no lugar das instruções soltas: para verificar a
   eficácia, o que importa é a ação (o plano, as instruções, a evidência
   e quando foi executada); a NC continua no caminho de volta.
2. **O resultado em três colunas** no computador, com o efeito de cada
   um; no celular, empilhado. **A data** com o `CampoData`.
3. Nasce sozinha ao finalizar a execução da ação (J5), já aberta, nunca
   em rascunho. Desenhada **como fica depois da C2** (PRD Q22): a pessoa
   aparece só como **Responsável**; a Verificação não tem portão, e o
   aprovador nela não serve para nada. Hoje o backend a cria com o
   aprovador da ação como colaborador **e** aprovador
   (`acao-corretiva.service.ts:82-83`), o que a Q22 proíbe: na C2, ela
   nasce só com o colaborador (plano, linha da C2).
4. "Concluir verificação" é só do responsável com papel `APROVADOR` (§7
   do fluxo) e abre o `DialogoEfeito` com o efeito do resultado escolhido:

```
┌──────────────────────────────────────────────┐
│ Concluir como Não eficaz?                    │
│ A investigação IV-2026-0007 e a NC-2026-0042 │
│ serão reabertas.                             │
│                     [ Voltar ] [ Concluir ]  │
└──────────────────────────────────────────────┘
```

Eficaz: "Nada mais acontece." Parcialmente eficaz: "Uma nova ação
corretiva será criada em rascunho para os mesmos responsáveis."

### 7.12 T-08 Relatórios

```
Relatórios                               Período: [ últimos 12 meses ▾ ]

 NCs abertas      Tempo médio até fechar   Ações atrasadas   Eficácia
 14               23 dias                  3                 82%
 ↑ 2 no período   ↓ 4 dias                 → ver quais       das verificações

NCS ABERTAS                          [ por setor | por origem ]
 Produção    ████████████  6
 Expedição   ██████        3
 Metrologia  ████          2  ...

TEMPO MÉDIO DA DETECÇÃO AO FECHAMENTO
 dias │      ╱‾‾╲            ── Maior
      │ ‾‾‾‾╱    ‾‾‾‾        ┄┄ Menor
      └──────────────────── meses

ATRASADAS (ações e verificações)
 Item          Com quem      Vencido há
 AC-2026-0003  Fulana        2 dias     →
 VE-2026-0001  Beltrana      9 dias     →

EFICÁCIA E REINCIDÊNCIA
 Eficaz 18 · Parcialmente eficaz 3 · Não eficaz 1
 NCs reabertas: 2 →
 Causas-raiz que se repetem: "junta ressecada" (3 NCs) →
```

Os quatro relatórios da RF-19, nessa ordem, todos com o mesmo filtro de
período. **Todo número leva à lista de NCs já filtrada** (J12). Sem cor
nas séries (Grafite): a classificação se distingue pelo traço, linha
cheia e tracejada, e a variação da fileira de números leva seta e texto,
não só cor. Só no computador.

### 7.13 T-09 Usuários

```
Usuários                                          [ ＋ Novo usuário ]
[🔍 nome ou e-mail        ] [ Situação: Ativos ▾ ]

 Nome          E-mail                 Setor       Papéis              Situação
 Beltrana      beltrana@empresa.com   Qualidade   Aprovador, Gerente  ● Ativa
 Fulana        fulana@empresa.com     Produção    Editor              ● Ativa
 Ciclano       ciclano@empresa.com    Expedição   Editor              ○ Inativa
                                                   [ Carregar mais ]
```

Só o `ADMIN` (menu "Administração"). A busca procura no nome e no
e-mail; a situação filtra ativos, inativos ou todos. A linha inteira abre
o detalhe (T-10).

### 7.14 T-10 Detalhe do usuário

```
Usuários › Beltrana                                       ● Ativa
[ Salvar ]  [ Gerar novo convite ]  [ Mais ▾ ]  (Mais: Inativar)

DADOS
  Nome    [ Beltrana Souza          ]
  E-mail  beltrana@empresa.com   (é o login; não muda)
  Setor   [ Qualidade             ▾ ]
PAPÉIS
  Aprovador ✕   Gerente ✕   [ ＋ Conceder papel ▾ ]
```

Conceder e revogar papel valem na hora, um por vez (confirmação simples
para revogar, §8.2). **Gerar novo convite** mostra o link para copiar e
até quando vale; ele também serve para redefinir a senha. Inativa, a
pessoa mostra **Reativar** no lugar de Inativar.

A recusa da RN-43 aparece no topo, com a lista do que resolver:

```
┌────────────────────────────────────────────────────────────────┐
│ Não dá para inativar a Beltrana: ela é aprovadora de 3 itens   │
│ em andamento. Um gerente troca o aprovador deles, e você tenta  │
│ de novo.                                                        │
│  NC-2026-0042 · Vazamento na linha 3          ● Aberta       →  │
│  IV-2026-0007 · A junta resseca antes…        ⧗ Em aprovação →  │
│  CT-2026-0019 · Isolar o lote 42…              ● Aberta       →  │
└────────────────────────────────────────────────────────────────┘
```

As outras recusas usam o mesmo lugar: o último `ADMIN` ativo ("Não dá
para inativar o último administrador") e a pessoa num setor desativado
("Mude o setor antes de reativar", RN-44).

### 7.15 T-11 Novo usuário

```
Usuários › Novo usuário

  Nome    [                          ]
  E-mail  [                          ]
  Setor   [ escolha               ▾ ]
  Papéis  [ ] Visualizador — vê as NCs, sem editar
          [ ] Editor       — registra e trabalha nas NCs
          [ ] Aprovador    — classifica, aprova e verifica
          [ ] Gerente      — cancela, reatribui, relatórios
          [ ] Administrador — contas, papéis e setores
  [ Cancelar ]                          [ Criar e gerar convite ]
```

O setor só oferece os ativos; ao menos um papel. Depois de criar, a
mesma tela mostra o convite:

```
┌────────────────────────────────────────────────────────────┐
│ ✓ Fulana foi criada. Envie este link a ela (vale 72 h):    │
│ [ https://…/definir-senha?token=…           ] [ Copiar ]   │
│ O link aparece só agora. Depois, só gerando outro.          │
│                              [ Ir para o usuário ]          │
└────────────────────────────────────────────────────────────┘
```

Sem e-mail no MVP: o ADMIN envia o link por fora (J11).

### 7.16 T-12 Setores

```
Setores                                           [ ＋ Novo setor ]
[ Situação: Ativos ▾ ]

 Nome          Situação
 Expedição     ● Ativo      [✎ Renomear]  [ Desativar ]
 Produção      ● Ativo      [✎ Renomear]  [ Desativar ]
 Almoxarifado  ○ Desativado              [ Reativar ]
```

Criar e renomear acontecem na própria linha (o nome é o único campo).
Desativar pede confirmação simples (§8.2), e a recusa da RN-44 lista
quem ainda está no setor, com link para cada pessoa (T-10): "Mude o
setor destas pessoas antes de desativar". Reativar devolve o setor
às opções, sem confirmação (é reversível).

**No celular** (T-08 a T-12, B2, 2026-10-22; Figma, seção "Gestão e
administração"): telas internas, abertas pela tela Eu (§6.1), com a seta
de voltar e sem a barra de abas. As tabelas viram listas de cartões; a
ação principal da tela (Novo usuário, Novo setor, Salvar, Criar e gerar
convite) vai para a barra fixa no rodapé; as ações de cada setor saem da
linha e abrem num toque no cartão. O convite gerado ganha o
**Compartilhar**, que abre o menu do celular (WhatsApp, Teams), além do
Copiar. Os Relatórios ficam numa coluna, com os 4 números em grade 2 × 2.
O diálogo do efeito da Verificação vira uma folha que sobe do rodapé,
com os botões empilhados.

---

## 8. Padrões de interação

### 8.1 Salvar

**Salvar é explícito** (botão), não automático (U4). Motivo técnico
que decide: **toda gravação gera uma linha de auditoria** (RN-07).
Salvamento automático a cada poucos segundos encheria a trilha de
auditoria com centenas de registros sem significado — justamente a
evidência que o auditor vai ler.

Para não perder trabalho:
- Sair da tela com alterações não salvas pede confirmação.
- O texto digitado fica guardado **no navegador** enquanto não é salvo,
  e é oferecido de volta se a página fechar por acidente (não vai para
  o servidor, então não gera auditoria).

### 8.2 Confirmações

| Ação | Confirmação |
|---|---|
| Salvar, publicar, submeter, aprovar | **Nenhuma** — são reversíveis ou esperadas; confirmar tudo treina a pessoa a clicar "OK" sem ler |
| Reprovar, cancelar, reabrir | `DialogoMotivo` — motivo obrigatório |
| Excluir rascunho | Confirmação simples ("Excluir o rascunho? Não dá pra desfazer.") |
| Finalizar execução | `DialogoEfeito` — pede os dias até a verificação e explica que a ação fecha e a verificação é criada |
| Concluir verificação | `DialogoEfeito` — explica o efeito do resultado escolhido (`fluxo-app.md` J7) |
| Inativar usuário, revogar papel, desativar setor | Confirmação simples |

### 8.3 Retorno ao usuário

- **Sucesso:** aviso rápido (Sonner) no canto — "Investigação submetida
  para aprovação". Some sozinho.
- **Erro de validação:** mensagem **ao lado do campo**, e o foco vai
  para o primeiro campo com erro.
- **Erro de regra de negócio** (ex.: a guarda de fechamento recusou):
  mensagem no topo do formulário, com o texto que o backend devolveu.
- **Erro de rede:** aviso persistente com "Tentar de novo"; o formulário
  mantém o que foi digitado.

### 8.4 Formatos

| Tipo | Formato |
|---|---|
| Data | `dd/mm/aaaa` |
| Data e hora | `dd/mm/aaaa HH:mm` (24 h) |
| Datas relativas no feed | "há 5 min", "ontem 14:02"; a data completa ao passar o mouse |
| Fuso | `America/Sao_Paulo` |
| Números | Separador de milhar `.` e decimal `,` |

---

## 9. Acessibilidade

Critérios do G2 e do G5, aplicados a **toda** tela:

1. **Contraste** ≥ 4,5:1 para texto, ≥ 3:1 para ícones e bordas de campo.
   O campo tem a **borda inteira** de 1 px em `borda/controle` (#8A8A8F
   no claro, 3,44:1; #68686D no escuro, 3,35:1), o canto de 6 px e o foco
   num anel de 2 px afastado 2 px; no shadcn, o `--input` e o `--ring`
   (decisão (d) da B2, 2026-10-22). A borda clara do padrão do shadcn
   (#D4D4D8, 1,48:1) não passa.
2. **Nunca só cor** — badges com ícone + texto; prazos com texto
   ("Vencido há 2 dias"); campos com erro com mensagem, não só borda
   vermelha. Parte da equipe pode ter daltonismo, e o app pode ser
   impresso.
3. **Teclado** — tudo alcançável e operável com Tab/Enter/Esc; foco
   sempre visível (`--ring`). Os componentes Radix por trás do shadcn/ui
   já resolvem boa parte disso; o cuidado é não quebrar.
4. **Rótulos** — todo campo com `<label>` visível (não só placeholder);
   botões só com ícone têm nome acessível.
5. **Toque** — alvos ≥ 44 × 44 px no celular.
6. **Movimento** — animações curtas e funcionais; respeitar "reduzir
   movimento" do sistema operacional.
7. **`BotaoBloqueado`** — a lista do que falta precisa ser alcançável por
   teclado e leitor de tela, não só pelo mouse (botão desabilitado de
   verdade não recebe foco; usar `aria-disabled` em vez de `disabled`).

---

## 10. Textos da interface

### 10.1 Tom

- **Direto e em voz ativa:** "Preencha a causa raiz", não "A causa raiz
  deve ser preenchida".
- **Nunca mostrar enum, código de erro ou termo técnico:** "Em
  aprovação", não `EM_APROVACAO`; "Você não tem permissão para aprovar
  este item", não `403`.
- **Explicar o próximo passo** quando algo bloqueia: "Falta aprovar o
  plano da AC-2026-0003".
- **Tratamento por "você"**, sem formalidade excessiva.

### 10.2 Glossário (termo do sistema → termo na tela)

| Backend | Na tela | Observação |
|---|---|---|
| Registro | Item | "Registro" é um detalhe técnico |
| Publicar | **Publicar** | Vira oficial e ganha código |
| Submeter | **Enviar para aprovação** (U1) | Mais claro para quem não conhece o jargão |
| Submeter NC | **Enviar para fechamento** (U1) | |
| Decidir (APROVADO/REPROVADO) | **Aprovar** / **Reprovar** | |
| Concluir (Verificação) | **Concluir verificação** | |
| Finalizar execução | **Finalizar execução** | |
| Colaborador | **Responsável** (U1) | "Colaborador" também é como se chama funcionário no Brasil — ambíguo |
| Aprovador | **Aprovador** | |
| Não Conformidade | **NC** em listas e títulos, "Não Conformidade" por extenso na primeira vez de cada tela | |

### 10.3 Como um item aparece numa lista ou num cabeçalho

Só a NC tem título (`prisma/schema.prisma`): os cinco filhos não têm.
Regra (Matthew, 2026-10-21): **o código + o começo do texto principal do
tipo**, cortado com "…", e a NC no caminho de volta. Sem código (ainda em
rascunho), "Rascunho" no lugar dele.

| Tipo | Ao lado do código | Exemplo |
|---|---|---|
| NC | O título | `NC-2026-0042 · Vazamento na linha 3` |
| Classificação | O valor | `CL-2026-0011 · Maior` |
| Contenção | O começo da descrição | `CT-2026-0019 · Isolar o lote 42…` |
| Investigação | O começo do real problema | `IV-2026-0007 · A junta resseca antes…` |
| Ação Corretiva | O começo da descrição do plano | `AC-2026-0003 · Trocar o fornecedor da junta…` |
| Verificação | A ação de origem | `VE-2026-0002 · da AC-2026-0003` |

O rótulo vale nas listas, no feed, nas pendências e no caminho de volta.
**No bloco do título do próprio filho, não**: lá o título é o tipo, e o
código fica na barra de cima (decisão (h), §6.2).

No front, o rótulo sai de **uma função só**: se os filhos ganharem título
(a avaliar antes da C0, plano), muda só ela.

---

## 11. Fora do MVP de UI

Personalização de colunas da lista · atalhos de teclado
além do conjunto curto (§6.1; as ações por tecla) · impressão formatada da NC (relatório para auditoria) ·
internacionalização (só pt-BR).

---

## 12. Decisões tomadas

Com Matthew, em 2026-09-24 (além das da §1).

| # | Pergunta | Decisão |
|---|---|---|
| **U1** | Textos dos botões e das atribuições | **"Enviar para aprovação"** e **"Responsável"** na tela; código e banco mantêm os nomes atuais → §10.2 |
| **U2** | Navegação no celular | **Barra flutuante** com Pendências, NCs e Eu, e o ＋ Nova NC ao lado; a tela Eu no lugar do menu (revista em 2026-10-22, B2) → §6.1 |
| **U3** | Fonte | **Figtree** (B1, 2026-10-13); sempre servida pelo nosso servidor; `tabular-nums` nos números → §3.2 |
| **U4** | Salvar | **Botão explícito** + cópia local no navegador → §8.1 |
| **U5** | Quem monta o Figma | **Claude cria os wireframes** (a partir da §7) no Figma de Matthew; **Matthew faz os mockups** |

**Identidade visual:** definida na B1 (2026-10-20, `docs/marca.md`): o
Grafite, a Figtree, o logotipo provisório e a assinatura da empresa. A B3
passa os valores para a §3 e para o `DESIGN.md`, sem mudar os nomes dos
tokens.

---

## Histórico

| Data | Mudança |
|---|---|
| 2026-09-24 | v1 — decisões iniciais e U1–U5 |
| 2026-09-24 | v1.1 — revisão cruzada: wireframes com os termos do glossário (U1), prefixos reais dos códigos, aprovador no checklist, triagem inclui filhos |
| 2026-10-01 | v1.2 — etapa "Em plano de ação" removida; checklist da NC sem os planos, que passam para a investigação (PRD Q17) |
| 2026-10-21 | v1.3 — B2: os wireframes em texto que faltavam (§7.7 a §7.16): Login, Definir senha, Classificação, Contenção, Verificação, Relatórios e as quatro de administração |
| 2026-10-21 | v1.4 — coerência com a B1: o §1 sem as faces Dawn e Dusk como se valessem (estão suspensas), e o tema escuro sai da §11 (é do MVP desde 2026-10-13) |
| 2026-10-21 | v1.5 — o reativar setor no T-12 (a rota existe desde a A6; o wireframe dizia que não) e a decisão do T-02 sem o nome da pessoa |
| 2026-10-21 | v1.6 — como um item aparece (§10.3): os filhos não têm título, então o código + o começo do texto principal; os wireframes §7.1, §7.3, §7.4, §7.5, §7.9, §7.10 e §7.14 seguem a regra; o "Sair de todos os aparelhos" no menu da pessoa (§6.1) |
| 2026-10-21 | v1.7 — B2: a proposta da barra inferior de três destinos e do avatar (muda a U2, a confirmar), o computador sem barra de topo e os grupos do menu em letra normal (§6.1) |
| 2026-10-22 | v1.8 — B2, decisão (a): a U2 revista (a barra flutuante Pendências · NCs · Eu, o ＋ ao lado, só nas telas raiz; a tela Eu com a Gestão; o ＋ cria a coisa principal da tela) e o plano para outros módulos (§6.1) |
| 2026-10-22 | v1.9 — B2, decisão (b): o Detalhe da NC no celular (§7.3) em quatro abas (Resumo · Detalhes · Itens · Feed), com o bloco do título no estilo do Fresha (o estado e a pilha dos envolvidos em cima, a etapa embaixo, o título inteiro que encolhe ao rolar) e o token `fundo/destaque` para a B3 |
| 2026-10-22 | v1.10 — B2, decisão (c): a Investigação nas duas visões (§7.5), quem preenche e o aprovador; o aprovador sem "+ Nova ação corretiva" (RN-49) |
| 2026-10-22 | v1.11 — a Investigação (§7.5): o Ishikawa numerado com o símbolo da classificação, os 5 porquês em cadeia e o check de efetividade como resumo das contramedidas |
| 2026-10-22 | v1.12 — Relatórios e administração no celular (depois do §7.16) e o diálogo do efeito como folha |
| 2026-10-22 | v1.13 — B2, decisão (e): a navegação do computador vira uma doca flutuante embaixo, no centro, com a busca (Ctrl K) e a pessoa no fim; 96 px livres embaixo do conteúdo; sem menu lateral nem barra de topo (§6.1) |
| 2026-10-22 | v1.14 — B2, decisão (d): a borda dos campos (§9), a borda inteira em `borda/controle` e o anel de foco |
| 2026-10-23 | v1.15 — O método do Design System (§2.2): o Atomic Design para organizar, os tokens em duas camadas (primitivos e semânticos), a base comum e as telas na ordem das fatias C, as cinco regras de governança e a ponte com o código; as páginas do Figma por camada (§2.1); a escada do componente (§1.1) |
| 2026-10-23 | v1.16 — O token `marca/toque` reservado (§2.2, item 1), para a cor de uma empresa cliente, se o Andon virar SaaS |
| 2026-10-23 | v1.17 — Os gestos da casa (§6.2): o bloco do título com hierarquia (escuro só na NC; claro nos filhos, com a NC em cima), a frase de estado, o número protagonista, o formulário com ritmo e, na B3, movimento e voz |
| 2026-10-23 | v1.18 — Decisão (f) da B2: a T-04 (§7.2) com a tabela plana e as pílulas, as visões separadas dos filtros, o filtro ativo com o valor, a folha no celular, o agrupar por etapa opcional no computador, a busca visível que some ao rolar; o total e as contagens que a API ainda não dá |
| 2026-10-23 | v1.19 — Decisão (g) da B2: a T-06 do computador refeita (§7.3: o bloco escuro, a classificação nos Dados, os Itens da NC agrupados ou não, em lista ou cartões, o medidor em segmentos, o Envio depois dos Itens, a Atividade num painel que empurra a página e recolhe a lateral numa faixa, o feed em linha do tempo com o Responder); no celular, as abas do Deel, os Itens em grupos e cartões, as atribuições com tags; a T-05 em grupos com a ajuda fixa (§7.6); os componentes `ItensDaNC`, `PainelAtividade` e `Medidor` (§5.1) |
| 2026-10-26 | v1.20 — Decisão (h) da B2: a T-07 no celular empilhada, sem abas (§7.4, o padrão dos cinco filhos); no bloco do filho, o tipo como título e o estado embaixo dele (§6.2, gesto 1); o feed só na NC, com os eventos dos filhos e o atalho "Atividade deste item" (§7.3, §7.4, §5.1; PRD Q25); a Classificação refeita como fica depois da C2 (§7.9: a Q22, sem portão, "Concluir classificação"; o cartão Sobre a NC antes do formulário) |
| 2026-10-26 | v1.21 — B2, item 12 e decisão (i): a T-07 dos cinco tipos revista (§7.4 a Ação Corretiva empilhada, com o plano em grade, o plano em edição, o diálogo do Finalizar e a faixa abaixo de 1440; §7.10 a Contenção com o Sobre a NC, a data com atalhos, a disposição em cartões e o rascunho; §7.11 a Verificação com o Sobre a ação, depois da C2); a Investigação no celular, uma etapa por tela, e a leitura do aprovador (§7.5); o Como verificar das hipóteses e a causa direta vinda da hipótese (§7.5); a linha de indicadores (§6.2, gesto 1); os componentes `AreaDeArrastar`, `CampoData` e `EtapasA3` (§5.1) |
| 2026-10-26 | v1.22 — §7.5: a Investigação do computador com o desenho do celular (a faixa da T-06 e os três estados abertos, as seções em cartões, o Ishikawa em três colunas, a mesma tabela das hipóteses nas duas visões, a origem da causa direta, os porquês em linha do tempo, contramedidas e check em cartões com o andamento) |
| 2026-10-26 | v1.23 — §7.4: o atalho Atividade deste item abre o feed da NC sem sair do filho (no celular, uma folha), filtrado pelo item, com o × que mostra o feed inteiro; §7.5: o check em linhas curtas com o ⌄ |
| 2026-10-26 | v1.24 — §7.1: a T-03 Minhas pendências como tela de chegada (decisão (j) da B2, a C2): a saudação, o cartão do mais urgente, as gavetinhas do "Para você hoje" com o "em dia", Suas NCs no computador, o vazio em dois casos e os ícones do lucide; no celular, sem a barra de cima |
| 2026-10-26 | v1.25 — §6.1: os atalhos de teclado, um conjunto curto (Ctrl K, ?, J/K, Enter, Esc, G+P/N), que não age em campo de texto e pode ser desligado (WCAG 2.1.4); §11: fora do MVP fica só o que passa disso |
