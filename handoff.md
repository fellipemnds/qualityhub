# Handoff — estado da sessão

> Lido no **início de toda sessão** (regra no `CLAUDE.md`) e atualizado
> no **fim de toda sessão** ou quando Matthew disser "vou trocar de
> computador". Aqui fica só o que muda de sessão para sessão; o que é
> estável mora nos documentos apontados.

**Última atualização:** 2026-10-23, fim do dia (no **trabalho**, `/encerrar`). No fim, um alerta novo do `osv-scanner` no `zod` deixou o CI vermelho no `dependencias`: o `zod` foi para a 4.6.7 na hora (suíte 489, 97,47%), e a regra do `--force` entrou no `CLAUDE.md` (nenhum comando com `--force` sem consultar Matthew). Um dia grande na B2, todo de documentação e Figma (commits `07721e2` a `dcfb536`, CI verde em todos): o **fluxo de desenho** virou a skill **`/desenhar`** (Mobbin + Figma + skills de front, com as fichas de UX e de factibilidade e a escada do componente); o **método do Design System** ficou decidido (`ui-ux.md` §2.2: o Atomic Design para organizar, duas camadas de tokens, a base comum e as telas na ordem das fatias C, cinco regras de governança, a ponte com o código; o Code Connect a provar na C0); a **B2 e a B3 foram replanejadas** (a revisão só na estrutura, junto com o G1; a B3 em 14 itens); os **gestos da casa** (`ui-ux.md` §6.2); o **SaaS** anotado para uma sessão de `idea-refine` antes da C0 (§5); e os **itens 8 a 11 da B2**, com as decisões **(f)** (a T-04) e **(g)** (o Detalhe da NC). A foto daqui não mudou. Antes, 2026-10-23 (chegada no **trabalho**, `/retomar`). Branch em dia com a remota, nenhum commit depois do handoff, CI do PR #13 verde, plugins completos (8). A foto daqui não mudou; comparando com casa, nada novo. Prazo perto: o Node 26 vira LTS em 28/10 (§5). Antes, 2026-10-22, fim do dia (no **trabalho**, `/encerrar`; Matthew continua em casa). **As cinco decisões da revisão dos wireframes fecharam** (o detalhe no checklist `docs/identidade/revisao-wireframes.md`, §0): (b) o Detalhe da NC no celular em 4 abas, com o título num bloco escuro; (c) a Investigação de quem preenche, com o Ishikawa numerado, os 5 porquês em cadeia e o check de efetividade como resumo; (e) a navegação do computador como uma **doca flutuante embaixo**, com a busca em janela (Ctrl K); (d) a borda inteira dos campos. **O Figma foi reorganizado:** a página Wireframes só com as telas decididas, cada uma ao lado da sua versão (as 7 de celular que faltavam foram feitas), e as decisões na página nova **Decisões (histórico)**. O fluxo com o Mobbin funcionou (§5). Commits `92a82fe` a `7d7deac`, CI do PR #13 verde em todos. A foto daqui: três extensões novas; a primeira tentativa pegou o servidor do VS Code se atualizando (§5), foi desfeita e refeita. Antes, 2026-10-22, tarde (no **trabalho**, `/retomar` em mais uma sessão nova). Branch em dia com a remota, nenhum commit depois do handoff, CI do PR #13 verde, plugins completos (8). A foto daqui só mudou o CLI do Claude Code (2.1.280 → 2.1.308); comparando com casa, nada novo. **O Mobbin apareceu** nas ferramentas da sessão (a pendência do §5): dá para testar o fluxo proposto na decisão (b). Antes, 2026-10-22, tarde, 14h (no **trabalho**, `/retomar` na sessão nova). Branch em dia com a remota; um commit depois do handoff, o **fastify 5.12.7 e o ip-address 10.7.4** (`95f5a71`, alertas do `osv-scanner`, só o lockfile; já instalados aqui) e o CI do PR #13 **verde**. Plugins completos (8, com o `typescript-lsp`). A foto daqui só mudou Docker (29.9.2, Compose 5.6.1) e extensões (Biome 3.8.0, GitLens 19.4.0, Remote WSL 0.104.5); comparando com casa, nada novo. O Mobbin continua fora das ferramentas da sessão (§5). Antes, 2026-10-22, tarde (no **trabalho**, troca para uma sessão nova no mesmo PC, sem `/encerrar`). Os 3 itens do PC feitos: o vite (`0f9f5ef`), o **servidor de linguagem** como plugin do projeto (`552fb90`: a navegação funciona; o aviso de erro depois da edição não, §5) e o **grafo do `understand-anything`** versionado em `.ua/` (`29788d1`). Na revisão dos wireframes, a **decisão (a) fechou** (a navegação do celular; `ui-ux.md` §6.1, `fluxo-app.md` §1 e §2, plano B2 item 7a). O Mobbin foi assinado, mas o MCP ainda não aparece na sessão (§5). Antes, 2026-10-22, manhã (chegada no **trabalho**, `/retomar`). A branch estava 18 commits atrás (os da nuvem, de 2026-10-21 e 22), `git pull` só de avanço, sem conflito; o handoff da madrugada estava em dia. Plugins completos (7). A foto daqui não mudou (o Docker Desktop estava fechado na primeira tentativa: foto desfeita e refeita com ele aberto). **O vite foi para 8.3.5** (`0f9f5ef`, só a árvore dele no lockfile; suíte 489, 97,47%, 290 s) e o CI do PR #13 ficou **verde**. Prazo perto: o Node 26 vira LTS em 28/10 (§5). Antes, 2026-10-22, madrugada (fim da **sessão na nuvem**, Matthew pelo iPad, `/encerrar`; nuvem, sem foto do ambiente, `SETUP.md` §13). A B2 andou do item 1 ao 7: os wireframes em texto (`ui-ux.md` §7.7 a §7.16) e **28 frames no Figma** (página Wireframes), revistos pela skill `design-taste-frontend`; falta o refinamento pelo checklist `docs/identidade/revisao-wireframes.md` e o item 8 (G1). **A B3 começou no Figma:** os tokens (coleções Cor, Claro e Escuro, e Medida; estilos de texto), feitos pelo Claude; os componentes são de Matthew. O Figma foi limpo (página "Arquivo · B1"). **Passeio guiado:** A4 e A6 feitos (lacunas anotadas no §6), **A7 em parte** (repetir o teste do `pausarNoMeio`). Também: a proposta do fluxo de trabalho com modelos (`docs/fluxo-de-trabalho.md`, espera o ok do §7), as marketplaces dos plugins no `.claude/settings.json` e no `SETUP.md` §13, a regra do "existe ou não existe" e o `podeExecutar` corrigido no `CLAUDE.md`. O CI do PR #13 está vermelho **só** no `osv-scanner` (o `vite`, que Matthew atualiza no PC). Antes, 2026-10-21 (**sessão na nuvem**, Matthew pelo iPad, `/retomar`). A nuvem abriu na `main`: troca para a `fase/b2-wireframes`, em dia com a remota e sem commit depois do handoff de 2026-10-20. Ambiente preparado (`SETUP.md` §13); os 6 plugins não estão instalados na nuvem. CI da `main` verde depois do Ubuntu 26. **O SheerID aprovou** (Matthew), e o conector já vê o time "Designing" no plano **student** (§5). Feitos o item 1 da B2 (o registro da B1 e a ordem dos itens no plano, seção "B2 — a ordem dos itens") e o PR da B2 em rascunho. Antes, 2026-10-20, fim do dia (no **trabalho**, `/encerrar`). **A B1 fechou** (PR #12, merge `56b388b`): o símbolo e o nome ficaram provisórios (uma pendência só, sem prazo), a interface é **Grafite, sem cor de destaque**, a Figtree ficou, o logotipo provisório é o nome em Figtree 600 e a assinatura da empresa está definida (tudo no `docs/marca.md`). **A B2 está aberta** (`fase/b2-wireframes`, sem PR ainda) e **espera o SheerID** (licença de estudante do Figma; §5): a quebra proposta está no §6. Começaram as **referências de interface** (`docs/identidade/referencias-interface.md`, quatro hoje), e um outro chat registrou as de marca (`fb57e9b`). Antes, de manhã (chegada no **trabalho**, `/retomar`): branch em dia com a remota, nenhum commit desde o handoff de 2026-10-16, CI do PR #12 verde, plugins completos. A foto daqui só mudou extensões (Claude Code 2.1.304, Containers 2.5.3, Remote WSL 0.104.4); comparando com casa, nada novo (o `gh` e o CLI do Claude Code continuam diferentes). Antes, 2026-10-16, tarde (fim do dia no **trabalho**, `/encerrar`; Matthew continua de casa). **O símbolo tem direção** (§6, item 2): a exploração guiada deu as regras e a ficha (`docs/marca.md`, "O símbolo"), e Matthew escolheu os **Frames 13, 14 e 15** dele (a barra de cantos redondos com a estrela). A estrela lembrou o PT a todos no teste; ele está testando variações dela (arredondada, inclinada). O caminho inteiro: `docs/identidade/referencias.md`, "2026-10-16". A conexão do Claude com o Figma funcionou (leitura e escrita). Antes, de manhã (chegada no **trabalho**, `/retomar`): a branch estava 6 commits atrás (os de casa e da nuvem, de 2026-10-14 a 16), `git pull` sem conflito; CI do PR #12 verde; plugins completos. A foto daqui: o Prettier saiu do lado Windows (a pendência do §5 resolvida) e extensões novas (Claude Code 2.1.301, Prisma 31.13.0, GitHub PR 0.170.0); o CLI do Claude Code aqui é 2.1.280 (em casa, 2.1.301). Antes, 2026-10-16, madrugada (em **casa**, `/encerrar`). **O símbolo andou** (§6, item 2): o ponto de partida agora é a **fenda** do Frame 8 (um triângulo e um paralelogramo), e a estrela do Karave ficou de fora. O arquivo do Figma se chama **Andon**. A conexão do Claude com o Figma caiu no meio da sessão e só volta numa conversa nova. Antes, 2026-10-15, noite (chegada em **casa**, `/retomar`): este PC estava na `docs/fechamento-bloco-a` (já mesclada, PR #11); `main` atualizada, troca para a `fase/b1-identidade-visual` e a local mesclada apagada. CI do PR #12 verde. **Ambiente de casa configurado:** o `~/.claude` do WSL tinha sido recriado sem plugins nem marketplaces; o CLI do Claude Code foi instalado no WSL (2.1.301, `~/.local/bin` no `PATH` do `.bashrc`), Matthew instalou os 6 plugins (as marketplaces conferidas e anotadas no `SETUP.md` §12.4) e o `~/.config/ponytail/config.json` foi criado (`lite`). A foto: o Claude Code instalado, o Prettier saiu dos dois lados, o GitHub Actions entrou no WSL e versões novas de extensões. Comparando com o trabalho: aqui o Compose é 5.5.1 e o `gh` é o do apt (2.46.0, escopos ok). O `JWT_SECRET` daqui já tem 44 caracteres e o banco escuta só em `127.0.0.1`. Antes, 2026-10-15 (pelo celular, na nuvem): **o nome é Andon** (§6, item 2). Antes, 2026-10-14, noite (**sessão na nuvem**, Matthew pelo iPad, `/encerrar`). **A marca recomeçou pela ideia:** saiu da história real (as 52 NCs registradas à mão pela analista) a frase *"o processo sai da mão de uma pessoa e fica claro para todos"* e o território **Palpável**, que também entrou na personalidade no lugar da Luminosa; o **Dusk & Dawn** e a parte de luz da paleta ficaram **suspensos** (`docs/marca.md`, commit `7c41d58`). Os estudos de símbolo do Claude (estrela-d'alva e três do Palpável) foram recusados: "genéricos, sem força e feios". **Próximo: o nome, antes do símbolo** (§6, item 2). Antes, 2026-10-14, fim do dia (no **trabalho**, `/encerrar`). **O nome da plataforma está em aberto de novo** (§6, item 2): Matthew quer um nome só, em vez de "Dusk & Dawn", e a direção do logo mudou junto. Nada mudou nos documentos ainda. Antes, de manhã, a chegada (`/retomar`): branch em dia com a remota, nenhum commit de casa desde 2026-10-13, plugins completos, CI do PR #12 verde. Antes, 2026-10-13, fim do dia (no **trabalho**, `/trocar-pc`). **B1 em andamento** (PR #12, rascunho): sessão 1 (direção, `docs/marca.md`), sessão 2 (paleta: superfícies neutras, a face como luz) e metade da 3 (fonte: **Figtree**) feitas; o **logo** está nos primeiros conceitos, no Figma, e Matthew vai pensar em casa. Também hoje: as skills avulsas duplicadas apagadas deste PC (40), o Ponytail em `lite` e a regra de formato das respostas no `CLAUDE.md`. Antes, 2026-10-13, tarde (no **trabalho**). **Bloco A fechado** (PR #11, merge `df05b71`) e a **fase B1 aberta** (branch `fase/b1-identidade-visual`): a identidade da empresa chegou e não combina com o app, então a plataforma ganha nome e identidade próprios, **Dusk & Dawn**, com as faces **Dawn** (colaborador) e **Dusk** (gestão), divididas por pessoa, e a assinatura da empresa (`ui-ux.md` §1). A branch remota `docs/fechamento-bloco-a` ainda existe (apagar só com o pedido de Matthew). Antes, de manhã: **Bloco A fechado nos documentos** (portão "fundação pronta"; o passeio guiado vai em três sessões curtas durante o Bloco B, como condição para o C0, porque em casa Matthew chega cansado) e as skills revistas (`/retomar` com branch já mesclada; colinha do Bloco B). O PR da `docs/fechamento-bloco-a` espera: Matthew quer ver outras skills antes. Antes, no mesmo dia, a chegada (`/retomar`). Este PC estava parado no `fase/a6` de 2026-10-09: `main` atualizada, branch `docs/fechamento-bloco-a` criada daqui e a `fase/a6` local apagada (mesclada). Em 2026-10-10 entrou a **primeira foto de casa** (`casa.txt`, commit `de11205`), sem `/trocar-pc` (este handoff não foi atualizado lá). Sem dependência, migration nem chave nova desde 2026-10-09. A foto daqui só mudou a extensão do Claude Code (2.1.296). Comparando com casa: lá o `gh` é o do apt (2.46.0, escopos ok), o Prettier ainda está no WSL e a foto acusa `claude code: não instalado` (provavelmente o `PATH`, §5). Antes, 2026-10-09, noite (**sessão na nuvem**, Matthew pelo iPad; a primeira, `SETUP.md` §13). **A6 fechada** (PR #9, merge `e441212`) e **A7 fechada** (PR #10, merge `aae403f`). Branch nova, `docs/fechamento-bloco-a`, para fechar o bloco A depois do passeio guiado. Antes, 2026-10-09, fim do dia (no **trabalho**, `/trocar-pc`): o script do primeiro acesso e o item 6. O PC de casa continua sem foto (`casa.txt`).

## 1. Objetivo

Fase **B2 — Wireframes** (`docs/plano-implementacao.md`, Bloco B), na
branch `fase/b2-wireframes`: frames cinzas no Figma a partir do `ui-ux.md`
§7, uma tela por frame, até o gate **G1** (`ui-ux.md` §2: toda tela do
mapa tem wireframe; toda ação do `fluxo-app.md` §7 é alcançável). O
SheerID aprovou em 2026-10-21, e o conector já vê o plano novo (§5).
A B1 fechou em 2026-10-20 (PR #12); a marca (nome e símbolo) é uma
pendência sem prazo. O **passeio guiado** vai em sessões curtas durante
o B e é condição para o C0.

## 2. Estado atual

- **B2 em andamento (PR #13, rascunho):** os itens 1 a 11 feitos; faltam o 12 (a T-07), o 13 (a gestão e a administração) e o 14 (o menu "Mais", o G1 fechado e o `/abrir-pr`). As decisões da revisão, (a) a (g), estão no `docs/identidade/revisao-wireframes.md` §0; o G1, nas tabelas do §6 do mesmo arquivo.
- **B1 fechada (2026-10-20, PR #12):** o detalhe está no changelog, "Fase
  B1", e no `docs/marca.md`. O registro dela no histórico do plano
  (`/fechar-fase`, passo 4) **ainda não foi feito**: Matthew pediu para
  não mexer em mais nada da B2 naquele momento.
- **A7 (2026-10-09, na nuvem; Claude escreveu, Matthew revisou os
  diffs pelo iPad; PR #10):** B29–B36 corrigidos por **travar antes de ler** (o
  `registroRepository.travar`, as travas da pessoa e do setor e a trava
  única da saída de ADMIN), sempre `FOR NO KEY UPDATE`; filho novo só
  com a NC aberta, nem em rascunho (RN-51, decisão de Matthew, que revê a
  da A3). Os testes de corrida usam o `pausarNoMeio`
  (`testes/cenarios.ts`). Detalhe no changelog, "Fase A7".
- **A6, revisão da fase (2026-10-09, na nuvem):** o **B28** (pessoa
  inativa designada aprovadora ou colaboradora) e a revisão de
  concorrência que achou o B29–B36. O "pronto quando" da A6 (Matthew
  explicar a fase) foi adiado para o passeio guiado, como o da A4.
- **A5 fechada em 2026-10-08** (PR #8; o detalhe está no changelog,
  "Fase A5", e na descrição do PR): prefixo `/api`, schema de resposta
  em todas as rotas, OpenAPI 3.1 só em desenvolvimento, `GET
  /api/saude`, catálogo de auditoria, L4, L5, L7, **B22–B26** e cinco
  travas sobre o OpenAPI no `app.test.ts` (resposta declarada, teto,
  corpo estrito, lista paginada, `{id}` de outro tipo responde 404). O
  lote 5 decidiu que as funções repetidas dos services ficam.
- **Skills novas** (2026-10-08): `/item` (o ciclo de um item, com a
  revisão do diff) e `/verificar` (a verificação local, com o
  `diff-cover` antes do push). **Claude dá o push** depois da
  `/verificar` (`CLAUDE.md`, "Ambiente").
- Nenhum bug aberto (B1–B36).
- Suíte: **489 passando** (2026-10-09, na nuvem, depois da A7 e do B37; cobertura 97,47% das linhas; 145 s na nuvem). Antes, **472 passando** (2026-10-09, depois do item 6 da A6;
  cobertura 97,42% das linhas (trava em 94,66%). Com a máquina carregada (VS Code, pouca
  memória livre), chegou a 473 s.
- O que Matthew aprendeu na A5: `prefix` do Fastify e `Path` do
  cookie; schema de resposta (filtra o que sai, vigia o código: tipo
  errado vira 500); codec do Zod (`decode`/`encode`); *arrow function*;
  `Date()` sem `new` devolve texto; `toEqual` × `toMatchObject`; teste
  de caracterização; a conferência negativa precisa de uma positiva
  junto; função genérica (`<T extends z.ZodType>`); `.nullable()` ×
  `.optional()`; supertipo e o `id` que não diz o tipo (B23, a busca
  com tipo escrita por ele); "expandir e contrair"; o que é OpenAPI; o
  `idea-refine` numa decisão de arquitetura (lote 5). Na A6 (F3, a trava da RN-43): filtro por relação no
  Prisma (`registro: { estado: { in: [...] } }`), `select` aninhado,
  `some` em relação de lista, `count`, `not`, desembrulhar com `.map`, e
  contar "os outros" em vez do total; na F4, refatorar com os testes
  como rede (extrair o `conferirSaida`, que recebe os papéis que saem). No "pronto
  quando", as respostas tiveram lacunas, já explicadas: o OpenAPI diz
  também o que cada rota recebe e devolve (é daí que o Orval gera o
  cliente); o schema de resposta também vigia o nosso código; o B26 era
  teto **máximo** (254), e a trava liberava todo texto com `format`.
  No script do primeiro acesso (2026-10-09): receita em comentários antes
  do código; `??` para "achei ou crio"; `?.` devolve `undefined`, não
  `null` (a armadilha do `!== null`); `.includes`; *spread* de lista
  (`[...lista, "ADMIN"]`) × de data (não espalha nada); desestruturação
  no parâmetro; `safeParse` e `prettifyError`; `try`/`catch` com
  `instanceof AppError`; *streams* e o `readline` em fila; `.rejects` no
  Vitest; ordem de enum no Postgres (declaração, não alfabeto); o teste
  que falha pelo motivo errado (o `await` esquecido, o `depois` no
  objeto errado); prova de quebra; travar antes de ler (o B19 de novo).
  Os `await` do Prisma esquecidos foram três: o `noFloatingPromises` não
  os pega (só as funções `async` nossas).
  No item 6: teste de **limite** (onde a trava não age) e a prova de
  quebra dele; o cenário precisa ser exato ("NC fechada" não é "nenhum
  item aberto": a ação volta a `ABERTO` depois do plano, e a verificação
  nasce com o aprovador); 401 × 403 × 409; o `it.todo` não roda o corpo;
  procurar o teste que já existe antes de escrever outro (as tabelas da A2
  já cobriam o `ADMIN`).
- Tempo da suíte: 240 s a 330 s. Fechar **qualquer player no
  navegador** (Apple Music, YouTube) antes de rodar: com o YouTube
  aberto, a suíte levou 481 s (2026-10-08). Se passar de ~5 min sem
  isso, olhar o Docker Desktop e o `free -h` antes de mexer nos testes.

## 3. Arquivos no meio de uma mudança

Nenhum.

## 4. O que foi alterado nesta sessão

Em 2026-10-23 (no trabalho): a skill nova `.claude/skills/desenhar/`; o `ui-ux.md` (§1.1, §2.1 e a §2.2 nova, §3.1, a §6.2 nova, §5.1, §7.2, §7.3, §7.6; v1.15 a v1.19), o `fluxo-app.md` (T-04, T-06, as lacunas L10 a L12; v1.9 e v1.10), o plano (a B3 pelo método, a B2 replanejada nos itens 8 a 14, a B3 em 14 itens, os itens 8 a 11 feitos, a sessão do SaaS antes da C0; v1.40 a v1.47), o changelog (a seção da B2), o checklist (as decisões (f) e (g), as seções 1 a 3 revistas, as tabelas do G1), o `referencias-interface.md` (Qatalog, Jira, Deel, Linear, incident.io), o `docs/marca.md` (o time Andon), o `CLAUDE.md` (a `/desenhar`) e este handoff. No Mobbin, as coleções "Andon · T-04 Lista de NCs" e "Andon · T-06 Detalhe da NC". No Figma: o time virou "Andon" (o mesmo arquivo e a mesma chave); componentes novos (`Shell/Barra inferior` com o contador, `Campo/Senha`, a ajuda opcional no `Campo/Texto` e no `Campo/Área`, `Shell/Abas do item`, `Feed/Dia`, `Feed/Evento`, `Feed/Comentário` e o `Item/Estado` como conjunto com ícones SVG, 173 pílulas trocadas); a T-03, a T-04, a T-05 e a T-06 revistas nos dois tamanhos, com as telas novas da T-06 (a Atividade aberta, os itens em cartões e sem agrupar); as seções das decisões (f) e (g) na página Decisões (histórico). **Sem código, migration, dependência nem chave nova no `.env`.**

Em 2026-10-22, tarde (no trabalho, a revisão dos wireframes): o `ui-ux.md` (§6.1 com a doca do computador, §7.3 com o Detalhe da NC no celular, §7.5 com as duas visões da Investigação e as três regras das seções, a gestão no celular depois do §7.16, §9 com a borda dos campos; v1.9 a v1.14), o `fluxo-app.md` (§2.1, T-06, J4 e J10; v1.6 a v1.8), o plano (B2, itens 7a a 7d; a busca por texto na C1 e na C4; v1.36 a v1.39), o checklist (as cinco decisões, os links das telas novas e a regra de organização do arquivo) e este handoff. Fora do Git, no Figma: a página **Decisões (histórico)** (as seções das decisões (a), (b), (d) e (e), com as variantes e os quadros "Antes"); na página Wireframes, as telas decididas no lugar das antigas, a Investigação de quem preenche, as 7 telas de celular, os componentes `Shell/Doca` (o que está em uso) e `Shell/Trilho` (não escolhido, guardado na decisão (e)). **Sem código, migration, dependência nem chave nova no `.env`.**

Em 2026-10-22 (no trabalho): o `package-lock.json` (vite 8.3.5); o `.claude/marketplace/` (novo: o marketplace local `qualityhub` com o plugin `typescript-lsp`, escrito por Matthew), o `.claude/settings.json` (o marketplace e o plugin, escopo de projeto) e o `.gitignore` (a exceção `!.claude/marketplace/` e o rascunho da `.ua/`); a `.ua/` (nova: o grafo, as impressões digitais, os metadados, a configuração pt-BR e o `.understandignore`); na revisão, o `ui-ux.md` (§6.1, a U2 e a v1.8), o `fluxo-app.md` (§1, o mapa com a T-13 Eu, a coluna Celular e o §2.1), o plano (B2, item 7a) e o checklist (a decisão (a) marcada). Fora do Git: no Figma, a seção **"Decisão (a) · barra do celular (2026-10-22)"** na página Wireframes (as variantes A e B do T-03 celular e a tela Eu); fora do projeto, o plugin do grafo compilado (`pnpm` pelo `corepack`). **Sem código, migration nem chave nova no `.env`; a única dependência mudada foi o `vite` (de desenvolvimento).**

Em 2026-10-21/22 (na nuvem, pelo iPad): no plano, a B1 concluída, a ordem da B2 (v1.33), o título dos filhos para decidir antes da C0 (v1.34) e os itens 1 a 7 da B2 (v1.35); no `ui-ux.md`, os wireframes §7.7 a §7.16, a regra do rótulo dos filhos (§10.3), as contradições da B1 corrigidas, o reativar setor, o "Sair de todos os aparelhos" e a proposta da barra de três destinos (§6.1, muda a U2); no `fluxo-app.md`, o reativar setor e o "Sair de todos"; o `docs/fluxo-de-trabalho.md` (novo, proposta), o `docs/identidade/revisao-wireframes.md` (novo, o checklist), o `.claude/settings.json` (as marketplaces), o `SETUP.md` §13 (os plugins na nuvem), o `CLAUDE.md` (a regra do "existe ou não existe" e o `podeExecutar`) e o `docs/marca.md` (a coleção Cor). Fora do Git: no Figma, as páginas Wireframes (28 frames, 16 componentes) e Fundações (os tokens), a "Arquivo · B1" e a Moodboard apagada. **Sem código, migration, dependência nem chave nova no `.env`** (o `vite` foi testado na nuvem e desfeito: entra pelo PC).

Em 2026-10-20 (no trabalho): a B1 inteira até o merge (o símbolo e o nome provisórios, o Grafite, a Figtree, o logotipo provisório, a assinatura e a revisão da fase; `marca.md`, `ui-ux.md`, plano, changelog e `CLAUDE.md`), a branch `fase/b2-wireframes` criada e enviada, e o `docs/identidade/referencias-interface.md` (novo). Fora do Git: o arquivo do Figma foi para a conta pessoal (`I84yUUH486vPHJ65Xtg08K`), e a página de teste da assinatura (com o logo da empresa) ficou só na pasta temporária da sessão. **Sem código, migration, dependência nem chave nova no `.env`.**

Em 2026-10-16 (no trabalho): a exploração do símbolo (`docs/marca.md`, "O símbolo"; `docs/identidade/referencias.md`, "2026-10-16") e a foto do trabalho (sem mudança à tarde). No Figma (arquivo Andon): a página nova **"Símbolo"** (a estrela na trave do Claude, um componente com cópias em 96, 32 e 16 px) e, na página "Logo", os Frames 12 a 18 de Matthew e quatro estudos do Claude ("Rachadura · degrau", "Rachadura · raio", "Quadrado · degrau", "Quadrado · raio"). **Sem código, migration, dependência nem chave nova no `.env`.**

Em 2026-10-15/16 (em casa): o ambiente de casa configurado (o CLI do Claude Code no WSL, os 6 plugins, a tabela das marketplaces no `SETUP.md` §12.4), a foto de casa (o Compose foi para a 5.6.0) e, na marca, o `docs/identidade/referencias.md` (as referências de hoje), o nome novo do arquivo do Figma no `docs/marca.md` e o `docs/identidade/paleta.html` apagado (decisão de Matthew: o visual da marca fica **só no Figma**; os valores continuam nas tabelas do `docs/marca.md`). No Figma: os três esboços do A do Claude (página "Logo") e os Frames 7 e 8 de Matthew, com as referências ao lado. **Sem código, migration, dependência nem chave nova no `.env`.**

Em 2026-10-14, noite (na nuvem): `docs/identidade/referencias.md` (novo:
o moodboard em texto; as imagens de outros autores ficam fora do
repositório, que é público) e o `docs/marca.md` (a ideia, o território
Palpável, a Palpável no lugar da Luminosa, o Dusk & Dawn e a luz da paleta
suspensos). Fora do Git: a página **"Moodboard"** no Figma (vazia: o envio
de imagem foi bloqueado, ver §5) e duas páginas privadas de estudo
(estrela-d'alva: https://claude.ai/artifact/YDnRtR9nZRykjXUG5xhtwc;
Palpável: https://claude.ai/artifact/7gTCKVdH89C4mmYg92QJsf). O
`CLAUDE.md`, o `ui-ux.md` §1, o plano e o changelog ainda dizem "Dusk &
Dawn": atualizar todos de uma vez quando o nome sair. **Sem código,
migration, dependência nem chave nova no `.env`.**

Em 2026-10-14 (no trabalho): só conversa sobre o nome e o logo (§6, item 2) e a foto do trabalho (o Docker Compose foi para a 5.6.0). Nenhum documento de marca mudou.

Em 2026-10-13 (no trabalho): o bloco A fechado (PR #11) e a B1 aberta
(PR #12), com o `docs/marca.md` (brand brief, paleta, fonte, o que
evitar), o `docs/identidade/paleta.html` (apagado em 2026-10-16: o visual da marca fica só no Figma) e os registros no `ui-ux.md`
(identidade, tema claro e escuro, a fonte U3), no plano e no changelog
("Fase B1"). Fora do Git: o arquivo do Figma **"Dusk & Dawn —
Identidade"** (time Work; https://www.figma.com/design/t0wty21KOea7v0juDLcxGG),
com a coleção "Tema" (19 cores, 4 modos) e as páginas "Marca", "Fonte" e
"Logo". **Sem migration, dependência nem chave nova no `.env`.**

## 5. Falhas (e o porquê)

| O que falhou | Por quê | Situação |
|---|---|---|
| Na nuvem, Dribbble, softriver.co e o envio de imagem ao Figma (`mcp.figma.com`) bloqueados (2026-10-14) | Política de rede do ambiente da nuvem | Referências por **captura anexada** no chat; no Figma, arrastar à mão ou liberar `mcp.figma.com` nas *Allowed domains* do ambiente |
| Os símbolos desenhados pelo Claude foram recusados duas vezes (2026-10-14) | Ilustravam a frase da ideia com geometria em código: viraram ícones conhecidos (layout, usuário, "expandir") e sem acabamento | A forma final sai da mão de Matthew no Figma; Claude dá critério, crítica e o teste em 16 px |
| Na nuvem, a suíte caiu com `Could not find a working container runtime strategy` (2026-10-09) | O `dockerd` da sessão morreu sozinho entre uma rodada e outra | Claude: `docker info` antes de cada suíte, e ligar o `dockerd` de novo (`SETUP.md` §13) |
| O teste de corrida do envio da NC passou **sem** a trava (2026-10-09) | Com o `Promise.all`, a corrida acontece em 1 de 4 rodadas | Testes de corrida pelo `pausarNoMeio` (pausa entre conferir e gravar): vermelho sempre sem a trava, verde sempre com ela |
| A primeira trava do B32 deu *deadlock* (500) | O `FOR UPDATE` segura também a chave estrangeira da auditoria que aponta para a pessoa (os dois ADMINs se esperavam) | `FOR NO KEY UPDATE`, a trava do `UPDATE` (no `CLAUDE.md`, "Trava entre linhas") |
| A foto do ambiente gravou uma barra de "Downloading" no lugar das extensões do VS Code (2026-10-22) | O `code --list-extensions` do `npm run ambiente` pegou o servidor do VS Code no WSL se atualizando (o mesmo gatilho de 2026-10-07) | Foto desfeita (`git checkout`) e refeita depois; o servidor terminou sozinho e continuou funcionando. Claude: ler o diff da foto antes do commit. Melhoria possível: o script recusar a saída com "Downloading" |
| No Figma, símbolos saíram em branco (◐ ⧗ ＋ ⋯ e, às vezes, ●) | A Figtree não tem esses caracteres | Claude: ícone em SVG (o Lucide) ou só texto; conferir na captura, não só no retorno do script |
| O anel de foco feito com sombra saiu cortado ("quadrado") | O quadro do formulário cortou a sombra | O anel como contorno num quadro com 2 px de folga, como o `ring` do shadcn |
| Depois de trocar telas, uma tela mais alta passou da borda da seção | As seções do Figma não crescem sozinhas | Claude: depois de cada mudança, conferir telas fora da seção e seções sobrepostas, e reempilhar |
| `npm audit`: 4 vulnerabilidades altas | Herdadas do Prisma 7 | **Aberto**, risco baixo — `docs/trd.md` §13. Nunca `npm audit fix --force` |
| Aviso "Update available 7.10.0 → 8.0.0-rc" do Prisma | É release candidate e versão major | **Não atualizar** |
| CI do PR #13 vermelho no `osv-scanner` (2026-10-21): 6 alertas novos no `vite` 8.3.2 (1 alto), de desenvolvimento, transitivo do Vitest | Alerta publicado depois do último CI; não é da mudança da B2 (a `main` também acusaria) | **Resolvido** (2026-10-22, no trabalho): `npm update vite` → 8.3.5 (`0f9f5ef`), suíte verde (489, 97,47%) e o CI do #13 verde |
| Na nuvem, a suíte caiu com 0% de cobertura e `429 Too Many Requests` (2026-10-21) | O Docker Hub limitou o download da imagem do Postgres sem login | Claude: baixar pelo espelho do Google e dar o nome original (`docker pull mirror.gcr.io/library/postgres:17-alpine` e `docker tag ... postgres:17-alpine`; o mesmo para o `testcontainers/ryuk:0.14.0`) |
| O wireframe T-12 afirmou que a API não reativa setor (2026-10-21), e a rota existia desde a A6 | A lista das rotas foi lida com `head`, que cortou a última | Corrigido no mesmo dia. Claude: ler a lista **inteira** (sem `head`) antes de afirmar que algo não existe |
| No Figma, o menu da pessoa e as notas da casca saíram com 14 e 32 px de altura (2026-10-21) | O `resize()` depois do `primaryAxisSizingMode = "AUTO"` volta a altura para FIXED (a skill `figma-use`, regra 12c, avisa) | Corrigido no mesmo dia. Claude: no Figma, `resize()` **antes** dos modos de tamanho; e conferir as alturas na leitura de volta, não só na captura |
| Aviso no CI: `ubuntu-latest` vira Ubuntu 26 em 19/10/2026 | Migração do GitHub | O CI da `main` passou em 2026-10-20, já no Ubuntu novo; se quebrar, começar por aqui |
| `npx biome` rodou um pacote errado pelo Node do Windows | O shell do Claude não carrega o nvm | Claude: `source ~/.nvm/nvm.sh` antes de npm/npx, e `npx --no-install` |
| `npm run -s lint \| tail -1` mostrou saída vazia com erro | O `-s` esconde o resumo, e o erro fica acima da última linha | Claude: conferir o lint pelo **código de saída** (`&& echo LINT_OK`) |
| Foto do ambiente tirada pelo Claude acusou `claude code: não instalado` | O shell do Claude não tem `~/.local/bin` no `PATH` (o CLI está lá, 2.1.280) | Linha corrigida à mão. Claude: `export PATH="$HOME/.local/bin:$PATH"` antes do `npm run ambiente` (ou o script procurar lá) |
| Uma prova de quebra com `git checkout` apagou uma função ainda não commitada | O checkout volta ao último commit, não ao estado antes da quebra | Claude: em arquivo com mudanças não commitadas, **copiar antes** e restaurar pela cópia |
| `prisma migrate reset` recusado quando pedido pelo Claude | O Prisma 7 detecta agente de IA e exige o consentimento do usuário naquele momento | Claude: perguntar com o comando exato e passar a resposta em `PRISMA_USER_CONSENT_FOR_DANGEROUS_AI_ACTION` |
| `prisma migrate dev` não atualizou os tipos | No Prisma 7, ele não roda o `generate` sozinho | Depois de migration nova: `npx --no-install prisma generate` (o `npm run preparar` já faz) |
| Laço de espera do Claude ficou "em execução" | O `pgrep -f` achava o próprio laço | Claude: não esperar com `pgrep -f` do próprio texto; parar tarefa pelo app (`TaskStop`) |
| O teste de concorrência do publicar passava **sem** a trava | Com uma conexão só aberta, a segunda requisição esperava abrir a dela (~20 ms) e a transação curta já tinha acabado | `abrirDuasConexoes()` antes do `Promise.all` (no `CLAUDE.md`) |
| `npm audit fix --omit=dev --dry-run` ia **remover** o Vitest | O `--omit=dev` serve para conferir, não para consertar | Nunca `--omit=dev` no `fix`; só `npm audit fix` (sem `--force`) |
| O dependency-cruiser analisava 0 arquivos | Só lê TypeScript até a versão 6 | Arquitetura no Biome. Ferramenta nova: **rodar e conferir que ela analisa algo** antes de confiar no verde |
| O Semgrep acusou injeção no `ci.yml` | `${{ github.base_ref }}` dentro de `run:` vira texto do comando | Variáveis do GitHub em `run:` sempre por `env:` |
| No WSL, sem `pip` nem `venv` para rodar ferramenta Python | O Python do Ubuntu vem sem eles | Claude: o binário do `uv` na pasta temporária da sessão, com o cache lá também |
| O PC desligou no meio da sessão | — | Nada se perdeu (commits e arquivos salvos); as ferramentas na pasta temporária somem, e o CI baixa as dele |
| Uma rodada da suíte terminou em 1 min 16 s com **0% de cobertura** (2026-10-06) | Nenhum teste chegou a rodar; o filtro da saída escondeu a causa. A rodada seguinte, com o mesmo código, passou | Provável falha na subida do container. Claude: guardar a saída inteira da suíte num arquivo antes de filtrar |
| Sonda com `tsx` reclamou de *top-level await* | Arquivo `.ts` fora do projeto vira CommonJS | Claude: sonda com extensão `.mts` |
| Sonda `.mts` na pasta temporária não achou o `fastify` | Fora do projeto não há `node_modules` | Claude: cópia temporária na raiz do projeto, apagada logo depois (ou importar o `app.ts` pelo caminho absoluto) |
| Teste do RN-17 estourou os 15 s (2026-10-06) | Máquina lenta: Apple Music aberto no navegador | Fechar o player antes da suíte; o teste passou na rodada seguinte |
| Teste do B9 quebrou na fatia 5 | Ele esperava o `detectadoEm` com hora, o formato do bug B22 | Ajustado para o dia (o objetivo do teste não mudou). Ao replicar nas outras entidades, testes que esperem data com hora ou `portaoAtual` mudam junto (ex.: `contencao.routes.test.ts:226`) |
| Janela do VS Code no WSL não abria depois da atualização (2026-10-07) | O `npm run ambiente` chamou o `code` do WSL no meio da atualização: o servidor novo ficou descompactado numa pasta temporária, sem o último passo da instalação, e a versão antiga já tinha sido apagada | Resolvido: a pasta da versão em `~/.vscode-server/bin/` tirada do caminho, e o VS Code reinstalou ao reconectar. Claude: **não tirar a foto com o VS Code atualizando** |
| Commit da fatia 7 do B23 entrou com a suíte vermelha (2026-10-07) | O comando lia o resultado da suíte e commitava em seguida, sem conferir o código de saída; e o `Confere` do teste novo comparava com o objeto do cenário, que já tinha sido editado (o vermelho parou no 500 antes de chegar nele) | Corrigido antes do push (`--amend`, local). Claude: o commit só roda **depois de conferir** o código de saída da suíte (`if [ $r -eq 0 ]`); e a conferência de "não mudou" compara com uma leitura feita **antes** da chamada, nunca com o objeto do cenário |
| CI do lote 3 vermelho no `diff-cover` (2026-10-07) | O catálogo `AcaoAuditada` era um objeto que ninguém carregava (só o tipo era importado): a linha ficou sem cobertura, e o `diff-cover` só roda no CI | Resolvido: o catálogo virou só um tipo. Claude: rodar o `diff-cover` **antes de todo push** (`uvx diff-cover==10.6.0 coverage/cobertura-coverage.xml --compare-branch=origin/main --fail-under=100`, com o `uv` na pasta temporária da sessão) |
| CI vermelho no `verificar` sem nenhum teste rodar (2026-10-09, três vezes) | O Testcontainers baixa o Postgres e o `ryuk` do Docker Hub: primeiro o limite de downloads sem login (as máquinas do GitHub dividem endereços), depois erros 500 e timeout do próprio Docker Hub | Login no CI (`1ee4df0`); a instabilidade é do Docker Hub, e não há o que consertar no código: rodar de novo depois. **Sintoma:** "No test files found" e cobertura 0% — ler o erro de baixo (o `Unhandled Error`) antes de mexer nos testes |
| CI vermelho no `osv-scanner` depois do push do handoff (2026-10-09), e ninguém viu até Matthew avisar | Alerta novo publicado de um dia para o outro (`fast-jwt` 6.3.3, GHSA-x937-hj6v-793p, média); o Claude conferiu o CI no `/retomar` **antes** do push, e não depois | Resolvido: `npm update fast-jwt` (6.3.4, dentro da faixa do `@fastify/jwt`). Claude: conferir o CI (`gh pr checks`) depois de **todo** push, até o fim, inclusive o de documentação |
| CI da F6a vermelho no `diff-cover` (2026-10-08): uma linha do `setor.service.ts` sem teste | O `diff-cover` local deu 100% porque o arquivo era **novo e ainda sem commit**: o Git não o rastreava, e ele ficou fora do diff | Resolvido com o teste. Claude: `git add -N` nos arquivos novos antes do `diff-cover` (na `/verificar` §4), ou rodar depois do commit |

**Pendências anotadas:**
- **Servidor de linguagem do TypeScript: feito em 2026-10-22** (`552fb90`,
  `.claude/marketplace/`, escrito por Matthew). O plugin aponta direto
  para o binário em Go do TypeScript 7
  (`node_modules/@typescript/typescript-linux-x64/lib/tsc --lsp --stdio`),
  sem passar pelo `node` (no shell do Claude, o `node` é o do Windows).
  **A navegação funciona** (usos, definição, hover). **O aviso de erro
  depois da edição não chega:** o `tsc --lsp` só entrega diagnóstico de
  arquivo por *pull* (`textDocument/diagnostic`), e o Claude Code escuta
  *push* (`publishDiagnostics`); testado direto no servidor. Os erros de
  tipo seguem no `npm run typecheck`. **Rever** quando sair o TypeScript
  7.1 ou um Claude Code que aceite *pull*. **Em casa:** o projeto já
  declara o marketplace e o plugin; se não ligar, rodar uma vez
  `claude plugin install typescript-lsp@qualityhub --scope project`. O
  caminho do marketplace é absoluto (`/home/matthew/projects/qualityhub/.claude/marketplace`):
  confirmar que em casa o projeto está no mesmo lugar. **Na nuvem** o
  caminho não existe; deve dar só um aviso (o servidor de linguagem nem
  liga lá).
- **Grafo do `understand-anything`** (2026-10-22, `29788d1`): versionado
  em `.ua/` (decisão de Matthew: ele alterna entre máquinas; gerar é caro,
  e o incremental parte do commit gravado no `meta.json`). Tour de 14
  passos em pt-BR, 9 camadas, 368 nós. **Para atualizar:** `git pull` →
  `/understand` (sem nada a mais: só reanalisa o que mudou) → `npm run
  lint:fix` (o Biome formata os JSON, para o diff e o merge andarem por
  linha) → um commit só do grafo, com push na hora (um PC por vez). Quando:
  no fim de cada fase e antes de uma sessão de estudo. **Em casa, na
  primeira vez:** o plugin precisa ser compilado (`corepack pnpm@10.17.1
  install --frozen-lockfile` e `corepack pnpm@10.17.1 --filter
  @understand-anything/core build`, na pasta do plugin em
  `~/.claude/plugins/cache/understand-anything/…`). **O painel:** o atalho
  do plugin baixa o visualizador de um link, e o npm recusa
  (`EALLOWREMOTE`, trava de segurança: não contornar); o que funciona é o
  Vite local, `GRAPH_DIR=<projeto> ./node_modules/.bin/vite --host
  127.0.0.1` na pasta `packages/dashboard` do plugin (o link sai com
  `?token=`).
- **Mobbin: o fluxo foi testado e funcionou** (2026-10-22, nas decisões
  (b), (c) e (e)): o que a tela faz, telas reais com links, as variantes
  lado a lado no Figma e Matthew decidindo pelo que vê. Pode virar a skill
  `/desenhar` quando ele quiser.
- **Mobbin** (assinado em 2026-10-22; o MCP oficial é hospedado, em
  `https://api.mobbin.com/mcp`, com login pelo navegador): **conectado**
  na sessão de 2026-10-22, tarde (busca de telas, fluxos e seções, e as
  coleções). Se sumir: conector adicionado com a conversa aberta só
  aparece numa sessão nova; pelo terminal do WSL, `claude mcp add
  --transport http --scope user mobbin https://api.mobbin.com/mcp`.
  **Fluxo proposto** (Mobbin + Figma + skills, a testar uma vez antes de
  virar skill `/desenhar`): (1) o que a tela faz, pelo `ui-ux.md` §7 e o
  `fluxo-app.md`; (2) 5 a 8 telas reais pelo Mobbin, resumidas, e Matthew
  escolhe uma ou duas com uma frase (imagens fora do repositório); (3) as
  regras: as skills (`design-taste-frontend`, `apple-design`,
  `mobile-native`), Apple HIG e Material para os números, e as nossas
  (`marca.md`, `ui-ux.md` §9); (4) duas variantes lado a lado numa seção
  "Decisão" no Figma, com os tokens ligados; (5) Matthew decide, e o
  Claude registra nos documentos e no checklist.
- **Figma pelo conector, três armadilhas da B2 (2026-10-23):** (1) uma
  cor ligada a variável e criada com `setBoundVariableForPaint` sobre o
  preto às vezes sai **preta** numa cópia (as divisórias e o medidor); o
  conserto é copiar a cor (`fills`/`strokes`) de um nó que já está certo.
  (2) Os símbolos ● ⧗ ✓ **não existem na Figtree** e somem conforme o zoom:
  ícone é sempre SVG (o `Item/Estado` virou um conjunto por isso). (3)
  Chamada que falha é desfeita inteira, sem resto; mas o `clone()` de um
  componente já nasce componente (o `createComponentFromNode` recusa), e
  não se põe filho dentro de uma instância. (4) O `get_screenshot` e o
  `screenshot()` não desenham o que fica abaixo da dobra de um frame de
  celular (sai 1 px): para conferir, uma cópia solta do nó, apagada depois.
- **Ideia para refinar (`idea-refine`) antes da C0: o Andon como SaaS**
  (2026-10-23, Matthew avalia oferecer a outras empresas; plano, linha da
  C0). Duas partes. (1) O **multi-tenant**: hoje tudo é para uma empresa,
  instalada nela; várias empresas no mesmo sistema mexem no banco, nas
  permissões e na hospedagem (TRD §10.6). (2) O **branding de cada
  empresa**, sem espalhar o logo: a interface é do Andon (a cor tem
  função: estado, prazo), e a empresa aparece **onde ela fala**. Do mais
  profundo ao mais visível: a **língua** dela (o glossário: RNC, desvio,
  ocorrência; o prefixo dos códigos; os setores), os **documentos que saem**
  (o PDF, a NC exportada para o auditor e o e-mail, com a identidade
  inteira), a **porta de entrada** (o logo no login, o nome na saudação, o
  endereço próprio), **um toque de cor** num token só (`marca/toque`,
  reservado na B3, com o contraste conferido) e a **assinatura** que já
  existe. A empresa informaria 5 coisas: o logo em SVG, o nome, uma cor
  (opcional), o glossário e o prefixo. Barato fazer já: a empresa como
  dado, nunca escrita no código. 🐴 O mínimo para o MVP: o glossário e a
  assinatura.
- **Ideia para refinar (`idea-refine`) antes da C3: a atividade recente
  na tela inicial** (2026-10-20, da referência do Flowio,
  `docs/identidade/referencias-interface.md`). O que aconteceu nas NCs que
  a pessoa acompanha, mesmo sem ser pendência dela, ao lado da lista da
  Pendências (no computador). **Escopo novo:** o feed é por item (RF-11)
  e não há rota que junte vários itens; mexe no backend e no PRD.
- **Figma na conta pessoal (2026-10-20):** o arquivo saiu do time Work
  (motivo de Matthew: separar do trabalho) e está no time "Designing"
  (`docs/marca.md`). No plano Starter, o conector do Claude parou depois
  de ~15 chamadas. O SheerID aprovou a licença de estudante (2026-10-21):
  o `whoami` do conector mostra o "Designing" no plano `student`, com
  assento Full. Na B2 (2026-10-21), umas 25 chamadas seguidas passaram sem
  bloqueio (no Starter, parava em ~15). **Desde 2026-10-23, no time
  "Andon"** (um time só para a plataforma; o mesmo arquivo e a mesma chave,
  os links continuam valendo): o `whoami` mostra o "Andon", `student`,
  assento Full, e o Code Connect segue recusado pelo conector.
- **Classificação, reincidência e segregação** (2026-10-07, com a
  analista): PRD Q19–Q22, na C2 como proposta (a 3ª ocorrência aceita a
  Menor com justificativa; colaborador e aprovador excludentes por item;
  Classificação sem portão).
- **Ideia para refinar (`idea-refine`) depois do B23:** NCs da própria
  Garantia da Qualidade aprovadas só por auditores (interno ou externo),
  talvez por link externo temporário (PRD §4.3). Um link é uma
  credencial: validade, uso único, um item só, auditoria; conversa com a
  sessão (A4) e com a D0. A persona "auditor externo" (`VISUALIZADOR`)
  já existe no PRD §3.1.
- **⚠️ Em casa, trocar o `JWT_SECRET` do `.env` (prioridade).** Tokens
  de desenvolvimento antigos estão no histórico de um repositório
  público (exceção X2); se o segredo de casa ainda for o antigo e fraco,
  ele pode ser descoberto por força bruta a partir desses tokens. Gerar
  com `openssl rand -base64 32` (o servidor também recusa subir com
  menos de 32 caracteres, auditoria L8). E recriar o container do banco
  (`docker compose up -d`) para a porta ficar só em `127.0.0.1` (L7).
- **Tela inicial: rever quando o QualityHub ganhar outros módulos**
  (pedido de Matthew, 2026-10-05). A lista `TelaInicial` e a regra papel
  → tela (`modulos/auth/tela-inicial.ts`) são do MVP de NCs.
- **Falhas de login só no log (E1):** reavaliar na D0, junto com a
  retenção do log (anotado no plano).
- Melhoria, não regra: o Semgrep avisa (severidade baixa) que as actions
  do CI usam tag solta (`@v7`) em vez do commit fixo.
- Os scripts `verificar:rapido`, `verificar:item` e `scripts/piso.mjs`
  (anotados na abertura da A4) **não** foram feitos e não estão no plano
  nem no contrato: opcionais, se Matthew quiser automatizar o §4 do
  `CONSTRAINTS.md`.
- **Node 26 vira LTS em 28/10/2026.** Depois disso, avaliar a migração:
  conferir o suporte do Prisma 7 e das dependências; ao migrar, trocar o
  corpo do `hojeEmSaoPaulo()` por
  `Temporal.Now.plainDateISO("America/Sao_Paulo").toString()` (os testes
  da função provam a troca). O Node 24 tem segurança até 30/04/2028.
- Na D1: excluir `**/*.test.ts` e `src/testes/` do build.
- **Auditoria do Ponytail** (2026-10-13): o código morto vai no começo do
  C0 e o `dotenv` na D1 (os dois anotados no plano). Ficaram de fora,
  anotados aqui: o portão `EXECUCAO` sem uso (tirar valor de enum no
  Postgres pede recriar o tipo; fazer junto de outra migration no enum) e
  o `export` dos `*BaseSchema` usados só no próprio arquivo (opcional).
- **Suíte em ~140–160 s.** Medir antes de otimizar; um banco por worker
  é a opção de maior ganho. **Não** montar cenário direto no banco.
  Os testes de função pura também sobem o Postgres (~15 s): um "projeto"
  do Vitest sem banco para eles é configuração (de Matthew, se quiser).
- **Rever o `podeExecutar`** (colaborador **ou** aprovador designado × o
  PRD §8, que pede colaborador): com a Q22 (colaborador e aprovador
  excludentes), o aprovador não faz o que é do colaborador. Resolver na
  C2, junto da Q22.
- **Ordem da permissão no `buscarPorIdX`** (lote 5, 2026-10-08): a
  busca com tipo vem antes do `VISUALIZAR`, então quem não tem o papel
  distingue 404 de 403 (como a L5). Risco nulo hoje (todo papel
  visualiza); rever na C2, com o `podeExecutar`.
- **Aprovador na lista das guardas: na C2** (decidido em 2026-10-01).
  Hoje o `cicloVidaService.submeter` confere o aprovador **antes** da
  guarda do tipo, então a NC sem aprovador recebe o 409 genérico, sem a
  lista do que falta (só mensagem; a regra está protegida, e a tela usa
  o checklist). Na C2, quando os seis tipos ganharem a lista do envio,
  o aprovador entra nela para todos de uma vez. Registrado no plano (C2)
  e no esquema §4.3.
- A **triagem** de filho publicado sem aprovador (parte da RN-46) fica
  para a C3 (pendências).
- **Segregação de funções** (auditoria de 2026-10-02, seção 3):
  respondida pela analista em 2026-10-07 (PRD Q22). Fica técnica, para a
  C2: o `cicloVidaService.cancelar` confere `GERENTE` direto, sem o
  catálogo de permissões.
- ~~No trabalho, o Prettier no lado Windows do VS Code~~ (desinstalado,
  foto de 2026-10-16). O Copilot
  ficou desligado no projeto (`.vscode/settings.json`) e nas
  configurações do trabalho.

## 6. Próximo passo

0. ~~O Zod 4.6.6~~ (feito em 2026-10-23, no fim do dia: o `zod` foi para a 4.6.7, que corrige o GHSA-mrhx-c7xc-m3w5, alto, achado pelo `osv-scanner` no CI do `dcfb536`; suíte 489, 97,47% das linhas, 286 s). O risco prático era baixo (toda lista de entrada tem teto: a trava L4 do `app.test.ts:175-209`).
1. ~~`/comecar-fase` da B1~~ (PR #12, rascunho) e ~~a sessão 1, a
   direção~~ (2026-10-13): o **`docs/marca.md`** (brand brief) é a base
   de tudo daqui em diante.
2. ~~A B1~~ (fechada em 2026-10-20, PR #12; o caminho todo no changelog,
   "Fase B1"). A marca (nome e símbolo) é uma pendência sem prazo, com
   três perguntas em aberto no `docs/identidade/referencias.md`
   ("2026-10-20"); só uma informação nova reabre uma decisão.
3. **A B2, na ordem do plano** (seção "B2 — a ordem dos itens", com os
   itens 8 a 14 replanejados em 2026-10-23). **Feitos:** do 1 ao 11. **Próximo:
   o item 12**, a seção 4 do checklist: a T-07 dos cinco filhos (Classificação,
   Contenção, Verificação com o diálogo, Ação Corretiva e as duas
   Investigações), nos dois tamanhos. O que já se sabe: no celular, a T-07
   **não segue** o padrão da NC; os filhos ganham o **bloco do título claro**,
   com a NC em cima (o gesto 1, `ui-ux.md` §6.2). **Como revisar** (combinado
   em 2026-10-23): só a **estrutura** (o acabamento é da B3) e os **gestos 1 a
   4**; cada seção preenche a parte dela nas tabelas do G1 (o checklist §6);
   achado de estrutura se corrige no Figma, achado de acabamento vai para a
   B3; quando a frase de Matthew abre uma decisão de desenho, a `/desenhar`
   (as referências no Mobbin, as duas fichas, a escada do componente).
   Depois: o 13 (T-08 a T-12 e o convite) e o 14 (o menu "Mais" com Cancelar,
   Retirar, Reabrir e Excluir rascunho; o G1 fechado; o `/abrir-pr`).
   **A B3** (branch nova, pela `/comecar-fase`) segue o `ui-ux.md` §2.2 e a
   ordem do plano: os primitivos (e o `marca/toque` reservado), o script de
   valor solto, os átomos (o Botão de Matthew, o Campo, o Estado, já em
   conjunto com os ícones, o Ícone e o Avatar) e as telas na ordem das fatias
   C. Os achados de acabamento já anotados: os 72 chevrons de texto, o ícone
   do olho do `Campo/Senha`, o título da doca, o ⚠ e o ícone da etapa, o campo
   com erro e com foco. **Referências de interface:** até 5 por dia, com uma
   frase de Matthew.
4. **Passeio guiado, em três sessões curtas (20–30 min) durante o B.**
   ~~A4~~ (2026-10-21, na nuvem, pelo tablet): uma requisição de ponta a
   ponta (`POST /contencoes/:id/submeter`), 9 paradas. **Sólido:** a
   transação, a ordem do validador (estado e permissão antes do tipo), a
   trava do B19 (o `where` com o estado e o 409 do segundo clique), a
   auditoria na mesma transação, o `httpOnly`. **A revisitar:** o B23 e o
   `buscarRegistroDoTipoOuFalhar` (escrito por ele na A5), os códigos 409
   × 403 × 401, o `podeExecutar` = papel + atribuição, o `secure` (só manda
   o cookie em HTTPS), site × domínio no `SameSite` (CSRF) e o `path:
   "/api"`. ~~A6~~ (2026-10-21, na nuvem, pelo tablet): o Rui inativa a
   Beltrana (a tela T-10) e o convite de ponta a ponta (emitir e definir a
   senha), 3 paradas. **Sólido:** a recusa da RN-43 com a lista, por que
   os itens abertos travam, o hash do token, revogar os convites antigos,
   o `marcarComoUsado` como o B19. **A revisitar:** a idempotência (o
   inativar de quem já está inativo), os fechados como evidência, o
   convite antigo que voltaria a valer na reativação, por que o token
   aparece uma vez só (consequência do hash), o oráculo da mensagem única
   e a conexão presa numa transação longa (o bcrypt fora dela). **A7, feita
   em parte** (2026-10-22, madrugada, pelo tablet): a corrida do B29 (a
   Fulana envia a NC enquanto o Ciclano cria uma investigação). A parada 1
   (por que o B19 não pega uma corrida entre **duas linhas**, e os dois
   lados travando a linha da NC) ficou entendida **depois** da
   explicação; as respostas dele erraram nos dois pontos. A parada 2 (o
   teste do `pausarNoMeio`: onde pausa, o 200 e o 409, a contagem) foi
   "não sei" e foi explicada. **Repetir a parada 2** num dia descansado, no
   PC, com o `nc.routes.test.ts:225` aberto e Matthew explicando: é o que
   falta do portão para o C0.
   O roteiro original:
   (plano, portão "fundação pronta"; condição para o C0): A4 (o B19 e o
   `SameSite=Strict`), A6 (a RN-43 e o convite) e A7 (a trava entre
   linhas, um teste do `pausarNoMeio` linha a linha). Matthew diz o que
   cada parte faz antes de Claude explicar. Roteiro da A4: uma requisição
   de ponta a ponta (rota → controller → service → `cicloVidaService` →
   `buscarRegistroDoTipoOuFalhar` → `aplicarTransicao` →
   `registroRepository.atualizar` → banco → auditoria → resposta). O
   `/understand-anything:understand` antes é opcional (colinha §6).
5. Depois do B e do passeio: a C0 (com o `operationId` antes do Orval,
   plano C0).

Da revisão de design das APIs (2026-10-07), anotados para a C1/C2:
**R7**, o erro sem código para máquina (os 409 diferentes só se
distinguem pelo texto; acrescentar um `codigo` é aditivo) e **R8**, o
`DELETE /registros/:id/colaboradores` com corpo (decidir com a tela;
ainda barato de mudar). Sugestões antigas sem prazo: o `logout` sem
`autenticar` não apaga o cookie de sessão vencida; o `include` de papéis
no `buscarPorEmail` sobrou; o `gitleaks detect` vira `gitleaks git` nas
versões novas.

**Chegando em casa:** desde a última foto de casa (`be8fc77`, 2026-10-16): **sem migration nem chave nova no `.env`**; dependências novas no lockfile (vite 8.3.5, fastify 5.12.7, ip-address 10.7.4): o **`npm run preparar`** resolve. Rodar o **`/retomar`**, e **`git switch fase/b2-wireframes`** (a branch nova; a `fase/b1-identidade-visual` foi mesclada e apagada no GitHub: apagar a local com `git branch -d`). Desde a última foto de casa (`be8fc77`): **sem migration, chave nova no `.env` nem dependência**. Se o `npx skills` também instalou cópias das skills do agent-skills e do taste-skill em casa, dá para apagá-las como foi feito aqui (os plugins já trazem as mesmas). **Desde 2026-10-13: criar o `~/.config/ponytail/config.json` com `{ "defaultMode": "lite" }`** (o Ponytail vem em `full` sem ele; regra no `CLAUDE.md`). Desde 2026-10-09: **chave nova no `.env`, a `URL_DO_SISTEMA`** (copiar a linha do `.env.example`; sem ela, o `npm run ambiente` acusa a falta) e o `fast-jwt` 6.3.4 (o `npm run preparar` resolve). A A5 trouxe **duas dependências** (`@fastify/swagger`, declarado, e `@fastify/swagger-ui`, de desenvolvimento): o `npm run preparar` resolve. Sem migration nem chave nova no `.env`. Desde a última vez que a
branch foi usada em casa (antes da A3): as migrations da A3 e a **M1**
(`sessao_e_preferencia_do_usuario`), e **dependências novas** (cookie,
rate-limit, helmet, cobertura, Vitest 5.0.3). O `npm run preparar`
resolve as duas coisas. Os passos (`SETUP.md` §12.1 se o PC estiver
parado há tempo):

1. Docker Desktop aberto ("Engine running"), Ubuntu, pasta do projeto.
2. `git fetch`, `git switch fase/b1-identidade-visual`, `git pull`.
3. **`npm run preparar`**: obrigatório. Se a migration do
   `investigacaoId` falhar (o banco de casa tem ações sem investigação),
   recriar o banco: `SETUP.md` §12, passos 6 e 7.
4. **`JWT_SECRET` novo**, com 32 caracteres ou mais (pendência ⚠️
   acima), e `docker compose up -d` para recriar o container (porta só
   em `127.0.0.1`).
5. Extensões do VS Code: `SETUP.md` §12.4. Conferir `node -v` (24).
6. **Primeira foto de casa:** `npm run ambiente -- casa` e depois
   `npm run ambiente -- comparar` (`SETUP.md` §12.5). Commitar o
   `docs/ambiente/casa.txt`.
7. `npm run test:cobertura`: **489 passando**, cobertura acima de 94,66% (com os players do navegador fechados, para a suíte não passar de ~5 min).
