# QualityHub — UI/UX

> **O que é este documento:** como o QualityHub **parece** e **se comporta
> ao toque** — fundações visuais, componentes, layout das telas, padrões
> de interação, acessibilidade e textos. *Quais* telas existem e o que
> fazem está em `docs/fluxo-app.md`; as regras de negócio, em
> `docs/prd.md`.
>
> **Status:** v1 (2026-09-24). Decisões na §1 e na §12. Valores de cor
> e fonte são provisórios até a identidade visual ser definida.

---

## 1. Decisões

Com Matthew, em 2026-09-24:

| Decisão | Escolha | Observação |
|---|---|---|
| Biblioteca de componentes | **shadcn/ui** (Radix + Tailwind) | **Diverge do `arquitetura.md`** (ADR-28 recomendava Mantine). Os componentes são copiados para dentro do projeto e viram código nosso |
| Identidade visual | **Decidir depois** | Este documento define os tokens por **função** (`--perigo`, `--destaque`...); os valores são provisórios até a identidade chegar |
| Processo de design | **Documento → Figma → protótipo HTML** | Wireframes e mockups no Figma; protótipo HTML clicável quando o design fechar, para o teste do gate G3 |
| Tema | **Só claro no MVP** | Cores em tokens, então o escuro entra depois sem refazer telas |

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
da paleta padrão do Tailwind) e serão ajustados quando a identidade
visual chegar. O contraste é conferido no G2.

**Base** (mapeiam direto nas variáveis do shadcn/ui):

| Token | Uso | Provisório |
|---|---|---|
| `--background` | Fundo da página | branco |
| `--foreground` | Texto principal | `slate-900` |
| `--muted` / `--muted-foreground` | Fundos secundários / texto de apoio | `slate-100` / `slate-600` |
| `--border` | Bordas e divisórias | `slate-200` |
| `--primary` | **Destaque**: ação principal de cada tela | `slate-900` (até a marca definir) |
| `--destructive` | Ações destrutivas (excluir, cancelar, reprovar) | `red-600` |
| `--ring` | Contorno de foco do teclado | `blue-600` |

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

- **Fonte:** **decidida junto com a identidade visual** (U3). Até lá,
  **Inter** como provisória. Seja qual for, é servida pelo **nosso
  próprio servidor**, porque o sistema roda *on-premise* e pode não ter
  acesso a serviços externos de fonte. Requisito para a escolha final:
  ter números tabulares (alinhados em coluna).
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
| Em plano de ação | `clipboard-list` |
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
frames no Figma no G1.

### 7.1 T-03 Minhas pendências

```
Minhas pendências                                   [filtro: tipo ▾]

VENCIDAS (1)
┌─────────────────────────────────────────────────────────────────┐
│ ⚠ Executar ação   AC-2026-0003 · Troca do fornecedor de junta    │
│                    NC-2026-0042        Vencido há 2 dias      →  │
└─────────────────────────────────────────────────────────────────┘
APROVAR (2)
┌─────────────────────────────────────────────────────────────────┐
│ ⧗ Aprovar         IV-2026-0007 · Vazamento na linha 3         →  │
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
│ CLASSIFICAÇÃO                  [+ Nova]      │ ❌ Plano de ação         │
│  CL-2026-0011  Maior   ✓ Fechada             │ ❌ Riscos revisados      │
│ CONTENÇÃO                      [+ Nova]      │ ❌ Mudanças no SGQ       │
│  CT-2026-0019  Corrigido  ● Aberta           │ ✅ Aprovador definido    │
│ INVESTIGAÇÃO                   [+ Nova]      │─────────────────────────│
│  IV-2026-0007  Vazamento...  ⧗ Em aprovação  │ ATRIBUIÇÕES             │
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
NC-2026-0042 › AC-2026-0003 · Troca do fornecedor de junta
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
NC-2026-0042 › IV-2026-0007 · Vazamento na linha 3        ● Aberta
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

---

## 11. Fora do MVP de UI

Tema escuro · personalização de colunas da lista · atalhos de teclado
avançados · impressão formatada da NC (relatório para auditoria) ·
internacionalização (só pt-BR).

---

## 12. Decisões tomadas

Com Matthew, em 2026-09-24 (além das da §1).

| # | Pergunta | Decisão |
|---|---|---|
| **U1** | Textos dos botões e das atribuições | **"Enviar para aprovação"** e **"Responsável"** na tela; código e banco mantêm os nomes atuais → §10.2 |
| **U2** | Navegação no celular | **Barra inferior**: Pendências, NCs, ＋ Nova NC, Menu → §6.1 |
| **U3** | Fonte | **Decidida com a identidade visual**; Inter como provisória; sempre servida pelo nosso servidor → §3.2 |
| **U4** | Salvar | **Botão explícito** + cópia local no navegador → §8.1 |
| **U5** | Quem monta o Figma | **Claude cria os wireframes** (a partir da §7) no Figma de Matthew; **Matthew faz os mockups** |

**Pendente fora deste documento:** identidade visual (cores da marca,
logo, fonte) — quando chegar, atualiza os valores da §3 sem mudar os
nomes dos tokens.

---

## Histórico

| Data | Mudança |
|---|---|
| 2026-09-24 | v1 — decisões iniciais e U1–U5 |
| 2026-09-24 | v1.1 — revisão cruzada: wireframes com os termos do glossário (U1), prefixos reais dos códigos, aprovador no checklist, triagem inclui filhos |
