# Handoff — estado da sessão

> Lido no **início de toda sessão** (regra no `CLAUDE.md`) e atualizado
> no **fim de toda sessão** ou quando Matthew disser "vou trocar de
> computador". Aqui fica só o que muda de sessão para sessão; o que é
> estável mora nos documentos apontados.

**Última atualização:** 2026-10-06 (no **trabalho**; a sessão em casa não aconteceu). **A4 fechada** (PR #6) e as skills de início e fim de fase mescladas (PR #7). **A5 começada** com o `/comecar-fase` na branch `fase/a5-contrato-api` (PR em rascunho); o passeio guiado fica para casa, sem bloquear a A5 (§6).

## 1. Objetivo

Fase **A5 — Contrato da API** (`docs/plano-implementacao.md`), na branch
`fase/a5-contrato-api`. O passeio guiado pelo código fica para um
momento tranquilo em casa (§6), sem bloquear a fase.

## 2. Estado atual

- **A4 fechada** em 2026-10-06 (PR #6, 41 commits,
  `git log c10844c..a66c11b`). Por item do plano:
  - simplificações do `ciclo-vida` (caracterização, `aplicarTransicao`,
    `buscarRegistroOuFalhar`, validador `() => void`, `estadoAposDecisao`);
  - **B19**: `registroRepository.atualizar`/`excluir` e o convite exigem
    o estado lido (409/400); 9 testes de concorrência com o
    `abrirDuasConexoes()`; skill **`/bug`** criada e usada para fechar;
  - `gerarVerificacao` fora do `finalizarExecucao`;
  - **escritos por Matthew, guiado passo a passo**: a M1, o login com
    cookie e "manter conectado", o middleware `autenticar` (B7), os
    testes da sessão, as regras de arquitetura no `biome.json`, a
    cobertura e os jobs de segurança do CI;
  - por Claude: `logout`, `sair-de-todos`, `GET`/`PATCH /auth/eu` (tela
    inicial calculada no backend), login endurecido (limite, auditoria,
    RN-38, L1), `helmet`;
  - **2026-10-06**: B21 e B20 (escritos por Matthew), refactor do
    `setErrorHandler`, checksum do gitleaks e do osv-scanner no CI.
- Suíte: **304 passando**; cobertura **95,17%** das linhas (trava em
  94,66%); as linhas novas da A4: **100%** (141, trava em 100% no CI).
  Lint, typecheck, gitleaks, Semgrep e osv-scanner limpos (rodados à
  mão; o CI ainda não rodou os jobs novos).
- **Decisões do dia**, todas no `docs/changelog-arquitetura.md` (seção
  "Fase A4"): repositório lança o 409 da trava; login 204 sem corpo;
  `Path=/` do cookie até a A5; tela inicial no backend; falhas de login
  só no log (E1); arquitetura no Biome (o dependency-cruiser não lê o
  TypeScript 7); `diff-cover` no CI; exceções **X2, X3 e X4**
  (`CONSTRAINTS.md` §5).
- Tempo da suíte: variou de 150 s a 568 s com os mesmos testes (a
  lentidão vem e vai; ~200 s no fim do dia). Se passar de ~5 min de
  novo, olhar o Docker Desktop (Settings → Resources) e o `free -h`
  **antes** de mexer nos testes.
- O que Matthew aprendeu hoje: migration com default para linhas
  antigas; cookie × token, `HttpOnly`/`Secure`/`SameSite`; por que
  papéis no token atrasam a revogação; middleware que escreve no
  `request`; TOCTOU e o `UPDATE` condicionado; prova de quebra (quebrar
  o código testado, não o teste); objeto de opções no lugar de booleano;
  `overrides` do Biome; cobertura e "medir e travar"; injeção por `${{ }}`
  no CI.

## 3. Arquivos no meio de uma mudança

Nenhum.

## 4. O que foi alterado nesta sessão

Os 41 commits da A4 (`git log c10844c..a66c11b`). Dependências
novas: `@fastify/cookie`, `@fastify/rate-limit`, `@fastify/helmet`
(produção) e `@vitest/coverage-v8`, com o Vitest 5.0.2 → 5.0.3; o
`fastify` foi para 5.12.5 e o `fast-uri` para 3.1.8/4.2.1 por avisos de
segurança novos. Migration nova: `sessao_e_preferencia_do_usuario` (M1).

## 5. Falhas (e o porquê)

| O que falhou | Por quê | Situação |
|---|---|---|
| `npm audit`: 4 vulnerabilidades altas | Herdadas do Prisma 7 | **Aberto**, risco baixo — `docs/trd.md` §13. Nunca `npm audit fix --force` |
| Aviso "Update available 7.10.0 → 8.0.0-rc" do Prisma | É release candidate e versão major | **Não atualizar** |
| Aviso no CI: `ubuntu-latest` vira Ubuntu 26 em 19/10/2026 | Migração do GitHub | Nada a fazer; se o CI quebrar depois dessa data, começar por aqui |
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

**Pendências anotadas:**
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
- **Cookie `Path=/` → `/api` na A5**, junto com o prefixo (anotado no
  plano).
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
- **Suíte em ~140–160 s.** Medir antes de otimizar; um banco por worker
  é a opção de maior ganho. **Não** montar cenário direto no banco.
  Os testes de função pura também sobem o Postgres (~15 s): um "projeto"
  do Vitest sem banco para eles é configuração (de Matthew, se quiser).
- **Rever o `podeExecutar`** (colaborador **ou** aprovador designado × o
  PRD §8, que pede colaborador): decidir com a analista se vira bug.
- **Aprovador na lista das guardas: na C2** (decidido em 2026-10-01).
  Hoje o `cicloVidaService.submeter` confere o aprovador **antes** da
  guarda do tipo, então a NC sem aprovador recebe o 409 genérico, sem a
  lista do que falta (só mensagem; a regra está protegida, e a tela usa
  o checklist). Na C2, quando os seis tipos ganharem a lista do envio,
  o aprovador entra nela para todos de uma vez. Registrado no plano (C2)
  e no esquema §4.3.
- A **triagem** de filho publicado sem aprovador (parte da RN-46) fica
  para a C3 (pendências).
- **Levar à analista: segregação de funções** (auditoria de segurança de
  2026-10-02, seção 3). A RN-18 (qualquer `EDITOR` se inclui como
  colaborador), o `DEFINIR_APROVADOR` (o `APROVADOR` pode indicar a si
  mesmo) e a RN-27 (auto-aprovação permitida) juntos deixam uma QA
  (`EDITOR` + `APROVADOR`) levar sozinha qualquer item da edição à
  aprovação; o `GERENTE` pode trocar o aprovador para si em
  `EM_APROVACAO` e decidir na hora. Tudo auditado — não é bug, mas é o
  que um auditor ISO pergunta ("quem revisa quem?"), e a RN-29 (proibir
  auto-aprovação) está prevista e não implementada. Perguntar se vale ao
  menos impedir alguém de se indicar como aprovador. Junto: a revisão do
  `podeExecutar` (item acima) e o `cicloVidaService.cancelar`, que
  confere `GERENTE` direto, sem o catálogo de permissões (revisão de
  código de 2026-10-02): as três perguntas são o mesmo assunto, quem pode
  o quê.
- No trabalho, o Prettier ainda está instalado no lado Windows do VS
  Code (inofensivo; pode desinstalar — `SETUP.md` §12.4). O Copilot
  ficou desligado no projeto (`.vscode/settings.json`) e nas
  configurações do trabalho.

## 6. Próximo passo

**As revisões de 2026-10-05 e de 2026-10-06 estão resolvidas.** O que
ficou para depois foi registrado: S2 e S5 na D1 do plano (`trustProxy`,
limite em memória, *Fetch Metadata*); o S4 (log de login) já estava na
D0. Sugestões sem prazo da revisão de código de 2026-10-05: o `logout`
sem `autenticar` não apaga o cookie de sessão vencida (inofensivo); o
`include` de papéis no `usuarioRepository.buscarPorEmail` sobrou; o
`gitleaks detect` vira `gitleaks git` nas versões novas; testes do 413 e
da mensagem padrão do `setErrorHandler`.

1. ~~Skills de início e fim de fase~~: mescladas (PR #7, 2026-10-06).
   O ciclo agora: `/comecar-fase` → itens → `/abrir-pr` (revisões e
   "pronto quando") → merge → `/fechar-fase`.
2. **Passeio guiado pelo código** (combinado em 2026-10-05; em casa,
   num momento tranquilo, sem bloquear a A5, decidido em 2026-10-06). **Inclui o último item do "pronto quando" da A4**, adiado no
   merge: Matthew explicar o B19 ("confere e depois age", o `UPDATE`
   condicionado ao estado lido) e o que o `SameSite=Strict` bloqueia e
   o que não bloqueia. Roteiro: seguir uma requisição de ponta a ponta
   (rota → controller → service → `cicloVidaService` → `aplicarTransicao` →
   `registroRepository.atualizar` → banco → auditoria → resposta), com
   Matthew dizendo o que cada parte faz antes de Claude explicar.
   Motivo: Matthew disse que não estava mais reconhecendo o código.
3. **A5, pela ordem do plano** (`/comecar-fase` feito em 2026-10-06; a
   tabela de entregas, com o que é novo para Matthew, está na conversa
   e resumida aqui): (1) prefixo `/api` e cookie `Path=/api` 🤖;
   (2) **schema de resposta** em todas as rotas, as de NC por Matthew
   (o conceito da fase; atenção: com schema também nas respostas de
   erro, o `error: undefined` passa pelo serializer do Zod e não mais
   pelo `JSON.stringify`); (3) `@fastify/swagger` com explicação (CSP do
   `helmet` só nessa rota); (4) catálogo de auditoria; (5) `GET /saude`;
   (6) L7; (8) L5, começando por teste; (9) avaliar as funções
   repetidas, decisão de Matthew com `idea-refine`, no changelog antes
   de mexer; (10) L4 com o teste do 413. A L3 já foi feita (B21). Nos
   itens 🧑: o **passo a passo** combinado (regra no `CLAUDE.md`).

**Chegando em casa:** rodar o **`/retomar`**. Desde a última vez que a
branch foi usada em casa (antes da A3): as migrations da A3 e a **M1**
(`sessao_e_preferencia_do_usuario`), e **dependências novas** (cookie,
rate-limit, helmet, cobertura, Vitest 5.0.3). O `npm run preparar`
resolve as duas coisas. Os passos (`SETUP.md` §12.1 se o PC estiver
parado há tempo):

1. Docker Desktop aberto ("Engine running"), Ubuntu, pasta do projeto.
2. `git fetch`, `git switch fase/a5-contrato-api`, `git pull`.
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
7. `npm run test:cobertura`: **304 passando**, cobertura acima de 94,66%.
