# Handoff — estado da sessão

> Lido no **início de toda sessão** (regra no `CLAUDE.md`) e atualizado
> no **fim de toda sessão** ou quando Matthew disser "vou trocar de
> computador". Aqui fica só o que muda de sessão para sessão; o que é
> estável mora nos documentos apontados.

**Última atualização:** 2026-10-07 (manhã, no **trabalho**; `/retomar`). Ambiente em dia: Docker Desktop atualizado (motor 29.8.2), extensões do Claude Code (2.1.292) e do GitHub PR (0.168.0) atualizadas; suíte **312 passando**, cobertura 95,2%. Na sessão: **B23 registrado** (rotas aceitam o `id` de um item de outro tipo; entra antes da Contenção, por Matthew) e a conversa com a analista sobre classificação e reincidência (PRD Q19–Q21). O PC de casa continua sem foto (`casa.txt`).

## 1. Objetivo

Fase **A5 — Contrato da API** (`docs/plano-implementacao.md`), na branch
`fase/a5-contrato-api`. O passeio guiado pelo código fica para um
momento tranquilo em casa (§6), sem bloquear a fase.

## 2. Estado atual

- **A5, item 1 (prefixo `/api`)**: feito. Rotas num plugin com `prefix`
  no `app.ts`, cookie `Path=/api`, URLs dos testes por extenso com
  `/api` (changelog "Fase A5").
- **A5, item 2 (schema de resposta)**: contrato decidido (D1–D5,
  changelog "Fase A5", a partir do levantamento das respostas reais) e
  **as 12 rotas de NC prontas**, em 7 fatias, cada uma com teste
  vermelho (ou de caracterização) e prova de quebra:
  - `diaDeCalendario()` virou **codec** (entrada e saída
    `"AAAA-MM-DD"`), em `compartilhado/datas/`;
  - `ncRespostaSchema` (sem `portaoAtual`, D2) e
    `checklistFechamentoRespostaSchema` em `nc.schema.ts`;
  - `erroSchema` (`compartilhado/errors/erro.schema.ts`), declarado
    como `"4xx"` (D4);
  - `paginaSchema(itemSchema)`, genérico, em
    `compartilhado/registro/paginacao-cursor.ts` (D3);
  - o `PATCH` da NC devolve o formato completo (D1);
  - `DELETE` com `204: z.null()`, que é **só documentação** (o Fastify
    não serializa 204; a prova de quebra mostrou).
- **B22 aberto** (dia de calendário saía com hora): consertado só nas
  rotas de NC; fecha pelo `/bug` quando contenção, ação corretiva e
  verificação também devolverem os dias sem hora.
- Suíte: **312 passando** na última rodada completa (fatia 7); cobertura
  ~95,2% (trava em 94,66%). Lint e typecheck limpos.
- O que Matthew aprendeu na A5: `prefix` do Fastify e `Path` do
  cookie; schema de resposta (filtra o que sai, vigia o código: tipo
  errado vira 500); codec do Zod (`decode`/`encode`); *arrow function*
  (o que vai antes e depois da seta); `Date()` sem `new` devolve texto;
  `toEqual` × `toMatchObject` (exatidão); teste de caracterização; a
  conferência negativa precisa de uma positiva junto; função genérica
  (`<T extends z.ZodType>`); `.nullable()` × `.optional()`.
- **A4** fechada em 2026-10-06 (PR #6, `git log c10844c..a66c11b`): o
  resumo está no plano (histórico) e no changelog ("Fase A4").
- Tempo da suíte: 216 s a 379 s hoje. A lentidão do meio da tarde era o
  **Apple Music** na web com o player aberto (o gradiente animado das
  letras consome a máquina): fechar antes de rodar a suíte. Se passar
  de ~5 min sem isso, olhar o Docker Desktop (Settings → Resources) e o
  `free -h` **antes** de mexer nos testes.

## 3. Arquivos no meio de uma mudança

Nenhum.

## 4. O que foi alterado nesta sessão

Na A5 (`git log main..fase/a5-contrato-api`): prefixo `/api`, o
contrato D1–D5, o B22 registrado e as 7 fatias das rotas de NC. Nenhuma
dependência nova nem migration na A5. (A A4 trouxe `@fastify/cookie`,
`@fastify/rate-limit`, `@fastify/helmet`, `@vitest/coverage-v8` e a
migration M1; o `npm run preparar` cobre.)

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
| Sonda `.mts` na pasta temporária não achou o `fastify` | Fora do projeto não há `node_modules` | Claude: cópia temporária na raiz do projeto, apagada logo depois (ou importar o `app.ts` pelo caminho absoluto) |
| Teste do RN-17 estourou os 15 s (2026-10-06) | Máquina lenta: Apple Music aberto no navegador | Fechar o player antes da suíte; o teste passou na rodada seguinte |
| Teste do B9 quebrou na fatia 5 | Ele esperava o `detectadoEm` com hora, o formato do bug B22 | Ajustado para o dia (o objetivo do teste não mudou). Ao replicar nas outras entidades, testes que esperem data com hora ou `portaoAtual` mudam junto (ex.: `contencao.routes.test.ts:226`) |
| Janela do VS Code no WSL não abria depois da atualização (2026-10-07) | O `npm run ambiente` chamou o `code` do WSL no meio da atualização: o servidor novo ficou descompactado numa pasta temporária, sem o último passo da instalação, e a versão antiga já tinha sido apagada | Resolvido: a pasta da versão em `~/.vscode-server/bin/` tirada do caminho, e o VS Code reinstalou ao reconectar. Claude: **não tirar a foto com o VS Code atualizando** |

**Pendências anotadas:**
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
- **Suíte em ~140–160 s.** Medir antes de otimizar; um banco por worker
  é a opção de maior ganho. **Não** montar cenário direto no banco.
  Os testes de função pura também sobem o Postgres (~15 s): um "projeto"
  do Vitest sem banco para eles é configuração (de Matthew, se quiser).
- **Rever o `podeExecutar`** (colaborador **ou** aprovador designado × o
  PRD §8, que pede colaborador): com a Q22 (colaborador e aprovador
  excludentes), o aprovador não faz o que é do colaborador. Resolver na
  C2, junto da Q22.
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
3. **B23 primeiro** (registrado em 2026-10-07, `esquema-backend.md` §7):
   as rotas aceitam o `id` de um item de outro tipo. Matthew escreve,
   passo a passo: o teste vermelho (`decidir` de uma ação corretiva pela
   rota da Contenção) e a conferência do tipo no ciclo de vida; Claude
   repete nos outros tipos. Só depois, a Contenção abaixo.
4. **A5, item 2: replicar o schema de resposta** (Claude escreve,
   Matthew revisa; **um commit por arquivo**, cada um com teste vermelho
   quando houver o que provar, e a suíte completa). O padrão é o das
   rotas de NC: `<x>RespostaSchema` no `<x>.schema.ts` (campos do
   `Registro` + os da entidade, sem `portaoAtual`, `.nullable()` no que
   o banco permite nulo, dias de calendário com `diaDeCalendario()`),
   `response: { 200|201: ..., "4xx": erroSchema }`, listas com
   `paginaSchema(...)`, 204 com `z.null()`. Faltam **55 rotas em 8
   arquivos**, nesta ordem:

   | Arquivo | Rotas | Observação |
   |---|---|---|
   | Contenção | 10 | `executadaEm` (B22); o teste da linha 226 confere `portaoAtual: 0` e muda junto |
   | Classificação | 9 | Sem dia de calendário |
   | Investigação | 10 | Inclui as rotas de hipótese |
   | Ação corretiva | 11 | `prazo` e `executadoEm` (B22) |
   | Verificação | 5 | `prazo` e `verificadoEm` (B22). Depois dela, **fechar o B22** pelo `/bug` |
   | Atribuição | 3 | `/registros/...` (colaboradores e aprovador) |
   | Auth | 6 | Login 204, `eu`, `logout`... |
   | Usuário | 1 | |

   O `GET /` ganha schema no item 5 (vira `GET /api/saude`).
5. **Resto da A5**, pela ordem do plano: (3) `@fastify/swagger` com
   explicação (CSP do `helmet` só nessa rota; conferir como o 204
   `z.null()` aparece no OpenAPI); (4) catálogo de auditoria; (5) `GET
   /saude`; (6) L7; (8) L5, começando por teste; (9) avaliar as funções
   repetidas, decisão de Matthew com `idea-refine`, no changelog antes
   de mexer; (10) L4 com o teste do 413. A L3 já foi feita (B21). Nos
   itens 🧑: o **passo a passo** combinado (regra no `CLAUDE.md`).

**Chegando em casa:** rodar o **`/retomar`**. Nada novo de ambiente desde a saída do trabalho (sem migration, dependência ou chave do `.env` na A5). Desde a última vez que a
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
7. `npm run test:cobertura`: **312 passando**, cobertura acima de 94,66% (com o Apple Music fechado, para a suíte não passar de ~5 min).
