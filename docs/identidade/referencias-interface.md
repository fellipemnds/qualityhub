# Referências de interface

> O moodboard em texto da B2 e da B3: o que cada referência de tela é, o
> que Matthew gostou e o que tirar dela para as nossas telas. As imagens
> **não** ficam neste repositório: são trabalho de outros autores. Daqui se
> tira o padrão, nunca a forma. O combinado: até 5 por dia, uma frase de
> Matthew, nenhuma decisão na hora; só uma **informação nova** reabre uma
> decisão (o Grafite, a Figtree), não um sentimento novo.
>
> A lente de cada uma: qual tela nossa ela ajuda, o padrão, se cabe na
> Grafite e o risco (a moda e a cara de IA, `docs/marca.md`).

## 2026-10-20 · Flowio (a tela inicial "num relance") e os menus

Autor não identificado; veio por captura. Já tinha servido à paleta de
2026-10-13 (a luz ambiente no claro, `docs/marca.md`), e volta pela
estrutura. Matthew: é uma tela inicial com o que ele valoriza "num
relance"; gosta das **ações rápidas** e da **coluna da direita**, com as
notificações e a atividade recente. E dos menus: o do Flowio, organizado
em grupos, e o do Investment (acima), aberto e na versão recolhida, só de
ícones.

**O que é:** um painel de campanhas e vendas: a fileira de números, as
"Quick Actions" (quatro atalhos em cartões coloridos), o gráfico da
semana, uma sugestão "de IA" e, à direita, a "Activity Feed" e as
notificações. O menu tem grupos com título (General, Tools, Support).

**O que tirar:**

1. **A coluna da direita é quase a nossa Pendências.** As notificações
   ("o seu teste acaba em 2 dias", "a campanha caiu") são o que espera por
   você: na Andon, isso já é a **Pendências** (T-03), inclusive as
   menções (RN-35). O que ela tem a mais é a **atividade recente**: o que
   aconteceu nas NCs que você acompanha, mesmo sem ser pendência sua.
   **Isso não existe no escopo:** o feed é por item (RF-11), e não há rota
   que junte o que aconteceu em vários itens. Fica como **ideia para a
   C3**, para refinar antes (`idea-refine`): a Pendências com a lista no
   centro e a atividade recente ao lado, no computador.
2. **As ações rápidas, com cuidado:** na Andon, quase toda ação nasce de
   uma pendência (aprovar, executar, verificar), e só uma começa do zero:
   a **Nova NC**. Quatro atalhos em cartões virariam um de verdade e três
   de enfeite. O que fica é o princípio: **a ação de começar algo, à vista
   na tela inicial**, que já é o botão "Nova NC" e o "+" do celular. Para
   o `ADMIN` (novo usuário, setores), um par de atalhos faz sentido.
3. **O menu em grupos com título:** hoje são poucos itens (Pendências,
   NCs, Relatórios; e a Administração), mas com módulos novos os grupos
   viram o próprio módulo ("Qualidade") e a "Administração". A seleção é
   um fundo cinza-claro, sem cor: Grafite.
4. **O menu recolhido, só de ícones** (o Investment): como **opção**, não
   como padrão. Aberto, com os nomes, para quem chega (`ui-ux.md` §6.1);
   recolhido para quem usa todo dia e quer espaço. O componente `Sidebar`
   do shadcn/ui já tem esse modo (`collapsible="icon"`), sem código nosso.

**Os cuidados:**

- **Os cartões coloridos** das ações rápidas (azul, violeta, verde,
  âmbar) e as **notificações tingidas** de amarelo e vermelho, com o
  botão da mesma cor: tudo o que a Grafite e a calma descartam.
- **A "Smart Suggestion" e o "Ask AI":** a cara de IA, de novo.
- **O "Upgrade to PRO"** no menu: não se aplica.
- **O painel cheio:** como o Investment, muitos blocos; a tela inicial da
  Andon continua com uma coisa principal (a lista do que espera por você).

## 2026-10-20 · App de mercado no celular (escuro, com a luz azul)

Autor não identificado; veio por captura. É o "app de finanças em modo
escuro" que já tinha servido à paleta de 2026-10-13 (`docs/marca.md`,
"Paleta"), e volta agora pela organização. Matthew: "gosto da forma como
é organizado para celular. A cor me chama um pouco de atenção também".

**O que é:** um app de bolsa, escuro, com um brilho azul no topo. Três
telas: o mercado (busca, categorias, cartões de índices e um gráfico), o
detalhe de uma ação (nome, preço, gráfico, abas, "Comprar" e "Vender") e
os números dela (uma lista de rótulo e valor e uma barra da mínima à
máxima do ano).

**O que tirar** (o celular da **T-06 Detalhe da NC** e da **T-07**):

1. **A ordem do detalhe:** voltar e duas ações no topo; quem é (o nome e
   uma linha de apoio); o número que importa em destaque; depois, as
   abas. Na NC: o código e o título, o estado e a etapa em destaque, e
   abas como Resumo, Itens e Feed.
2. **A barra de ações fixa no rodapé,** ao alcance do polegar, com **uma
   ação principal e uma secundária** ("Comprar" e "Vender"). É onde mora
   a barra de ações por estado da NC no celular (`fluxo-app.md` §7):
   "Enviar para aprovação" e "Salvar", por exemplo.
3. **A ficha em linhas de rótulo e valor,** com um ícone fino à esquerda,
   o rótulo em cinza e o valor alinhado à direita. Na NC: setor, origem,
   detecção, prazo e responsável, sem tabela.
4. **A barra de intervalo com o marcador de hoje** (a mínima e a máxima do
   ano): uma ideia para o **prazo**, da abertura ao vencimento, com o dia
   de hoje marcado. Mostra quanto do prazo já passou sem usar vermelho, o
   que conversa com a personalidade "calma". A conferir na B3.
5. **A barra inferior** com os itens nomeados confirma a nossa (`ui-ux.md`
   §6.1), que tem quatro, com o "+" da Nova NC.

**Sobre a cor:** é a mesma atração pela luz que a Sovra mostrou
(`docs/identidade/referencias.md`, "Sovra"), e não uma informação nova:
esta referência já tinha gerado a face Dawn. Pela regra combinada, ela
**não reabre a Grafite**. O lugar dela é a pergunta em aberto da marca: a
luz volta **só nos momentos de marca** (o login, o e-mail de convite), com
a interface em grafite? O app mostra que a organização funciona no escuro
sem o azul: tirando o brilho e o botão azul, ele já é a Grafite no modo
escuro.

**Os cuidados:**

- **O brilho no topo, os cartões de vidro e o orbe do "Auto invest":** a
  moda de 2025–26 e a cara de IA, os dois em "o que evitar" do `marca.md`.
- **O botão principal azul:** o nosso é o grafite (claro no escuro).
- **O verde e o vermelho do gráfico de velas:** finanças, de novo; aqui o
  vermelho é "Vencida".
- **O texto cinza-escuro sobre preto** (a busca, os rótulos): conferir os
  4,5:1 antes de copiar o tom.

## 2026-10-20 · Cyber Awareness (lista em cartões)

Autor não identificado; veio por captura. Matthew: a listagem "sai da
tabela tradicional e vai para uma visualização em cartão que mostra o que
é relevante em um *first glance*", e parece pensada para o celular.

**O que é:** uma plataforma de treinamento em segurança. Menu lateral com
seletor de empresa no topo e submenus com uma linha guia; a tela dos
cursos em cartões, agrupados por estado ("Subscribed (3)",
"Unsubscribed (4)"), com filtros rápidos em abas (todos, incompletos,
completos).

**O que tirar:**

1. **A anatomia do cartão:** o estado no alto à esquerda, o progresso à
   direita, o título, duas linhas de descrição, as etiquetas (os
   departamentos) e as ações no rodapé. Para a NC: estado e etapa no alto,
   código e título, setor e prazo, e no rodapé quem é o responsável.
2. **Onde o cartão cabe:** na **Pendências (T-03)**, que já é uma lista
   de cartões agrupados ("Vencidas (1)", `ui-ux.md` §7.1), e na **Lista
   de NCs no celular** (T-04, já decidido no `fluxo-app.md`). No
   computador, a Lista de NCs continua **tabela**: ela cresce para
   centenas de NCs, com filtro e comparação por coluna (setor, detecção),
   e a tabela é melhor para varrer muitas linhas. O cartão vence quando
   são poucos itens e cada um pede uma ação.
3. **Os grupos com contador** no título ("Subscribed (3)"): a Pendências
   já faz isso; vale manter o mesmo desenho.
4. **Os filtros rápidos em abas** (todos, incompletos, completos): na
   Lista de NCs, atalhos como "Todas · Minhas · Vencidas" antes dos filtros
   completos.
5. **A seleção do menu sem cor:** o item atual é um cartão branco com
   borda, sobre o menu cinza-claro. E o **seletor no topo do menu** é o
   lugar natural da troca de **módulo** quando a plataforma tiver mais de
   um.

**Os cuidados:**

- **Muitas ações por cartão** ("Subscriptions", "Edit", "Assign Course"):
  o nosso cartão leva **uma** ação, e o cartão inteiro abre o item.
- **A barra de progresso:** tentadora para a etapa da NC, mas a NC não
  anda em linha reta (reabre, volta para investigação). Se entrar, mostra
  a etapa atual, não uma porcentagem.
- **Os links azuis, as etiquetas tingidas e os emojis nos títulos:** a
  Grafite sublinha o link, o estado é o ícone ao lado do rótulo, e o
  título é texto.
- **A fileira de bandeiras:** ruído para quem não precisa dela.

## 2026-10-20 · Investment (painel de investimentos)

Autor não identificado; veio por captura. Matthew: "a interface é limpa e
a cor só exibe o que é relevante".

**O que é:** um painel de carteira de investimentos, todo em branco e
cinza: menu de ícones à esquerda, abas no topo, uma fileira de cinco
números, um gráfico de desempenho, uma tabela de ativos, os maiores altos
e baixos e as notícias.

**O que tirar** (na tela de **Relatórios, T-08**, que é o painel da
gestão: a tela inicial do `GERENTE`, `fluxo-app.md` §3):

1. **É a Grafite em outra área.** A cor aparece só no dado que muda (o
   ganho em verde, a perda em vermelho), e o resto é cinza. A seleção do
   menu é um quadrado preto, e o único botão escuro da tela é a ação
   principal: o nosso `--primary`.
2. **O gráfico sem cor** (T-08 Relatórios): a série principal em linha
   preta cheia e a comparação em cinza tracejado. As séries se distinguem
   pelo traço, não pela cor; é o que a Grafite pede num gráfico, e também
   serve a quem não distingue cores.
3. **A fileira de números** (T-08): o rótulo pequeno em cinza, o número
   grande, e embaixo a variação com **seta e cor** (a seta garante que a
   cor não está sozinha).
4. **Os cartões:** fundo cinza-claro, cartão branco, borda fina e cantos
   macios, a mesma estrutura das nossas superfícies (`--background`,
   `--card`, `--border`).
5. **As abas sublinhadas** no topo (Overview, Holdings, Market watch): um
   jeito discreto de dividir uma tela grande, a conferir no Detalhe da NC
   (T-06).

**Os cuidados:**

- **O excesso de painel:** dez blocos de informação disputam o olhar. A
  nossa regra é uma ação principal por tela, e a Pendências (T-03) é uma
  lista, não um painel.
- **O verde e o vermelho em todo lugar:** em finanças, a perda é notícia
  de todo dia. Aqui o vermelho é **Vencida**, e a personalidade "calma"
  pede que ele apareça pouco; o atraso usa texto e ícone, num tom firme.
- **As etiquetas tingidas** (o fundo verde-claro atrás do número): o nosso
  estado é o ícone colorido ao lado do rótulo, sem fundo tingido
  (`docs/marca.md`, "Paleta").
- **O menu só de ícones:** serve a quem usa todo dia, mas o nosso tem os
  nomes ao lado (`ui-ux.md` §6.1), porque quem registra NC no chão de
  fábrica não decora ícones.
- **O "Ask AI" com a faísca:** a cara de IA. Fora.

## 2026-10-23 · Qatalog e Jira Cloud (a lista de NCs, decisão (f))

Escolhidas por Matthew na decisão (f) da B2 (a T-04 e os filtros), entre
as formas de exibir buscadas no Mobbin: tabela, lista agrupada, quadro e
lista com o detalhe ao lado. As duas estão na coleção "Andon · T-04 Lista
de NCs" do Mobbin (privada, da conta de Matthew); as imagens ficam lá, fora
do repositório.

- **Qatalog** (computador, https://mobbin.com/screens/7c52b06d-ef8a-463f-825c-64dcc5551e7b):
  *"Gosto da forma como o Qatalog mostra os itens na tabela, as pílulas em
  cada coluna."* Cada coluna mostra o valor como uma pílula (o estado, a
  pessoa, a data), e a tabela fica legível sem virar planilha.
- **Jira Cloud** (celular, https://mobbin.com/screens/6401a4bf-26d0-476e-8d8c-dbda23746e81):
  *"Mostra os itens de maneira muito competente e organizada."* A busca,
  as pílulas de filtro roláveis e a linha rica (o título, o código e o
  estado), agrupada por dia.

## 2026-10-23 · Deel, Linear, incident.io e Jira (o Detalhe da NC, decisão (g))

Escolhidas por Matthew na decisão (g) da B2. As três primeiras estão na
coleção "Andon · T-06 Detalhe da NC" do Mobbin (privada, da conta de
Matthew); as imagens ficam lá, fora do repositório.

- **Deel** (as abas do celular, https://mobbin.com/screens/0ad6cfc0-0f19-4e43-9f4b-a4ef05007bb0):
  as abas sublinhadas, mas firmes: iguais na largura, a ativa em negrito
  com o traço grosso. A personalidade fica com o bloco escuro e o feed.
- **Linear** (o feed, https://mobbin.com/screens/a625482c-b708-4b6b-a9b2-1f4a4feb26f6)
  e **incident.io** (https://mobbin.com/screens/8d27748b-e522-40ba-a951-f718beb76799):
  a linha do tempo, com os eventos curtos e um ícone por tipo, e os
  comentários em cartão. Separa o que o sistema registrou do que as
  pessoas disseram, o que numa NC (registro de auditoria) importa.
- **Jira** (os itens, https://mobbin.com/screens/4f91b801-6465-49cd-9579-f6fe5d1f0c80):
  os itens ligados num bloco só, com um subtítulo por tipo e o progresso
  em cima; e as abas de atividade (Tudo, Comentários, Histórico) que
  viraram o filtro do painel.

## 2026-10-26 · Linear e GitHub (o celular dos filhos, decisão (h))

Escolhidas por Matthew na decisão (h) da B2, que decide como o celular dos
filhos mostra a Atividade, as Atribuições e os Anexos. As duas estão na
coleção "Andon · T-07 Itens filhos" do Mobbin (privada, da conta de
Matthew); as imagens ficam lá, fora do repositório.

- **Linear** (https://mobbin.com/screens/b60dd0ce-6c97-4719-82a3-eb49756360da)
  e **GitHub** (https://mobbin.com/screens/1e8aefa5-a220-4bc2-b8fc-d01e48fb486b):
  *"Eu gostei da do Linear e da do GitHub. Inclusive elas se parecem um
  pouco."* As duas empilham tudo numa página só, sem abas: o título e as
  propriedades em pílulas em cima (o estado, as pessoas), o conteúdo e a
  atividade em linha do tempo embaixo, e o comentar num botão ou numa barra
  flutuante. O GitHub também mostra o "Mais" aberto (Fechar, Excluir), uma
  referência para o item 14.

## 2026-10-26 · Cleo AI, Chime, Shopify e Public (a Investigação no celular, decisão (i))

Escolhidas por Matthew na decisão (i) da B2: a Investigação A3 ganha versão
de celular para preencher, uma etapa por tela, e uma página corrida de
leitura para o aprovador. As quatro estão na coleção "Andon · T-07
Investigação no celular" do Mobbin (privada, da conta de Matthew); as
imagens ficam lá, fora do repositório. Todas são telas de onboarding: delas
vem o jeito de mostrar o estado de cada etapa e de focar numa só, não a
ordem obrigatória (o A3 é feito fora de ordem, ao longo de dias, e uma
etapa pode ficar pela metade).

- **A entrada (o índice):** **Cleo AI** (https://mobbin.com/screens/c80a9ae9-9e0f-40d9-827d-578b33a0fb1f),
  **Chime** (https://mobbin.com/screens/5964d1f6-e082-4612-a968-568b09e2cc8a)
  e **Shopify** (https://mobbin.com/screens/32ac5921-43be-435c-88cc-9e29bd8eb23e):
  *"Acho fáceis de entender a etapa do processo."* As etapas numeradas com
  o estado de cada uma (feita, atual, a fazer), o progresso em segmentos
  (Chime) e a lista compacta que cabe numa tela (Shopify).
- **A etapa:** **Public** (https://mobbin.com/screens/f350f14f-30f4-4391-9326-2633d5c38c1e):
  *"Parece bem simplista."* Só a barra segmentada no topo, a seta de
  voltar e o conteúdo limpo.

## 2026-10-26 · Asana, Deel e Notion (Minhas pendências, decisão (j))

Escolhidas por Matthew na decisão (j) da B2: a T-03 é a primeira tela que
abre no computador e no celular e precisa ser **convidativa na chegada**.
Ele seguiu a recomendação do Claude. As três estão na coleção "Andon · T-03
Minhas pendências" do Mobbin (privada, da conta de Matthew); as imagens
ficam lá, fora do repositório.

- **Celular, o destaque:** **Asana** (https://mobbin.com/screens/53b9bc89-e6fe-4844-8476-93e1ad99d0c5):
  a data e a saudação no topo, **um cartão com o mais urgente** e a lista
  com o prazo à direita. Vira a variante A.
- **Computador, o resumo por tipo:** **Deel** (https://mobbin.com/screens/6bd4989c-7a50-413e-be7e-e955b2394a29):
  a saudação e o "Para você hoje", uma linha por tipo com o contador e a
  ação. Vira a variante B.
- **O vazio:** **Notion** (https://mobbin.com/screens/97a17109-8022-42e1-bbe4-c43480ba8cfe):
  "Você está em dia", sóbrio, só com um ícone; combina com o Grafite.
- **Visto no fluxo, não escolhido:** o "Minhas tarefas" do **Airwallex**
  (https://mobbin.com/flows/b50c8a2b-97ab-45e4-ace2-105ebd53a2c0), em que
  cada tipo sem pendência mostra "Em dia" com um ✓ em vez de sumir.
- **O que ficou** (a C2, proposta de Matthew): *"Gostei desse cartão urgente
  da A e gostei dessa lista da B"*, e o resumo virou **gavetinhas**. O
  "em dia" do Airwallex entrou como a linha do fim das gavetas.

## 2026-10-26 · Mercury, Higgsfield e Linear (os Relatórios, decisão (k))

Escolhidas por Matthew na decisão (k) da B2, a T-08 Relatórios (o painel
da gestão e a tela inicial do `GERENTE`), na segunda rodada de busca:
a primeira (Plain, Asana, Airtable, Dovetail, ClickUp, Revolut, TikTok)
foi recusada, *"achei todos feios"*. Matthew: *"só gostei da estética"*.
As quatro estão na coleção "Andon · T-08 Relatórios" do Mobbin (privada,
da conta de Matthew); as imagens ficam lá, fora do repositório. O que o
Claude tira da estética de cada uma (a base continua o **Investment**, de
2026-10-20, acima):

- **Mercury · Início** (https://mobbin.com/screens/f3cc6753-dc1c-49ec-babb-99599b85f605):
  colunas sem caixa pesada; em cada uma, o número grande, o "vs período
  anterior" embaixo, os rótulos **sublinhados** (como o nosso link) e a
  quebra em barras finas com a porcentagem; a régua de meses no topo para
  o período.
- **Mercury · Insights** (https://mobbin.com/screens/c6574c88-b41c-417d-acf3-3bd0fc60c6b1):
  frases que dizem **o que mudou** ao lado dos números.
- **Higgsfield · Uso** (https://mobbin.com/screens/2884b14e-7f1f-4287-99e7-64862a439bcc):
  as seções em cartões arredondados com o título pequeno e o ícone; a
  distribuição numa **barra segmentada só**, com a legenda em
  porcentagem; os números em blocos com ícone. O escuro e o verde-limão
  dela ficam de fora (o Grafite, `docs/marca.md`).
- **Linear · Iniciativa** (https://mobbin.com/screens/fbe66735-93b3-495b-b071-923d3d5e1bad):
  o cartão da **última atualização**, com o estado ("No prazo") e o texto;
  o gráfico de progresso numa coluna lateral com abas; a atividade
  embaixo.

## 2026-10-26 · Usuários numa tela só (decisão (l)): referências recusadas

Duas buscas no Mobbin (Mintlify, Plain, Bloom, Sprig, Exa, Toggl,
Gumloop; Pipedrive, Melio, Supabase, Whop, Airwallex, OpenPhone) e Matthew:
*"não gostei muito delas… quer tentar criar algo e eu avalio?"*. A A
(lista + painel) foi desenhada pelo Claude no estilo já firmado na T-03 e
na T-08, sem referência de fora. Nenhuma entrou na coleção.

## 2026-10-27 · Miro e Grok (os Setores, decisão (m))

Matthew: *"a tabela do Miro com as abas e a página de detalhe do Grok"*.

- **Miro · Teams** (https://mobbin.com/screens/0224bd31-3aa6-47be-a319-e743bd4142bf):
  a tabela com as abas **Active / Deleted** (os nossos ativos e
  desativados), um ícone por linha e as colunas de números alinhadas.
- **Grok · Manage Team** (https://mobbin.com/screens/c2593798-413f-4dad-9bc3-5967f757c8a1):
  o detalhe do time em blocos: os dados com o Editar, os membros num bloco
  próprio e a **zona de perigo** separada para a ação que não se desfaz
  fácil (o nosso Desativar).

## 2026-10-27 · Mintlify, ClickUp e o próprio Mobbin (a busca, decisão (n))

Matthew: *"Mintlify e ClickUp, e inclusive a pesquisa do próprio Mobbin
é boa"*.

- **Mintlify · a busca do ⌘K** (https://mobbin.com/screens/7c7ad31f-9dfe-4be7-83d7-6002fe31d4d0):
  a janela enxuta, o "Esc" no campo, os grupos com o título pequeno, uma
  linha de contexto embaixo de cada resultado e o rodapé que ensina as
  teclas (selecionar, abrir).
- **ClickUp · a busca no celular** (https://mobbin.com/screens/b86be07c-0f16-46c4-bd1b-2d46b8a83390):
  a folha cheia com o campo e o Cancelar, as abas por tipo, as pílulas de
  filtro ("Assigned to me") e os recentes com o ícone do estado.
- **Mobbin · a busca** (https://mobbin.com/screens/f98fab0b-6e73-4ee4-80a3-eb653586a481,
  ao fundo, atrás do diálogo): antes de digitar, a busca abre um painel
  largo com **colunas de atalhos** (Categorias, Telas, Elementos, Fluxos):
  o que dá para procurar já aparece, sem a pessoa adivinhar.
