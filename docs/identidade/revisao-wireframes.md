# Revisão dos wireframes (B2)

> Checklist para Matthew conferir no Figma, tela por tela (2026-10-21,
> feito na nuvem). Cada link abre o frame. Marque `[x]` no que estiver
> bom; no resto, uma frase do que mudar, e o Claude ajusta item por item.
> As regras de layout seguem a skill `design-taste-frontend` (telas de
> app); o conteúdo segue o `ui-ux.md` §7 e o `fluxo-app.md`.

Arquivo: https://www.figma.com/design/I84yUUH486vPHJ65Xtg08K (página
**Wireframes**; os tokens estão na página **Fundações**).

## 0. Antes das telas: quatro decisões

- [x] **(a) A navegação do celular** — **decidida em 2026-10-22**, com
  uma proposta de Matthew no lugar da original: a barra **flutuante**
  Pendências · NCs · **Eu**, o ＋ ao lado (variante A), só nas telas raiz;
  na tela Eu o ＋ sai e a barra cresce; o ＋ cria a coisa principal da
  tela; a tela **Eu** (T-13) com a Gestão por papel, e Relatórios e
  administração com versão de celular. Registrado no `ui-ux.md` §6.1
  (U2), no `fluxo-app.md` §1 e §2 e no plano (B2, item 7a).
  [Decisão (a) no Figma](https://www.figma.com/design/I84yUUH486vPHJ65Xtg08K?node-id=127-848)
  — falta aplicar a barra nova no T-03 e no T-04 celular e no frame
  dos componentes.
- [x] **(b) O Detalhe da NC no celular** — **decidida em 2026-10-22**,
  depois de comparar as abas, a página única (estilo Linear) e a
  proposta de Matthew: **quatro abas**, Resumo · Detalhes · Itens · Feed,
  e o título num **bloco escuro** no topo (estilo Fresha), com o estado e
  a pilha dos envolvidos em cima e a etapa embaixo; ao rolar, o bloco
  encolhe. No modo escuro, o bloco sobe um degrau (`fundo/destaque`, para
  a B3). Registrado no `ui-ux.md` §7.3, no `fluxo-app.md` (T-06 e J10) e
  no plano (B2, item 7b).
  [Decisão (b) no Figma](https://www.figma.com/design/I84yUUH486vPHJ65Xtg08K?node-id=141-894)
  — falta trocar o frame T-06 celular pela versão decidida.
- [ ] **(c) A Investigação pela visão do aprovador** (Em aprovação, com
  Aprovar e Reprovar). Falta a de quem preenche: fazer também?
- [ ] **(d) A borda dos campos** (`borda/controle`, `#8A8A8F` no claro):
  mais escura que as outras bordas, porque a regra de acessibilidade do
  projeto pede 3:1 (`ui-ux.md` §9). [Fundações](https://www.figma.com/design/I84yUUH486vPHJ65Xtg08K?node-id=105-45)

## 1. Componentes

- [ ] [Os 16 componentes](https://www.figma.com/design/I84yUUH486vPHJ65Xtg08K?node-id=95-62), cada um no seu frame: o menu lateral (grupos em letra normal, o ativo só com a pílula cinza), o menu da pessoa, as barras do celular (o ＋ no centro), os botões, os campos, estado/etapa/prazo e a linha de pendência.

## 2. Acesso

- [ ] [T-01 Login · computador](https://www.figma.com/design/I84yUUH486vPHJ65Xtg08K?node-id=98-3): "Manter conectado", a ajuda do convite no lugar de "esqueci minha senha", a assinatura da empresa embaixo.
- [ ] [T-01 Login · celular](https://www.figma.com/design/I84yUUH486vPHJ65Xtg08K?node-id=98-25)
- [ ] [T-02 Definir senha · computador](https://www.figma.com/design/I84yUUH486vPHJ65Xtg08K?node-id=98-47): sem o nome da pessoa (decisão de 2026-10-21).
- [ ] [T-02 Definir senha · celular](https://www.figma.com/design/I84yUUH486vPHJ65Xtg08K?node-id=98-66)

## 3. NCs

- [ ] [T-03 Minhas pendências · computador](https://www.figma.com/design/I84yUUH486vPHJ65Xtg08K?node-id=99-31): os grupos Vencidas, Aprovar e Triagem, com as 4 pendências que batem com o contador do menu; o "Assumir" na triagem.
- [ ] [T-03 Minhas pendências · celular](https://www.figma.com/design/I84yUUH486vPHJ65Xtg08K?node-id=99-132)
- [ ] [T-04 Lista de NCs · computador](https://www.figma.com/design/I84yUUH486vPHJ65Xtg08K?node-id=99-189): as abas Todas · Minhas · Vencidas, os filtros, a tabela e o "Carregar mais".
- [ ] [T-04 Lista de NCs · celular](https://www.figma.com/design/I84yUUH486vPHJ65Xtg08K?node-id=99-373): a lista vira cartões.
- [ ] [T-05 Nova NC · computador](https://www.figma.com/design/I84yUUH486vPHJ65Xtg08K?node-id=100-192): os campos em duas colunas, os responsáveis e os anexos ao lado.
- [ ] [T-05 Nova NC · celular](https://www.figma.com/design/I84yUUH486vPHJ65Xtg08K?node-id=100-289): "Detectada em" já com hoje, a barra de ações fixa embaixo.
- [ ] [T-06 Detalhe da NC · computador](https://www.figma.com/design/I84yUUH486vPHJ65Xtg08K?node-id=100-338): os dados, uma seção por filho, o feed; o checklist, as atribuições e os anexos na lateral.
- [ ] [T-06 Detalhe da NC · celular](https://www.figma.com/design/I84yUUH486vPHJ65Xtg08K?node-id=100-517)

## 4. Itens filhos (T-07)

- [ ] [Classificação · computador](https://www.figma.com/design/I84yUUH486vPHJ65Xtg08K?node-id=101-343): Maior e Menor como opções; a nota da Q21 e da Q22 para a C2.
- [ ] [Contenção · computador](https://www.figma.com/design/I84yUUH486vPHJ65Xtg08K?node-id=101-439): o botão bloqueado com a lista do que falta aberta.
- [ ] [Verificação · computador](https://www.figma.com/design/I84yUUH486vPHJ65Xtg08K?node-id=101-540) e o [diálogo do efeito](https://www.figma.com/design/I84yUUH486vPHJ65Xtg08K?node-id=101-652): as instruções só de leitura e o "Não eficaz" explicado antes de concluir.
- [ ] [Ação Corretiva · computador](https://www.figma.com/design/I84yUUH486vPHJ65Xtg08K?node-id=102-476): o plano aprovado só de leitura, o selo e o prazo vencido; a execução editável.
- [ ] [Investigação A3 · computador](https://www.figma.com/design/I84yUUH486vPHJ65Xtg08K?node-id=102-579): o índice das 10 etapas, o Ishikawa, as hipóteses, os 5 porquês e as contramedidas.
- [ ] [Classificação · celular](https://www.figma.com/design/I84yUUH486vPHJ65Xtg08K?node-id=102-763)
- [ ] [Contenção · celular](https://www.figma.com/design/I84yUUH486vPHJ65Xtg08K?node-id=102-798)
- [ ] [Ação Corretiva · celular](https://www.figma.com/design/I84yUUH486vPHJ65Xtg08K?node-id=102-843)
- [ ] [Verificação · celular](https://www.figma.com/design/I84yUUH486vPHJ65Xtg08K?node-id=102-880)

## 5. Gestão e administração

- [ ] [T-08 Relatórios](https://www.figma.com/design/I84yUUH486vPHJ65Xtg08K?node-id=103-620): os 4 números num container só, as NCs abertas por setor, o tempo médio (sem cor), as atrasadas, a eficácia. Os números batem entre si (38 abertas; 18 + 3 + 1 = 22 verificações).
- [ ] [T-09 Usuários](https://www.figma.com/design/I84yUUH486vPHJ65Xtg08K?node-id=103-806)
- [ ] [T-10 Detalhe do usuário](https://www.figma.com/design/I84yUUH486vPHJ65Xtg08K?node-id=103-948): a recusa da RN-43 com os 3 itens a reatribuir; os papéis.
- [ ] [T-11 Novo usuário](https://www.figma.com/design/I84yUUH486vPHJ65Xtg08K?node-id=103-1043) e o [convite gerado](https://www.figma.com/design/I84yUUH486vPHJ65Xtg08K?node-id=103-1124): o link aparece só uma vez.
- [ ] [T-12 Setores](https://www.figma.com/design/I84yUUH486vPHJ65Xtg08K?node-id=103-1175): a recusa da RN-44 e o Reativar no setor desativado.

## 6. O que ainda não está desenhado (o G1, item 8)

- [ ] As versões de celular de T-08 a T-12 (decisão (a), plano B2 item 7a).

- [ ] As ações dentro do "Mais": Cancelar, Retirar da aprovação, Reabrir e Excluir rascunho (`fluxo-app.md` §7).
- [ ] Os estados da tela: vazio, carregando, erro e sem permissão (`fluxo-app.md` §8). São do G4, na B3.
- [ ] O modo escuro nas telas: chega quando elas forem refeitas com os componentes ligados aos tokens (a página Fundações já mostra o escuro).
