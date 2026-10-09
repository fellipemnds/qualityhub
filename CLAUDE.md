# QualityHub — contexto para o Claude Code

Sistema de gestão de Não Conformidades (ISO 9001:2015, cláusula 10.2),
construído do zero por Matthew, aprendendo backend full-stack no processo.
Este arquivo é o ponto de entrada rápido.

**Idioma: responder sempre em português do Brasil.**

**Princípio do produto:** funcional e sem risco de falha vale mais que
entregar rápido.

**Contrato de qualidade: ler o `CONSTRAINTS.md` antes de escrever
código.** Nenhum agente afrouxa essa régua para uma mudança passar —
check vermelho se resolve consertando o código; afrouxar só em commit
próprio, com aprovação de Matthew (`CONSTRAINTS.md` §6).

## Documentos (planejamento concluído em 2026-09-24)

| Documento | Responde |
|---|---|
| `docs/prd.md` | O quê e por quê: escopo do MVP, regras de negócio RN-xx, permissões, decisões com a analista |
| `docs/fluxo-app.md` | Telas, navegação, etapa calculada da NC, jornadas, ações por estado, "Minhas pendências" |
| `docs/ui-ux.md` | Fundações visuais, componentes (shadcn/ui), wireframes em texto, textos da tela |
| `docs/trd.md` | Stack, sessão, API, anexos, testes, infraestrutura, hospedagem, ADR-33 a ADR-38 |
| `docs/esquema-backend.md` | Modelo de dados, mudanças M1–M5, valores calculados, contrato da API, correções B1–B36 |
| `docs/plano-implementacao.md` | **Ordem de execução**: fases A0–A7 (fundação do backend), B (design), C0–C8 (frontend em fatias), D (produção) |
| `docs/changelog-arquitetura.md` | Registro de toda decisão de arquitetura e divergência do documento original. **Leia antes de propor mudança estrutural** |
| `docs/arquitetura.md` | Documento de design **original** (histórico). Onde diverge dos documentos acima, eles valem |

## ⚠️ Início de toda sessão: ler `handoff.md`

**Antes de qualquer outra coisa, leia o `handoff.md`** (na raiz). Ele
guarda o estado da sessão anterior: objetivo, onde paramos, arquivos no
meio de uma mudança, o que falhou e o próximo passo. Depois de ler,
confira a branch (`git status`) e diga a Matthew, em poucas linhas, de
onde vamos retomar.

**No fim de toda sessão** (ou quando Matthew disser "vou trocar de
computador"), atualize o `handoff.md` — as mesmas 6 seções, apontando
para os outros documentos em vez de repetir o que já está neles.

Ainda pendente fora do código: hospedagem (TRD §10.6), identidade
visual.

**Bugs conhecidos:** `docs/esquema-backend.md` §7 (B1–B36; os
corrigidos têm ✅). A A3 corrigiu B1–B6 e B8–B18, e a RN-48 entrou como
regra nova (fase fechada em 2026-10-02, PR #4). A A4 corrigiu o B19
(transições sem trava sob concorrência) e o B7 (papéis no token), os
dois em 2026-10-05, e o B21 (erro 4xx do Fastify respondia 500) e o B20
(a API aceitava corpo `text/plain`), em 2026-10-06 (fase fechada em
2026-10-06, PR #6). A A5 corrigiu o B23 (as rotas aceitavam o `id` de
um item de outro tipo) e o B24 (editar não mudava o `atualizadoEm`), em
2026-10-07, e o B22 (dia de calendário saía com hora na resposta), no
mesmo dia, com os schemas de resposta. O B25 (o `finalizar-execucao`
aceitava o `id` de outro tipo, a rota que escapou do B23) foi achado e
corrigido em 2026-10-08, pela trava do B23 no `app.test.ts`, e o B26
(e-mail sem teto, que deixava um anônimo encher a memória pela chave do
limite de tentativas), no mesmo dia, na revisão de segurança da fase
(fase fechada em 2026-10-08, PR #8). A A6 corrigiu o B27 (um login feito
durante a derrubada das sessões sobrevivia a ela; a data virou a
`versaoSessao`), em 2026-10-08, e o B28 (uma pessoa inativa podia ser
designada aprovadora ou colaboradora, o que contornava a trava da
RN-43), em 2026-10-09, achado na revisão da fase (fase fechada em
2026-10-09, PR #9). A A7 corrigiu o B29
(o filho novo nascia com a NC em aprovação ou fechada; RN-51) e o
B30–B36 (sete regras que conferem outras linhas quebravam com duas
requisições ao mesmo tempo), em 2026-10-09, achados na revisão de
concorrência da A6. **Nenhum bug aberto.**

**Ambiente:** os testes (Testcontainers) precisam do **Docker Desktop
aberto** — a integração com o WSL está confirmada (2026-09-24), mas com
o Docker Desktop fechado o comando `docker` some do WSL. O `gh` está
instalado e autenticado neste computador (escopos `repo` e `workflow`);
Claude pode abrir PRs e ler o CI com ele, e o `git push` também
funciona por ele (2026-10-06). Desde 2026-10-08, **Claude dá o push**
(autorização de Matthew): depois da `/verificar`, só na branch de
trabalho, nunca na `main` e nunca com `--force`. O merge é de Matthew.

**Dois computadores:** Matthew alterna entre o do trabalho e o de casa
(mesmo ambiente: Windows + WSL2 + Docker Desktop + nvm; `SETUP.md` §12).
**Saindo** ("vou trocar de computador"): skill **`/trocar-pc`**.
**Chegando** ("continuar de onde parei"): skill **`/retomar`**. Os
passos estão nas skills (`.claude/skills/`, versionadas, as mesmas nos
dois PCs). Memória e conversas do Claude **não** passam de uma máquina
para a outra — o que precisa sobreviver vai para o `handoff.md`
(estado), para este arquivo (regras) ou para uma skill (rotinas).

**Sessão na nuvem** (desde 2026-10-09): Matthew também usa o Claude Code
na web (pelo iPad), num computador da nuvem descartável. **No começo da
sessão, Claude prepara o ambiente** (Node 24, Docker ligado, `npm ci`,
`prisma generate`; `SETUP.md` §13); depois disso, as mesmas regras dos
PCs (`/verificar`, push só na branch de trabalho). No fim, o
`handoff.md` atualizado e o push — o que não for enviado se perde.

## Como trabalhamos (workflow com Claude)

Matthew é iniciante em desenvolvimento full-stack, aprendendo no processo.
**Claude explica o conceito, Matthew escreve, Claude revisa.** Matthew
quer codar **tudo o que puder ser codado**, inclusive configuração
(Vitest, CI, scripts); Claude só gera o que é **repetição** de um padrão
que Matthew já escreveu e validou.

**Divisão revista em 2026-09-28 (a partir da A1):** Matthew escreve o
que ensina conceito novo — o teste "pronto quando" da A1, o teste de
concorrência da A2 e o B9 (primeiro TDD) da A3; Claude faz o resto,
**na ordem do plano**. **Antes de cada item**, Claude diz se é algo que
Matthew já aprendeu (e aponta o que tiver de novo) e **só executa
depois de ele confirmar**. Matthew revisa tudo e pode pegar qualquer
item de volta. **Ao propor
mudanças, prefira explicar o raciocínio e perguntar antes de reescrever
grandes blocos.**

**Itens 🧑, passo a passo (combinado em 2026-10-05):** Matthew escreve,
guiado em passos pequenos: antes, um passeio curto pelo código que o
item toca; depois, um passo por vez (o conceito, qual arquivo, onde, o
que escrever), e Claude revisa e roda os testes antes do próximo. Sem
colar a solução inteira, salvo se ele pedir. Motivo: com muitos commits
seguidos feitos por Claude, ele deixou de reconhecer o código.

A partir do plano de implementação:
- **Uma branch e um Pull Request por fase**; CI verde para entrar na `main`.
  Começo: `/comecar-fase` (o PR nasce em rascunho). Cada item: `/item`
  (verifica pela `/verificar`). Fim: `/abrir-pr` (revisões da fase e
  "pronto quando") → merge → `/fechar-fase`.
- **Bug começa por um teste que falha.**
- Cada fase termina com o checklist "pronto quando" (plano §1.1).
- **Pedir antes de cada commit**, inclusive dentro da branch da fase,
  mostrando o que entra (Matthew pode pedir o diff antes). O push, Claude
  dá depois do commit (regra em "Ambiente").
- Commit de formatação automática sempre **separado** das mudanças de
  código, para o diff de lógica ficar legível.

## Stack

Node.js 24, TypeScript 7, Fastify 5 (com `fastify-type-provider-zod`),
Prisma 7, PostgreSQL 17, Zod 4. Ambiente: WSL2/Ubuntu, Docker Compose para
o banco. Frontend (planejado, não iniciado): React + Vite + **shadcn/ui**
(não Mantine — ver changelog) + Tailwind.

**Comandos:** `npm run dev` (servidor com recarga) · `npm test`
(Vitest; Docker Desktop aberto) · `npm run test:cobertura` (a suíte
completa com a trava da cobertura, `CONSTRAINTS.md` §2; é o que o CI roda) · `npm run typecheck`
(`tsc --noEmit`) · `npm run lint` (Biome: formatação + lint + ordem dos
imports + regras de arquitetura) · `npm run lint:fix` (corrige o que é automático) ·
`npm run preparar` (`npm ci` + `prisma generate` + `prisma migrate
deploy` — deixa a máquina em dia depois de um `git pull`) · `npm run
criar-admin` (o primeiro `ADMIN`, ou a recuperação dele: pergunta no
terminal e mostra o link de convite; a `URL_DO_SISTEMA` do `.env` vai no
link). O Biome
(2.5.14, versão exata) usa 4 espaços e 120 colunas; JSON com 2 espaços.
Matthew usa a extensão do Biome no VS Code (Prettier desinstalado).
`npm run lint` precisa passar antes de todo commit de código.

## Arquitetura em uma página

- **Supertipo `Registro`**: todas as seis entidades de negócio
  (`NaoConformidade`, `Contencao`, `Classificacao`, `Investigacao`,
  `AcaoCorretiva`, `Verificacao`) compartilham a mesma linha via chave
  primária compartilhada (`id` = FK para `Registro.id`, sem `@default`).
  `Registro` carrega `tipo`, `estado`, `codigo`, `portaoAtual`.
- **Ciclo de vida genérico** (`compartilhado/registro/ciclo-vida.service.ts`):
  `criarRascunho`, `publicar`, `submeter`, `retirar` (RN-48), `decidir`,
  `reabrir`, `cancelar`, `excluirRascunho`, `concluir` — reaproveitado
  por todas as entidades. `submeter` e `cancelar` aceitam um validador
  (a guarda do tipo, depois de estado e permissão).
  `decidir` aceita as opções `{ fecharAoAprovar }` (default `true`)
  para os casos onde aprovar não deve fechar o item (ver `AcaoCorretiva`
  abaixo); o estado depois da decisão sai da função pura
  `estadoAposDecisao` (`compartilhado/registro/estado-apos-decisao.ts`).
  `publicar`/`submeter`/`excluirRascunho` aceitam a `Acao` de
  permissão como parâmetro (default a ação genérica), porque
  `Classificacao` exige `CLASSIFICAR` em vez de
  `PUBLICAR`/`SUBMETER`/`GERENCIAR_RASCUNHO`.
- **Tipo conferido (B23)**: os tipos dividem o `Registro`, e o `id`
  sozinho não diz o tipo. Toda transição do ciclo de vida recebe o
  `tipo` esperado (obrigatório, logo depois do `registroId`), e os
  `GET`/`PATCH` dos services buscam pela `buscarRegistroDoTipoOuFalhar`
  (`compartilhado/registro/buscar-registro-do-tipo.ts`): item de outro
  tipo responde 404, como inexistente. Rota nova que recebe um `id`
  busca por ela; a trava do `app.test.ts` chama toda rota com `{id}`
  com o id de outro tipo e cobra o 404 (achou o B25).
- **Trava de concorrência (B19)**: toda gravação no `Registro` passa
  pelo `registroRepository.atualizar`/`excluir`, que exigem o **estado
  em que o item foi lido** e respondem 409 se ele mudou no meio (outra
  requisição chegou antes). A edição também passa por ele, com os dados
  vazios, só para tocar o `atualizadoEm` (B24). Transição nova passa por eles, de
  preferência pelo `aplicarTransicao`. Teste de concorrência chama o
  `abrirDuasConexoes()` antes do `Promise.all`, senão a corrida pode não
  acontecer e o teste passa sem provar nada.
- **Trava entre linhas (A7)**: a trava do B19 cobre só a linha do
  próprio item. Regra que confere **outras linhas** (os filhos da NC, as
  ações da investigação, os outros ADMINs, as pessoas do setor, os
  colaboradores) **trava a linha de que depende antes de ler**, e os dois
  lados da corrida travam a mesma: `registroRepository.travar` (o pai ou
  o item), `usuarioRepository.travar` (quem muda a pessoa) ×
  `travarParaEscolha` (quem a escolhe), `setorRepository.travar` ×
  `travarParaEscolha`, e o `travarSaidaDeAdmin` (*advisory lock*: cada
  lado mexe numa pessoa diferente). Sempre `FOR NO KEY UPDATE`, nunca
  `FOR UPDATE` (ele segura a chave estrangeira da auditoria, e dois
  ADMINs agindo um no outro davam *deadlock*). Teste de corrida pelo
  `pausarNoMeio` (pausa entre conferir e gravar), não pelo `Promise.all`.
- **Permissões em três camadas**: papel (`temPapel`) → estado do registro
  → atribuição (`Atribuicao`, com `funcao: COLABORADOR | APROVADOR`).
  `podeExecutar` combina as três; algumas transições usam checagem
  estrita manual (`decidir` exige ser especificamente o aprovador
  designado, não qualquer `APROVADOR`).
- **Edição permitida em `RASCUNHO` e `ABERTO`**, bloqueada a partir de
  `EM_APROVACAO` (`compartilhado/registro/estados-editaveis.ts`,
  `ESTADOS_EDITAVEIS`) — publicar não trava o conteúdo, só formaliza
  que o item existe.
- **Enums sempre desacoplados do Prisma**: todo enum usado em Zod/services
  tem uma versão própria em `compartilhado/entidades/` (padrão `as const`
  - tipo derivado), nunca importa direto do client do Prisma fora dos
    repositories.
- **Todo módulo de entidade segue**: `<entidade>.schema.ts` (base/
  rascunho/publicação/fechamento, conforme necessário) →
  `<entidade>.repository.ts` → `<entidade>.service.ts` →
  `<entidade>.controller.ts` → `<entidade>.routes.ts`, cada um em sua
  própria subpasta dentro de `modulos/nc/` (`nc/nc/`, `nc/contencao/`,
  `nc/classificacao/`, `nc/investigacao/` — com `hipotese.*` junto, sem
  módulo próprio —, `nc/acao-corretiva/`, `nc/verificacao/`; entidades
  filhas pertencem à NC, não têm módulo fora dessa árvore).
- **Tipo `Ator`** (`compartilhado/entidades/ator.ts`,
  `{ id: string, papeis: Papel[] }`) — usado em toda função de
  service/controller que recebe quem está executando a ação, e também
  no tipo do `request.user` (`types/fastify-jwt.d.ts`).
- **Sessão (B7, TRD §4.1)**: o login grava o cookie `qh_sessao`
  (`HttpOnly`, `Secure`, `SameSite=Strict`) com um JWT que carrega **só
  o `id` e a versão das sessões**. O middleware `autenticar` busca o usuário no banco **a cada
  requisição** (existe? ativo? a versão das sessões do token, `sv`, é a
  atual, `versaoSessao`? — B27)
  e monta o `request.user` com os **papéis atuais**. O cabeçalho
  `Authorization` não vale. Nos testes, o `loginComo` devolve o cookie
  pronto em `autenticacao`; papel revogado direto no banco vale na
  próxima requisição.

## Particularidades por entidade (as pegadinhas reais)

- **`Classificacao`**: só `APROVADOR`/`GERENTE` cria/edita/publica/
  submete/exclui (RN-20) — usa a ação `CLASSIFICAR`, não as genéricas.
- **`Investigacao`**: `causaRaiz` e `causaDireta` são campos de texto
  simples (não tabelas) — decisão tomada depois de mapear o processo
  real com a analista de qualidade. `Hipotese` é tabela de apoio, sem
  ciclo de vida próprio, gerida dentro do fluxo de Investigação.
  `MetodoInvestigacao` tem só `A3_SPS` (não os métodos do documento
  original) — decisão de produto da analista.
- **`AcaoCorretiva`**: só **um** portão (`PLANO`) — decisão de rollback
  em relação ao documento original, que tinha dois (`PLANO`+`EXECUCAO`).
  Aprovar o plano volta para `ABERTO` (não fecha, via
  `{ fecharAoAprovar: false }`). A execução nunca é submetida
  para aprovação — `finalizarExecucaoAcaoCorretiva` fecha direto, sem
  aprovação, e **gera automaticamente uma `Verificacao`** já em
  `ABERTO` (pula rascunho), com prazo calculado a partir de dias
  informados pelo colaborador. O `portaoAtual` continua 0 depois da
  aprovação: **"plano aprovado" é derivado de `Aprovacao`** (portão
  `PLANO`, `APROVADO`) por `acaoCorretivaRepository.planoAprovado` —
  é o que o `finalizarExecucao` exige (B1). Depois da aprovação, o plano
  trava: o `PATCH` só aceita a execução (`CAMPOS_DO_PLANO` recusados com
  409) e não há mais nada a submeter (B2). Nos testes, o degrau
  `"PLANO_APROVADO"` do `levarAcaoCorretivaAte` é esse `ABERTO`.
- **`Verificacao`**: nunca criada diretamente pelo usuário — só nasce
  via `finalizarExecucaoAcaoCorretiva`. Sem portão, conclui direto
  (`concluir()`). O `resultado` da conclusão dispara lógica automática:
  `PARCIALMENTE_EFICAZ` cria nova `AcaoCorretiva` (mesma investigação);
  `NAO_EFICAZ` reabre a `Investigacao` e a `NaoConformidade`
  automaticamente.
- **Guarda de fechamento da NC** (`submeterNC`, RN-21 revista na PRD
  Q17, **implementada na 8c/8d**): a função pura `avaliarFechamentoNC`
  (`nc/nc/avaliar-fechamento.ts`, escrita por Matthew) devolve um item
  por requisito, em dois grupos (filhos e envio); o service carrega os
  dados e a usa no submeter (409 com os não atendidos em `error`, como
  validador do ciclo de vida, depois de estado/permissão/aprovador) e em
  `GET /nc/:id/checklist-fechamento`. Exige ≥1 `Classificacao` FECHADA,
  **toda** `Investigacao` não cancelada FECHADA (≥1), nenhuma `Contencao`
  pendente, os campos do envio e o aprovador; **não** olha as ações.
  `AcaoCorretiva`/`Verificacao` continuam depois do fechamento, e podem
  reabrir a NC via o mecanismo acima. Quem confere os planos de ação é a
  **Investigação** — ela só é submetida com toda `AcaoCorretiva` não
  cancelada ligada a ela com plano aprovado, e pode fechar sem nenhuma
  ação (RN-24, **implementada na 8e**, com a função pura
  `avaliarSubmissaoInvestigacao` no validador do submeter); a ação
  nasce ligada a uma investigação `ABERTA` da mesma NC, e
  o vínculo não se apaga (RN-49, **já implementada na 8b**, com
  `investigacaoId` `NOT NULL`; exceção: a do `PARCIALMENTE_EFICAZ`);
  cancelar a investigação exige as ações dela canceladas ou fechadas
  (RN-50, **implementada na 8f**: o `cicloVidaService.cancelar` aceita um
  validador opcional, chamado depois de estado e permissão, como o do
  `submeter`).
  `NAO_EFICAZ` reabre só o que estiver fechado (B4) e
  `PARCIALMENTE_EFICAZ` copia todos os colaboradores da ação anterior
  (B6), os dois corrigidos.

## Testes

`npm test` (Vitest 5 + `app.inject()` + Testcontainers, TRD §9) —
**precisa do Docker Desktop aberto**. Cada `npm test` sobe um Postgres
17 descartável, aplica as migrations e o derruba no fim; o primeiro
leva ~15 s.

- Teste fica **ao lado do arquivo testado** (`x.ts` → `x.test.ts`).
  Teste de API: um `describe` por rota (`describe("POST /auth/login")`).
- Infraestrutura em `src/testes/`: `global-setup.ts` (container +
  migrations + `provide("urlBanco")`), `setup-ambiente.ts`
  (`DATABASE_URL` e `JWT_SECRET` de teste) e `limpar-banco.ts`
  (**trava**: aborta se `current_database()` não for `test`; depois
  `TRUNCATE` de todas as tabelas antes de **cada** teste). A ordem dos
  `setupFiles` importa: o `prisma` só pode ser importado depois de a
  URL ser trocada.
- `fileParallelism: false`: todos os arquivos usam o mesmo banco.

Os testes manuais antigos (`testes/old/*.http`, REST Client) foram
aposentados na A2 (2026-09-30): tudo o que exercitavam tem teste
automático. Fica o `testes/setup-usuarios-teste.sql` (7 usuários
cobrindo cada combinação de papel — base das fábricas).

## O que falta

Tudo está em `docs/plano-implementacao.md`, com a fase de cada item
(tabela de rastreabilidade, §8).
