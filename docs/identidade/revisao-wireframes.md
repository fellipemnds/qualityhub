# Revisão dos wireframes (B2)

> Checklist para Matthew conferir no Figma, tela por tela (2026-10-21,
> feito na nuvem). Cada link abre o frame. Marque `[x]` no que estiver
> bom; no resto, uma frase do que mudar, e o Claude ajusta item por item.
> As regras de layout seguem a skill `design-taste-frontend` (telas de
> app); o conteúdo segue o `ui-ux.md` §7 e o `fluxo-app.md`.

Arquivo: https://www.figma.com/design/I84yUUH486vPHJ65Xtg08K (página
**Wireframes**; os tokens estão na página **Fundações**).

**Como o arquivo se organiza** (pedido de Matthew, 2026-10-22): a página
**Wireframes** guarda só as telas **decididas**, cada uma na sua seção.
Cada decisão ganha uma seção na página **Decisões (histórico)**, com as
variantes comparadas e, num quadro "Antes", a tela que foi substituída.

## 0. Antes das telas: as decisões

- [x] **(a) A navegação do celular** — **decidida em 2026-10-22**, com
  uma proposta de Matthew no lugar da original: a barra **flutuante**
  Pendências · NCs · **Eu**, o ＋ ao lado (variante A), só nas telas raiz;
  na tela Eu o ＋ sai e a barra cresce; o ＋ cria a coisa principal da
  tela; a tela **Eu** (T-13) com a Gestão por papel, e Relatórios e
  administração com versão de celular. Registrado no `ui-ux.md` §6.1
  (U2), no `fluxo-app.md` §1 e §2 e no plano (B2, item 7a).
  [Decisão (a) no Figma](https://www.figma.com/design/I84yUUH486vPHJ65Xtg08K?node-id=127-848)
  — o T-03 celular e a tela Eu (T-13) já estão na seção "NCs · T-03 e
  T-04"; falta a barra nova no T-04 celular e no frame dos componentes.
- [x] **(b) O Detalhe da NC no celular** — **decidida em 2026-10-22**,
  depois de comparar as abas, a página única (estilo Linear) e a
  proposta de Matthew: **quatro abas**, Resumo · Detalhes · Itens · Feed,
  e o título num **bloco escuro** no topo (estilo Fresha), com o estado e
  a pilha dos envolvidos em cima e a etapa embaixo; ao rolar, o bloco
  encolhe. No modo escuro, o bloco sobe um degrau (`fundo/destaque`, para
  a B3). Registrado no `ui-ux.md` §7.3, no `fluxo-app.md` (T-06 e J10) e
  no plano (B2, item 7b).
  [Decisão (b) no Figma](https://www.figma.com/design/I84yUUH486vPHJ65Xtg08K?node-id=141-894)
  — as quatro abas já estão na seção "NCs · T-05 e T-06".
- [x] **(c) A Investigação de quem preenche** — **decidida em
  2026-10-22: fazer.** É a tela mais usada da investigação, e só nela
  aparecem o Salvar, o Enviar para aprovação com a lista do que falta
  (RN-24) e o Cancelar (RN-50), que o G1 pede. O frame novo mostra a
  investigação aberta: o progresso no índice (✓ ◐ ○), os campos
  editáveis, a hipótese sem classificação e o plano da ação em aprovação.
  No frame do aprovador, saiu o "+ Nova ação corretiva": com a
  investigação em aprovação, a ação não pode nascer (RN-49).
  [Quem preenche](https://www.figma.com/design/I84yUUH486vPHJ65Xtg08K?node-id=156-1072)
  · [Aprovador](https://www.figma.com/design/I84yUUH486vPHJ65Xtg08K?node-id=102-579)
- [x] **(e) A navegação do computador** (pedido de Matthew, depois das
  quatro) — **decidida em 2026-10-22**: uma **doca flutuante embaixo, no
  centro**, como a barra do celular, com o Buscar em primeiro (abre uma
  janela de busca; Ctrl K também) e a pessoa no fim, cujo menu abre para
  cima (com a assinatura da empresa); toda tela deixa 96 px livres embaixo
  do conteúdo, para a doca não cobrir o fim; sem menu lateral nem barra de
  topo. Comparada com o trilho à esquerda (colado e flutuante, a
  recomendação do Claude) e com o trilho e uma barra fina no topo.
  **Aplicada** nas 16 telas de computador. Registrado no `ui-ux.md` §6.1,
  no `fluxo-app.md` §2.1 e no plano (B2, 7d; a busca por texto na C1 e na
  C4).
  [Decisão (e) no Figma](https://www.figma.com/design/I84yUUH486vPHJ65Xtg08K?node-id=170-274)
- [x] **(d) A borda dos campos** — **decidida em 2026-10-22: a A**, a
  borda inteira de 1 px em `borda/controle` (#8A8A8F no claro, 3,44:1 com
  o cartão; #68686D no escuro, 3,35:1), com o canto de 6 px
  (`raio/controle`) e o foco num anel de 2 px afastado 2 px. Comparada com
  o campo preenchido com a linha embaixo (B) e com a borda clara do
  shadcn (C, #D4D4D8, 1,48:1, que não passa a regra do `ui-ux.md` §9). A
  A já é quase o cinza mais claro que passa 3:1 no branco (o limite fica
  perto de #959595). Os componentes do Figma já estavam assim. Registrado
  no `ui-ux.md` §9.
  [Decisão (d) no Figma](https://www.figma.com/design/I84yUUH486vPHJ65Xtg08K?node-id=179-363)
- [x] **(f) A lista de NCs e os filtros** (achado de Matthew na revisão, a estreia da `/desenhar`) — **decidida em 2026-10-23: a A**, a tabela plana com uma pílula por coluna (o Qatalog) e, no celular, a linha rica com os filtros em pílulas que abrem uma folha (o Jira Cloud); as visões separadas dos filtros; o filtro ativo com o valor e o ✕; o agrupar por etapa (a B) como opção do computador; a busca visível que some ao rolar. Descartados: o quadro (a etapa é calculada, ninguém a arrasta), o "puxar para revelar" a busca (briga com o navegador) e o ＋ como busca (o mesmo botão mudaria de função). Registrado no `ui-ux.md` §7.2 e no `fluxo-app.md` (T-04 e L10).
  [Decisão (f) no Figma](https://www.figma.com/design/I84yUUH486vPHJ65Xtg08K?node-id=211-353)
- [x] **(g) O Detalhe da NC: as abas, o feed, os itens e a Atividade** (pedidos de Matthew na revisão) — **decidida em 2026-10-23**, pela `/desenhar`, com o Deel (as abas), o Linear e o incident.io (o feed) e o Jira (os itens): as abas iguais com o traço grosso; o feed em linha do tempo, os eventos com ícone e o antes → depois, os comentários em cartão com o Responder; os Itens da NC num cartão só, agrupados (os grupos fecham) ou não, em lista ou cartões, ordenados por estado ou criação, com o medidor em segmentos; o Envio depois dos Itens; a Atividade num botão da lateral que abre um painel que empurra a página e recolhe a lateral numa faixa de resumo; o checklist com ícones; as atribuições com tags; a classificação nos Dados; o nome do responsável na lista (as iniciais sozinhas são ambíguas). Descartados: o feed por cima da página, a lateral mantida com o painel aberto e só o avatar na tabela. Registrado no `ui-ux.md` §7.3 e no `fluxo-app.md` (T-06, L11 e L12).
  [Decisão (g) no Figma](https://www.figma.com/design/I84yUUH486vPHJ65Xtg08K?node-id=227-755)

## 1. Componentes

- [ ] [Os 16 componentes](https://www.figma.com/design/I84yUUH486vPHJ65Xtg08K?node-id=95-62), cada um no seu frame: a **doca** do computador (`Shell/Doca`, decisão (e), com uma variante por item ativo), o menu da pessoa, as barras do celular (o ＋ no centro), os botões, os campos, estado/etapa/prazo e a linha de pendência.
  **Achados de Claude (2026-10-23).** Os 1 a 3 (estrutura) foram **feitos** no mesmo dia (plano, B2, item 8); os 4 a 6 (acabamento) vão para a B3, nos átomos (plano, B3, itens 3, 4 e 6):
  1. ✅ A barra de baixo do celular ainda é a antiga (Pendências · ＋ Nova NC · NCs); a da decisão (a) é a pílula Pendências · NCs · Eu, com o ＋ ao lado (o pendente do item 7a).
  2. ✅ A barra de cima do celular (raiz) ainda tem o avatar, que a tela Eu substituiu: fica só o título.
  3. ✅ O menu da pessoa: abre **para cima**, da doca (decisão (e)), com o nome, o setor e o papel em cima e a assinatura da empresa embaixo; no celular, ele não existe mais. O texto do frame diz o contrário.
  4. A doca é o único frame sem título e sem a frase do uso (e a regra: os itens de administração só para quem tem o papel).
  5. Estado, etapa e prazo: o ⚠ está amarelo num frame que diz "tudo cinza"; o ícone da etapa é um quadrado que parece uma caixa de marcar.
  6. Campos: falta o campo com erro (o texto promete) e o anel de foco da decisão (d).

  **De Matthew (2026-10-23):** a pílula das Pendências apertada na barra com o ＋ (✅ no item 8: as abas dividem a largura por igual); o contador das Pendências também no celular (✅ no item 8, o mesmo selo da doca); os filtros da T-04 no celular (para a `/desenhar`, na seção 3); e os chevrons de texto destoando dos ícones (são letras da Figtree; vão para o átomo Ícone, na B3).

## 2. Acesso

- [x] [T-01 Login · computador](https://www.figma.com/design/I84yUUH486vPHJ65Xtg08K?node-id=98-3): "Manter conectado", a ajuda do convite no lugar de "esqueci minha senha", a assinatura da empresa embaixo.
- [x] [T-01 Login · celular](https://www.figma.com/design/I84yUUH486vPHJ65Xtg08K?node-id=98-25)
- [x] [T-02 Definir senha · computador](https://www.figma.com/design/I84yUUH486vPHJ65Xtg08K?node-id=98-47): sem o nome da pessoa (decisão de 2026-10-21).
- [x] [T-02 Definir senha · celular](https://www.figma.com/design/I84yUUH486vPHJ65Xtg08K?node-id=98-66)

  **Revista em 2026-10-23** (plano, B2, item 9): a estrutura bate com o `ui-ux.md` §7.7 e §7.8, e o código cumpre o que as telas prometem (o `manterConectado`, a senha de 12 caracteres e até 72 bytes, o convite de 72 h). Duas faltas corrigidas pelo componente novo **`Campo/Senha`**: o botão de mostrar a senha nos 3 campos e a regra dos 12 caracteres como ajuda fixa embaixo do campo (o placeholder some ao digitar). Matthew quer reavaliar o ícone do olho, que é o padrão do Android (para o átomo Ícone, na B3).

## 3. NCs

- [x] [T-03 Minhas pendências · computador](https://www.figma.com/design/I84yUUH486vPHJ65Xtg08K?node-id=99-31): os grupos Vencidas, Aprovar e Triagem, com as 4 pendências que batem com o contador do menu; o "Assumir" na triagem.
- [x] [T-03 Minhas pendências · celular](https://www.figma.com/design/I84yUUH486vPHJ65Xtg08K?node-id=158-1128): com a barra nova (decisão (a)).
- [x] [T-13 Eu · celular](https://www.figma.com/design/I84yUUH486vPHJ65Xtg08K?node-id=158-1180): a tela nova da decisão (a).
- [x] [T-04 Lista de NCs · computador](https://www.figma.com/design/I84yUUH486vPHJ65Xtg08K?node-id=217-2063): as abas Todas · Minhas · Vencidas, os filtros, a tabela e o "Carregar mais".
- [x] [T-04 Lista de NCs · celular](https://www.figma.com/design/I84yUUH486vPHJ65Xtg08K?node-id=217-2192): a linha rica, e a [folha da Etapa](https://www.figma.com/design/I84yUUH486vPHJ65Xtg08K?node-id=217-2257) (decisão (f)).

  **Revista em 2026-10-23** (plano, B2, item 10): a T-13 bate com o `ui-ux.md` §6.1. A T-03 celular não tinha o filtro por tipo (posto); a T-04 virou a decisão (f), com a frase de estado e o Carregar mais no celular, que faltavam.
- [x] [T-05 Nova NC · computador](https://www.figma.com/design/I84yUUH486vPHJ65Xtg08K?node-id=100-192): os campos em duas colunas, os responsáveis e os anexos ao lado.
- [x] [T-05 Nova NC · celular](https://www.figma.com/design/I84yUUH486vPHJ65Xtg08K?node-id=100-289): "Detectada em" já com hoje, a barra de ações fixa embaixo.
- [x] [T-06 Detalhe da NC · computador](https://www.figma.com/design/I84yUUH486vPHJ65Xtg08K?node-id=100-338): os dados, uma seção por filho, o feed; o checklist, as atribuições e os anexos na lateral.
- [x] T-06 Detalhe da NC · celular, as quatro abas da decisão (b): [Resumo](https://www.figma.com/design/I84yUUH486vPHJ65Xtg08K?node-id=158-1248) · [Detalhes](https://www.figma.com/design/I84yUUH486vPHJ65Xtg08K?node-id=158-1320) · [Itens](https://www.figma.com/design/I84yUUH486vPHJ65Xtg08K?node-id=158-1438) · [Feed](https://www.figma.com/design/I84yUUH486vPHJ65Xtg08K?node-id=158-1519)

  **Revista em 2026-10-23** (plano, B2, item 11): na T-05, os grupos com nome, a ajuda fixa e os responsáveis no celular; na T-06, o + Nova da Ação Corretiva tirado (RN-49), os dados alinhados entre os tamanhos, o envio e o + Anexar no computador, o bloco escuro no computador, e a decisão (g). Também: a [Atividade aberta](https://www.figma.com/design/I84yUUH486vPHJ65Xtg08K?node-id=246-2161), os [itens em cartões](https://www.figma.com/design/I84yUUH486vPHJ65Xtg08K?node-id=237-3037) e os [itens sem agrupar](https://www.figma.com/design/I84yUUH486vPHJ65Xtg08K?node-id=238-1925).

## 4. Itens filhos (T-07)

- [ ] [Classificação · computador](https://www.figma.com/design/I84yUUH486vPHJ65Xtg08K?node-id=101-343): Maior e Menor como opções; a nota da Q21 e da Q22 para a C2.
- [ ] [Contenção · computador](https://www.figma.com/design/I84yUUH486vPHJ65Xtg08K?node-id=101-439): o botão bloqueado com a lista do que falta aberta.
- [ ] [Verificação · computador](https://www.figma.com/design/I84yUUH486vPHJ65Xtg08K?node-id=101-540) e o [diálogo do efeito](https://www.figma.com/design/I84yUUH486vPHJ65Xtg08K?node-id=101-652) ([no celular](https://www.figma.com/design/I84yUUH486vPHJ65Xtg08K?node-id=164-1105), uma folha que sobe do rodapé): as instruções só de leitura e o "Não eficaz" explicado antes de concluir.
- [ ] [Ação Corretiva · computador](https://www.figma.com/design/I84yUUH486vPHJ65Xtg08K?node-id=102-476): o plano aprovado só de leitura, o selo e o prazo vencido; a execução editável.
- [ ] Investigação A3 · computador, nas duas visões da decisão (c): [aprovador](https://www.figma.com/design/I84yUUH486vPHJ65Xtg08K?node-id=102-579) (em aprovação, só leitura) e [quem preenche](https://www.figma.com/design/I84yUUH486vPHJ65Xtg08K?node-id=156-1072) (aberta): o índice das 10 etapas, o Ishikawa, as hipóteses, os 5 porquês e as contramedidas.
- [ ] [Classificação · celular](https://www.figma.com/design/I84yUUH486vPHJ65Xtg08K?node-id=102-763)
- [ ] [Contenção · celular](https://www.figma.com/design/I84yUUH486vPHJ65Xtg08K?node-id=102-798)
- [ ] [Ação Corretiva · celular](https://www.figma.com/design/I84yUUH486vPHJ65Xtg08K?node-id=102-843)
- [ ] [Verificação · celular](https://www.figma.com/design/I84yUUH486vPHJ65Xtg08K?node-id=102-880)

## 5. Gestão e administração

Cada tela tem a versão de celular ao lado (pedido de Matthew, 2026-10-22): telas internas, abertas pela tela Eu, com a seta de voltar e sem a barra de abas; as tabelas viram listas de cartões e a ação principal vai para a barra fixa no rodapé. [T-08](https://www.figma.com/design/I84yUUH486vPHJ65Xtg08K?node-id=162-903) · [T-09](https://www.figma.com/design/I84yUUH486vPHJ65Xtg08K?node-id=162-1105) · [T-10](https://www.figma.com/design/I84yUUH486vPHJ65Xtg08K?node-id=163-927) · [T-11](https://www.figma.com/design/I84yUUH486vPHJ65Xtg08K?node-id=163-1059) · [convite](https://www.figma.com/design/I84yUUH486vPHJ65Xtg08K?node-id=163-1174) · [T-12](https://www.figma.com/design/I84yUUH486vPHJ65Xtg08K?node-id=164-970).

- [ ] [T-08 Relatórios](https://www.figma.com/design/I84yUUH486vPHJ65Xtg08K?node-id=103-620): os 4 números num container só, as NCs abertas por setor, o tempo médio (sem cor), as atrasadas, a eficácia. Os números batem entre si (38 abertas; 18 + 3 + 1 = 22 verificações).
- [ ] [T-09 Usuários](https://www.figma.com/design/I84yUUH486vPHJ65Xtg08K?node-id=103-806)
- [ ] [T-10 Detalhe do usuário](https://www.figma.com/design/I84yUUH486vPHJ65Xtg08K?node-id=103-948): a recusa da RN-43 com os 3 itens a reatribuir; os papéis.
- [ ] [T-11 Novo usuário](https://www.figma.com/design/I84yUUH486vPHJ65Xtg08K?node-id=103-1043) e o [convite gerado](https://www.figma.com/design/I84yUUH486vPHJ65Xtg08K?node-id=103-1124): o link aparece só uma vez.
- [ ] [T-12 Setores](https://www.figma.com/design/I84yUUH486vPHJ65Xtg08K?node-id=103-1175): a recusa da RN-44 e o Reativar no setor desativado.

## 6. O G1 (o gate dos wireframes)

O G1 (`ui-ux.md` §2) pede duas coisas: **toda tela do mapa tem wireframe**
e **toda ação do `fluxo-app.md` §7 é alcançável**. As duas tabelas abaixo
são preenchidas seção por seção (plano, B2, itens 9 a 14); o G1 fecha
quando não sobrar linha com "—". Criadas em 2026-10-23.

### 6.1 As telas do mapa (`fluxo-app.md` §2)

| Tela | Computador | Celular | Conferida |
|---|---|---|---|
| T-01 Login | [frame](https://www.figma.com/design/I84yUUH486vPHJ65Xtg08K?node-id=98-3) | [frame](https://www.figma.com/design/I84yUUH486vPHJ65Xtg08K?node-id=98-25) | item 9 |
| T-02 Definir senha | [frame](https://www.figma.com/design/I84yUUH486vPHJ65Xtg08K?node-id=98-47) | [frame](https://www.figma.com/design/I84yUUH486vPHJ65Xtg08K?node-id=98-66) | item 9 |
| T-03 Minhas pendências | [frame](https://www.figma.com/design/I84yUUH486vPHJ65Xtg08K?node-id=99-31) | [frame](https://www.figma.com/design/I84yUUH486vPHJ65Xtg08K?node-id=158-1128) | item 10 |
| T-04 Lista de NCs | [frame](https://www.figma.com/design/I84yUUH486vPHJ65Xtg08K?node-id=217-2063) | [frame](https://www.figma.com/design/I84yUUH486vPHJ65Xtg08K?node-id=217-2192) | item 10 |
| T-05 Nova NC | [frame](https://www.figma.com/design/I84yUUH486vPHJ65Xtg08K?node-id=100-192) | [frame](https://www.figma.com/design/I84yUUH486vPHJ65Xtg08K?node-id=100-289) | item 11 |
| T-06 Detalhe da NC | [frame](https://www.figma.com/design/I84yUUH486vPHJ65Xtg08K?node-id=100-338) | [as 4 abas](https://www.figma.com/design/I84yUUH486vPHJ65Xtg08K?node-id=158-1248) | item 11 |
| T-07 Itens filhos (5 tipos) | — | — | — |
| T-08 Relatórios | — | — | — |
| T-09 Usuários | — | — | — |
| T-10 Detalhe do usuário | — | — | — |
| T-11 Novo usuário e convite | — | — | — |
| T-12 Setores | — | — | — |
| T-13 Eu | (só no celular) | [frame](https://www.figma.com/design/I84yUUH486vPHJ65Xtg08K?node-id=158-1180) | item 10 |

### 6.2 As ações (`fluxo-app.md` §7)

| Ação | Estado | Tipos | Onde aparece |
|---|---|---|---|
| Salvar | `RASCUNHO`, `ABERTO` | Todos (a Verificação nunca é rascunho) | NC: T-05 ("Salvar rascunho"), T-06 |
| Publicar | `RASCUNHO` | Todos | NC: T-05 |
| Excluir rascunho | `RASCUNHO` | Todos | — |
| Submeter ("Submeter para fechamento" na NC) | `ABERTO` | NC, Classificação, Contenção, Investigação | NC: T-06 ("Enviar para fechamento", bloqueado com a lista do que falta) |
| Submeter plano | `ABERTO` | Ação Corretiva, antes do plano aprovado | — |
| Finalizar execução | `ABERTO` | Ação Corretiva, depois do plano aprovado | — |
| Concluir | `ABERTO` | Verificação | — |
| Cancelar | `ABERTO`, `EM_APROVACAO` | Todos, menos a Classificação | — |
| Aprovar · Reprovar | `EM_APROVACAO` | Todos com portão | — |
| Retirar da aprovação | `EM_APROVACAO` | Todos com portão (RN-48) | — |
| Reabrir | `FECHADO` | Só a NC (RN-42) | — |
| Comentar | Qualquer | Todos | NC: T-06 (o painel Atividade; a aba Feed no celular) |
| Anexar | `RASCUNHO`, `ABERTO` | Todos | NC: T-05, T-06 ("+ Anexar") |

### 6.3 O que ainda não está desenhado

- [x] As versões de celular de T-08 a T-12, com o convite e o diálogo do efeito (feitas em 2026-10-22, §5). Falta a barra nova no T-04 celular e no frame dos componentes (plano B2, item 7a).

- [ ] As ações dentro do "Mais": Cancelar, Retirar da aprovação, Reabrir e Excluir rascunho (`fluxo-app.md` §7).
- [ ] Os estados da tela: vazio, carregando, erro e sem permissão (`fluxo-app.md` §8). São do G4, na B3.
- [ ] O modo escuro nas telas: chega quando elas forem refeitas com os componentes ligados aos tokens (a página Fundações já mostra o escuro).
