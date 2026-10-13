# Marca — Dusk & Dawn

> O brand brief da plataforma: uma página, para toda decisão visual
> voltar a ela. Saiu da sessão 1 da fase B1 (2026-10-13), com a estrutura
> do livro *Designing Brand Identity* (Alina Wheeler; brand brief,
> p. 146–147). Os valores exatos (cores, fonte, logo) vêm nas próximas
> sessões e terminam no `DESIGN.md` da B3. Figma: https://www.figma.com/design/t0wty21KOea7v0juDLcxGG

## Propósito

A Dusk & Dawn leva o trabalho do dia a dia das planilhas e e-mails para
uma plataforma digital à altura de uma empresa de tecnologia: do começo
ao fim do dia, nada se perde, cada um sabe o que é seu, e a gestão
enxerga o todo.

## Público

- **Principal:** o pessoal de escritório, no computador.
- **Também:** quem está no chão de fábrica, pelo celular, registrando na
  hora. A face Dawn precisa funcionar bem para essa pessoa.

## A grande ideia: o dia inteiro, em duas luzes

Uma plataforma, um login, **duas faces divididas por pessoa** (não por
módulo: o módulo de NC tem as duas).

| | **Dawn** — o colaborador | **Dusk** — a gestão |
|---|---|---|
| O momento | Onde o dia começa | A visão do dia que passou |
| O que faz | Pendências, abrir uma NC ou uma solicitação, fazer um treinamento | Aprovar, relatórios, indicadores, administração |
| A luz | **Etérea e azulada**: a hora azul antes do sol | **Quente**: o dourado do pôr do sol |

As duas faces têm a mesma estrutura, os mesmos componentes e **modo claro
e escuro**. A pessoa sabe em que face está sem sentir que trocou de
sistema.

## Personalidade

Cada palavra exclui alguma coisa; é isso que a torna útil para decidir.

| Traço | O que é | O que descarta | Como aparece |
|---|---|---|---|
| **Calma** | Nada grita, nem o que está atrasado | Vermelho e alerta em tudo | O atraso aparece com texto e ícone, num tom firme, não como alarme |
| **Precisa** | Cada coisa no lugar | O visual "solto" | Alinhamento, espaçamento constante, números e datas exatos |
| **Confiável** | O que está na tela é verdade, com rastro | Mostrar o que não é real | O estado na tela é sempre o do banco; quem fez o quê, quando |
| **Humana** | Quem está ali são pessoas, não números | O "sistema corporativo" frio | Avatares, nomes, textos em linguagem de gente |
| **Luminosa** | A clareza do amanhecer: o novo jeito de trabalhar | O pesado e o escuro sem motivo | Superfícies arejadas, a luz como tema, inclusive no modo escuro |

## Direção visual

- **Base:** sóbria e precisa, na linha do **Linear**. "Comportada".
- **Simples, como regra:** uma ação principal por tela; nada sem função.
- **Personalidade em pontos pequenos:** toques suaves de cor, avatares
  expressivos gerados pelo nome (no estilo do **Blobatar**) e
  **microinterações** sutis, de 150 a 250 ms, sempre com uma função e
  desligadas quando o sistema pede para reduzir o movimento.
- **Contraste:** 4,5:1 para texto nas quatro combinações (2 faces × 2
  modos).

## Paleta (sessão 2)

**A face é a cor da luz, não da tinta.** As superfícies são neutras nas duas
faces; a face aparece só como luz (o brilho no topo da tela, a borda da
seleção, o link e o foco), e a cor forte é informação (o ícone do estado,
sempre ao lado do rótulo). O botão principal é quase preto no claro e quase
branco no escuro (`ui-ux.md` §3.1). Referências: Linear (a profundidade
sutil, a cor em doses pequenas), um app de finanças em modo escuro (a luz
azul no topo), Q2 Planning e Flowio (a luz ambiente no claro).

| Token | Claro | Escuro |
|---|---|---|
| `--background` · fundo | `#F7F7F8` | `#09090B` |
| `--card` | `#FFFFFF` | `#131316` |
| `--sidebar` · lateral | `#FBFBFC` | `#0E0E11` |
| `--border` | `#E6E6EA` | `#25252A` |
| `--foreground` · texto | `#121214` | `#ECECEF` |
| `--muted-foreground` · texto de apoio | `#62626B` | `#9C9CA5` |
| `--primary` / `--primary-foreground` · botão principal | `#121214` / `#FFFFFF` | `#ECECEF` / `#09090B` |

| A face | Dawn claro | Dawn escuro | Dusk claro | Dusk escuro |
|---|---|---|---|---|
| `--destaque` (link, foco) | `#2F5BD3` | `#93B2FF` | `#B0501A` | `#FFAE78` |
| `--brilho` (seleção) | `#7FA6FF` | `#3F72FF` | `#FF9B5E` | `#FF7F3A` |
| `--luz-1` / `-2` / `-3` | `#8EB4FF` `#C9B8FF` `#9FE3F0` | `#2F63FF` `#6A4DFF` `#1FB5D6` | `#FFB27A` `#FF8F8F` `#FFD98A` | `#FF7A2F` `#E8456B` `#FFB547` |

| Estado (ícone) | Claro | Escuro |
|---|---|---|
| Rascunho | `#6B6B75` | `#A1A1AA` |
| Aberta | `#2E6FE0` | `#6AA6FF` |
| Em aprovação | `#7C4FE0` | `#AE92FF` |
| Fechada | `#16883F` | `#4CD486` |
| Vence em breve | `#975700` | `#F5B83D` |
| Vencida | `#D12E2E` | `#FF7B73` |

Contraste conferido em 2026-10-13: texto ≥ 4,5:1 e ícone ≥ 3:1 nas quatro
combinações (`docs/identidade/paleta.html`, gerada sem script). No Figma
(arquivo "Dusk & Dawn — Identidade", time Work), as cores são *Variables*
na coleção "Tema", com os modos Dawn · Claro, Dawn · Escuro, Dusk · Claro e
Dusk · Escuro, e o nome do CSS em cada uma.

### O que evitar (a "cara de IA")

- Halo colorido em volta das coisas (sombra brilhante sem deslocamento): a
  seleção é uma **borda sólida** na cor do brilho.
- Gradiente atrás de texto ou de tabela: a luz fica **só no topo**, como
  ambiente, e se dissolve antes do conteúdo.
- O orbe com gradiente girando como enfeite: o "sol" da marca aparece em
  poucos lugares (login, tela vazia), e o desenho dele é da sessão 3.
- Pintar a superfície com a cor da face: o fundo é sempre neutro.

## Arquitetura

**Uma marca só** (o "branded house" do livro, p. 18–19): os módulos levam
o nome da plataforma e uma descrição, como "Dusk & Dawn · Qualidade". O
logo não pode ser "de NC": ele precisa servir aos módulos que virão.

A empresa aparece só como **assinatura**, com o logo dela monocromático
(login, rodapé do menu, e-mail de convite, relatórios exportados). A
autoria fica na tela "Sobre".

## Como escolher entre as direções

Os ideais do livro (p. 26–45) que mais pesam aqui:

- **Coerência:** as duas faces parecem uma plataforma só?
- **Flexibilidade:** aguenta módulos que ainda não existem?
- **Longevidade:** continua bonita daqui a cinco anos, sem depender de moda?

## Fora do escopo

Ilustrações grandes e animações chamativas · uma cor por módulo (até
existirem outros módulos) · foto de perfil obrigatória · o detalhe das animações (B3) · instalar qualquer coisa
(fase C).
