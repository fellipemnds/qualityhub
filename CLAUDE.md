# QualityHub — contexto para o Claude Code

Sistema de gestão de Não Conformidades (ISO 9001:2015, cláusula 10.2),
construído do zero por Matthew, aprendendo backend full-stack no processo.
Este arquivo é o ponto de entrada rápido.

**Idioma: responder sempre em português do Brasil.**

**Princípio do produto:** funcional e sem risco de falha vale mais que
entregar rápido.

## Documentos (planejamento concluído em 2026-09-24)

| Documento | Responde |
|---|---|
| `docs/prd.md` | O quê e por quê: escopo do MVP, regras de negócio RN-xx, permissões, decisões com a analista |
| `docs/fluxo-app.md` | Telas, navegação, etapa calculada da NC, jornadas, ações por estado, "Minhas pendências" |
| `docs/ui-ux.md` | Fundações visuais, componentes (shadcn/ui), wireframes em texto, textos da tela |
| `docs/trd.md` | Stack, sessão, API, anexos, testes, infraestrutura, hospedagem, ADR-33 a ADR-38 |
| `docs/esquema-backend.md` | Modelo de dados, mudanças M1–M5, valores calculados, contrato da API, correções B1–B18 |
| `docs/plano-implementacao.md` | **Ordem de execução**: fases A0–A6 (fundação do backend), B (design), C0–C8 (frontend em fatias), D (produção) |
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

**Bugs conhecidos:** `docs/esquema-backend.md` §7 (B1–B18; os
corrigidos têm ✅). Corrigidos na A3: B9, B11, B14, B1, B2. Os próximos,
na ordem do plano: B10 (vínculo da ação com a investigação) e a guarda
de fechamento da NC com o B5 (fechar sem plano de ação aprovado).

**Ambiente:** os testes (Testcontainers) precisam do **Docker Desktop
aberto** — a integração com o WSL está confirmada (2026-09-24), mas com
o Docker Desktop fechado o comando `docker` some do WSL. O `gh` está
instalado e autenticado neste computador (escopos `repo` e `workflow`);
Claude pode abrir PRs e ler o CI com ele. O `git push` continua sendo
de Matthew, salvo pedido explícito.

**Dois computadores:** Matthew alterna entre o do trabalho e o de casa
(mesmo ambiente: Windows + WSL2 + Docker Desktop + nvm). Seguir o
`SETUP.md` §12. **Qual máquina é esta:** compare o `hostname` com a
linha `hostname:` de `docs/ambiente/trabalho.txt` e `casa.txt`. Quando
ele disser **"vou trocar de computador"**: rodar `npm run typecheck`,
`npm run lint` e `npm run ambiente -- <esta máquina>` (foto do
ambiente), atualizar o `handoff.md`, propor o commit na branch da fase
(com a foto) e lembrá-lo do `git push`. Quando disser **"continuar de
onde parei"**: ler o `handoff.md`, conferir a branch (`git status`),
lembrar do `npm run preparar` se ele ainda não rodou, rodar `npm run
ambiente -- <esta máquina>` e `npm run ambiente -- comparar`, contar a
Matthew o que difere do outro PC (e o que mudou nesta máquina desde a
última foto, pelo `git diff`), registrar no `handoff.md` e retomar pelo
"Próximo passo". Memória e conversas do Claude **não**
passam de uma máquina para a outra — o que precisa sobreviver vai para
o `handoff.md` (estado) ou para este arquivo (regras).

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

A partir do plano de implementação:
- **Uma branch e um Pull Request por fase**; CI verde para entrar na `main`.
- **Bug começa por um teste que falha.**
- Cada fase termina com o checklist "pronto quando" (plano §1.1).
- **Pedir antes de cada commit**, inclusive dentro da branch da fase,
  mostrando o que entra (Matthew pode pedir o diff antes). Push, ele
  faz (não há credencial do GitHub neste ambiente).
- Commit de formatação automática sempre **separado** das mudanças de
  código, para o diff de lógica ficar legível.

## Stack

Node.js 24, TypeScript 7, Fastify 5 (com `fastify-type-provider-zod`),
Prisma 7, PostgreSQL 17, Zod 4. Ambiente: WSL2/Ubuntu, Docker Compose para
o banco. Frontend (planejado, não iniciado): React + Vite + **shadcn/ui**
(não Mantine — ver changelog) + Tailwind.

**Comandos:** `npm run dev` (servidor com recarga) · `npm test`
(Vitest; Docker Desktop aberto) · `npm run typecheck`
(`tsc --noEmit`) · `npm run lint` (Biome: formatação + lint + ordem dos
imports) · `npm run lint:fix` (corrige o que é automático) ·
`npm run preparar` (`npm ci` + `prisma generate` + `prisma migrate
deploy` — deixa a máquina em dia depois de um `git pull`). O Biome
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
  `criarRascunho`, `publicar`, `submeter`, `decidir`, `reabrir`, `cancelar`,
  `excluirRascunho`, `concluir` — reaproveitado por todas as entidades.
  `decidir` aceita um parâmetro `fecharAoAprovarUltimoPortao` (default
  `true`) para os casos onde aprovar o último portão não deve fechar o
  item (ver `AcaoCorretiva` abaixo). `publicar`/`submeter`/
  `excluirRascunho` aceitam a `Acao` de permissão como parâmetro
  (default a ação genérica), porque `Classificacao` exige `CLASSIFICAR`
  em vez de `PUBLICAR`/`SUBMETER`/`GERENCIAR_RASCUNHO`.
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
  `fecharAoAprovarUltimoPortao: false`). A execução nunca é submetida
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
- **Guarda de fechamento da NC** (`submeterNC`, reconciliado com RN-21):
  exige ≥1 `Classificacao` FECHADA, ≥1 `Investigacao` FECHADA, nenhuma
  `Contencao` pendente. **Não** espera `AcaoCorretiva`/`Verificacao` —
  essas continuam depois do fechamento, e podem reabrir a NC via o
  mecanismo acima. **Regra revista no PRD, ainda não implementada**:
  passa a exigir todos os planos de `AcaoCorretiva` aprovados (RN-21);
  `NAO_EFICAZ` deve reabrir só o que estiver fechado (hoje dá erro se a
  NC estiver aberta); `PARCIALMENTE_EFICAZ` deve copiar todos os
  colaboradores da ação anterior.

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
