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
| Identidade visual | **Própria da plataforma Andon** (nome **provisório** desde 2026-10-20, `docs/marca.md`), com a **assinatura** da empresa (revisto em 2026-10-13; antes, "decidir depois"; o nome Andon é de 2026-10-15 e substitui "Dusk & Dawn" no texto ao lado, onde as **faces Dawn e Dusk estão suspensas** desde 2026-10-14, `docs/marca.md`) | A identidade oficial da empresa não combina com o app, e Matthew tem liberdade para decidir. **Andon** é o nome da **plataforma**, que vai ganhar módulos além das NCs (o roteiro no `README.md`); cada módulo mantém um nome que diz o que faz ("Andon · Qualidade"). O código continua `qualityhub`: o nome só aparece na tela. A plataforma tem **uma cara só**, com um login: as faces Dawn (colaborador) e Dusk (gestão) da direção de 2026-10-13 estão **suspensas** (`docs/marca.md`, "Suspenso"). O que muda por pessoa é o menu e a tela inicial, pelos papéis (`fluxo-app.md` §2.1 e §3). A autoria de Matthew fica numa tela **"Sobre"** ("Criado por Matthew", com o aviso de copyright), não na marca. A empresa aparece só como assinatura, com o logo dela **monocromático** (cinza ou a cor do texto, nunca as cores originais): no login, no rodapé do menu lateral, no rodapé do e-mail de convite e no cabeçalho dos relatórios exportados. O ícone da aba, o topo das telas e os botões são do Andon. Os tokens continuam por **função** (`--perigo`, `--primary`...); a B1 definiu os valores (`docs/marca.md`: o **Grafite**, sem cor de destaque; as faces não entram no tema), e o `DESIGN.md` da B3 registra tudo |
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

| Página | Conteúdo |
|---|---|
| **Fundações** | Variables de cor, tipografia, espaçamento e raio, com os mesmos nomes dos tokens da §3 |
| **Componentes** | Os componentes da §5. Variantes do badge com os nomes do enum (`RASCUNHO`, `EM_APROVACAO`...), assim o handoff é mecânico: o nome no Figma é a chave no código |
| **Wireframes** | Cinza, sem cor, um frame por tela (desktop e, quando indicado, celular) |
| **Mockups** | As mesmas telas com as fundações aplicadas e os estados do G4 |

---

## 3. Fundações (tokens)

### 3.1 Cores

Os nomes são **funções**, não cores. Os valores são **provisórios** (tons
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
| Computador | ≥ 1024 px | Menu lateral fixo + conteúdo; detalhe da NC com coluna lateral |

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
| `Anexos` | react-dropzone | Lista de arquivos + área de envio, com tipo e tamanho validados antes de enviar |
| `IndiceA3` | — | Índice lateral da Investigação, com o preenchimento de cada etapa |
| `ItemPendencia` | Card | Uma linha de "Minhas pendências" |
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

**Computador:**

```
┌──────────────┬──────────────────────────────────────────────┐
│ QualityHub   │  NC-2026-0042 › Investigação IV-2026-0007     │
│              │──────────────────────────────────────────────│
│ ◉ Pendências │                                              │
│   (4)        │              conteúdo da tela                 │
│ ▢ NCs        │                                              │
│ ▢ Relatórios │                                              │
│              │                                              │
│ ──────────── │                                              │
│ Fulana ▾     │                                              │
│  Tela inicial│                                              │
│  Sair        │                                              │
└──────────────┴──────────────────────────────────────────────┘
```

O menu da pessoa (o nome) abre **Tela inicial**, **Sair** e **Sair de
todos os aparelhos** (`fluxo-app.md` §2.1). O contador das Pendências
depende do `GET /pendencias`, que chega na C3.

**Celular:** barra superior com o título + **barra inferior de
navegação** (U2):

```
┌────────────────────────┐
│ ← NC-2026-0042      ⋯  │
├────────────────────────┤
│                        │
│    conteúdo (1 coluna) │
│                        │
├────────────────────────┤
│ Pendências  NCs  ＋  ☰ │
└────────────────────────┘
```

O **＋** abre direto a Nova NC: registrar no chão de fábrica é o uso
principal no celular (`fluxo-app.md` §1).

---

## 7. Wireframes das telas núcleo

Wireframes em texto: **posição e hierarquia**, não aparência. Viram
frames no Figma no G1. As seis primeiras são as telas núcleo; da 7.7 em
diante, as que completam o mapa (`fluxo-app.md` §2), escritas na B2.

### 7.1 T-03 Minhas pendências

```
Minhas pendências                                   [filtro: tipo ▾]

VENCIDAS (1)
┌─────────────────────────────────────────────────────────────────┐
│ ⚠ Executar ação   AC-2026-0003 · Trocar o fornecedor da junta…   │
│                    NC-2026-0042        Vencido há 2 dias      →  │
└─────────────────────────────────────────────────────────────────┘
APROVAR (2)
┌─────────────────────────────────────────────────────────────────┐
│ ⧗ Aprovar         IV-2026-0007 · A junta resseca antes…       →  │
│ ⧗ Aprovar         NC-2026-0038 · Fechamento                   →  │
└─────────────────────────────────────────────────────────────────┘
TRIAGEM (1)
┌─────────────────────────────────────────────────────────────────┐
│ ◌ NC sem aprovador NC-2026-0045 · Rótulo ilegível   [Assumir] →  │
└─────────────────────────────────────────────────────────────────┘
```

Grupos na ordem: **Vencidas** → Aprovar → Corrigir → Verificar → Executar
→ Enviar para fechamento → Triagem → Menções → Rascunhos. "Assumir" na
triagem define a própria pessoa como aprovadora (da NC ou do filho sem
aprovador), sem precisar abrir o item.

### 7.2 T-04 Lista de NCs

```
Não Conformidades                                      [＋ Nova NC]
[🔍 código ou título      ] [Estado ▾] [Etapa ▾] [Setor ▾] [Mais filtros ▾]
Filtros ativos: Etapa: Em investigação ✕   Só as minhas ✕

 Código        Título                  Estado    Etapa              Setor     Detecção
 NC-2026-0045  Rótulo ilegível         ● Aberta  Aguardando classif. Expedição 22/09/2026
 NC-2026-0042  Vazamento na linha 3    ● Aberta  Em investigação ⚠  Produção  15/09/2026
 NC-2026-0038  Atraso na calibração    ⧗ Em apr. Aguardando aprov.  Metrologia 02/09/2026
                                                        [ Carregar mais ]
```

Paginação por "Carregar mais" (a API usa cursor, não páginas numeradas).

### 7.3 T-06 Detalhe da NC (computador)

```
NC-2026-0042 · Vazamento na linha 3              ● Aberta  🔍 Em investigação
                                                  Contenção em andamento
[ Enviar para fechamento (bloqueado ⓘ) ]  [ Salvar ]  [ Mais ▾ ]
┌──────────────────────────────────────────────┬─────────────────────────┐
│ DADOS                                   [✎]  │ CHECKLIST DE FECHAMENTO │
│ Descrição, requisito, processo, setor...     │ ✅ Classificação         │
│                                              │ ❌ Investigação → IV-7   │
│ CLASSIFICAÇÃO                  [+ Nova]      │ ❌ Contenção → CT-19     │
│  CL-2026-0011  Maior   ✓ Fechada             │ ❌ Riscos revisados      │
│ CONTENÇÃO                      [+ Nova]      │ ❌ Mudanças no SGQ       │
│  CT-2026-0019  Corrigido  ● Aberta           │ ✅ Aprovador definido    │
│ INVESTIGAÇÃO                   [+ Nova]      │─────────────────────────│
│  IV-2026-0007  A junta res…  ⧗ Em aprovação  │ ATRIBUIÇÕES             │
│ AÇÃO CORRETIVA                 [+ Nova]      │ Aprovador: Beltrana     │
│  (nenhuma ainda)                             │ Responsáveis: F, C, D   │
│ VERIFICAÇÃO                                  │ [+ Adicionar]           │
│  (nasce ao finalizar uma ação)               │─────────────────────────│
│                                              │ ANEXOS (3)   [+ Enviar] │
├──────────────────────────────────────────────┴─────────────────────────┤
│ FEED                                                                   │
│ 22/09 14:02  Fulana enviou IV-2026-0007 para aprovação                 │
│ 21/09 09:15  Fulana: @Beltrana pode revisar a causa raiz?              │
│ [ Escrever comentário… @ para mencionar, # para citar item ]           │
└────────────────────────────────────────────────────────────────────────┘
```

**No celular**, a coluna lateral desce para baixo dos filhos, na ordem:
checklist → atribuições → anexos → feed.

### 7.4 T-07 Ação Corretiva (exemplo de filho)

```
NC-2026-0042 › AC-2026-0003 · Trocar o fornecedor da junta…
● Aberta   ✓ Plano aprovado   Prazo: Vencido há 2 dias
[ Finalizar execução ]  [ Salvar ]  [ Mais ▾ ]

PLANO (aprovado — só leitura)
  Descrição · Prazo · Instruções de verificação
EXECUÇÃO
  Data de execução [ dd/mm/aaaa ]
  Evidência        [ texto                        ]
  Anexos           [ arraste fotos ou PDF aqui ]
─── atribuições · feed ───
```

### 7.5 T-07 Investigação A3 (só computador)

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

### 7.6 T-05 Nova NC (celular)

```
┌────────────────────────┐
│ ✕  Nova NC             │
├────────────────────────┤
│ Título                 │
│ [                    ] │
│ Descrição              │
│ [                    ] │
│ Origem        [      ▾]│
│ Setor         [      ▾]│
│ Detectada em  [hoje  ▾]│
│ Processo afetado  ...  │
│ Requisito violado ...  │
│ Cliente (opcional)     │
│ Responsáveis (opc.)    │
│ [📷 Tirar foto/anexar] │
├────────────────────────┤
│ [Salvar rascunho][Publicar]│
└────────────────────────┘
```

"Detectada em" já vem com **hoje**. O botão de anexo abre a câmera no
celular.

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

```
NC-2026-0042 › CL-2026-0011 · Maior                       ● Aberta
[ Enviar para aprovação (bloqueado ⓘ) ]  [ Salvar ]  [ Mais ▾ ]

CLASSIFICAÇÃO
  ( ) Maior     ( ) Menor
  Justificativa
  [ por que esta classificação                              ]
  Mínimo de 20 caracteres
─── atribuições · anexos · feed ───
```

Formulário curto. Só `APROVADOR` e `GERENTE` editam, publicam e enviam
(RN-20); para o `EDITOR`, a tela é só leitura e a barra de ações some.
**Não há Cancelar** (§7 do fluxo): quando a classificação muda, cria-se
outra.

**A conferir na C2** (PRD Q21 e Q22, propostas): ao escolher **Menor**,
entra uma seção **Abrangência** (as NCs dos últimos 12 meses, para marcar
as relacionadas, e a justificativa específica na 3ª ocorrência), e a
Classificação perde o portão: "Enviar para aprovação" vira **"Concluir
classificação"**, como na Verificação.

### 7.10 T-07 Contenção

```
NC-2026-0042 › CT-2026-0019 · Isolar o lote 42…           ● Aberta
[ Enviar para aprovação (bloqueado ⓘ) ]  [ Salvar ]  [ Mais ▾ ]

AÇÃO IMEDIATA
  Descrição
  [ o que foi feito para conter o problema                  ]
EXECUÇÃO
  Executada em  [ dd/mm/aaaa ]
  Disposição    [ Aceito · Corrigido · Anulado · Em análise ▾ ]
  Anexos        [ arraste fotos ou PDF aqui ]
─── atribuições · feed ───
```

Publicada só com a descrição (mínimo de 20 caracteres); a data e a
disposição vêm depois de executar. Sem elas, o "Enviar para aprovação"
mostra a lista do que falta (J3). **Fechada**, a tela mostra embaixo do
cabeçalho: "Não resolveu? Crie uma nova contenção na NC" (RN-42: a
contenção não se reabre). No celular, a barra de ações vai para o rodapé,
fixa, com a ação principal e o Salvar.

### 7.11 T-07 Verificação

```
NC-2026-0042 › VE-2026-0002 · da AC-2026-0003             ● Aberta
Prazo: Vence em 5 dias
[ Concluir verificação ]  [ Salvar ]  [ Mais ▾ ]

INSTRUÇÕES (do plano da AC-2026-0003 — só leitura)
  Conferir 3 lotes seguidos sem vazamento na linha 3...
RESULTADO
  ( ) Eficaz
  ( ) Parcialmente eficaz
  ( ) Não eficaz
  Conclusão           [ o que foi conferido e o que se viu    ]
  Verificada em       [ dd/mm/aaaa ]
  Anexos              [ arraste fotos ou PDF aqui ]
─── atribuições · feed ───
```

Nasce sozinha ao finalizar a execução da ação (J5), já aberta, nunca em
rascunho. O cabeçalho leva à ação de origem. "Concluir verificação" é só
do responsável com papel `APROVADOR` (§7 do fluxo) e abre o
`DialogoEfeito` com o efeito do resultado escolhido:

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

No front, o rótulo sai de **uma função só**: se os filhos ganharem título
(a avaliar antes da C0, plano), muda só ela.

---

## 11. Fora do MVP de UI

Personalização de colunas da lista · atalhos de teclado
avançados · impressão formatada da NC (relatório para auditoria) ·
internacionalização (só pt-BR).

---

## 12. Decisões tomadas

Com Matthew, em 2026-09-24 (além das da §1).

| # | Pergunta | Decisão |
|---|---|---|
| **U1** | Textos dos botões e das atribuições | **"Enviar para aprovação"** e **"Responsável"** na tela; código e banco mantêm os nomes atuais → §10.2 |
| **U2** | Navegação no celular | **Barra inferior**: Pendências, NCs, ＋ Nova NC, Menu → §6.1 |
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
