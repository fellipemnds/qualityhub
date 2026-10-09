# Handoff — estado da sessão

> Lido no **início de toda sessão** (regra no `CLAUDE.md`) e atualizado
> no **fim de toda sessão** ou quando Matthew disser "vou trocar de
> computador". Aqui fica só o que muda de sessão para sessão; o que é
> estável mora nos documentos apontados.

**Última atualização:** 2026-10-09, noite (**sessão na nuvem**, Matthew pelo iPad; a primeira, `SETUP.md` §13). **A6 fechada** (PR #9, merge `e441212`; a `main` já entrou na branch da A7 por merge). **A7 aberta e feita** na branch `fase/a7-travas-entre-linhas` (B29–B36 corrigidos), **esperando a revisão dos diffs por Matthew**. Antes, 2026-10-09, fim do dia (no **trabalho**, `/trocar-pc`): o script do primeiro acesso e o item 6. O PC de casa continua sem foto (`casa.txt`).

## 1. Objetivo

Fase **A7 — Travas entre linhas** (`docs/plano-implementacao.md`), na
branch `fase/a7-travas-entre-linhas` (PR #10, em rascunho; a `main` com
a A6 já mesclada entrou nela por merge). Depois da A7, o portão
"fundação pronta".

## 2. Estado atual

- **A7 (2026-10-09, na nuvem; Claude escreveu, Matthew revisa os
  diffs):** B29–B36 corrigidos por **travar antes de ler** (o
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

Na nuvem (2026-10-09, noite): na **A6** (`git log e29265d..ca93de8`), o
B28, a `SETUP.md` §13 (a sessão na nuvem), o registro do B29–B36, da
RN-51 e da fase A7, e o PR #9 fora do rascunho. Na **A7** (a branch
nova): os consertos do B29–B36 e os documentos. **Sem migration,
dependência nem chave nova no `.env`**: no PC, só `git pull` (e o
`npm run preparar` de sempre).

## 5. Falhas (e o porquê)

| O que falhou | Por quê | Situação |
|---|---|---|
| Na nuvem, a suíte caiu com `Could not find a working container runtime strategy` (2026-10-09) | O `dockerd` da sessão morreu sozinho entre uma rodada e outra | Claude: `docker info` antes de cada suíte, e ligar o `dockerd` de novo (`SETUP.md` §13) |
| O teste de corrida do envio da NC passou **sem** a trava (2026-10-09) | Com o `Promise.all`, a corrida acontece em 1 de 4 rodadas | Testes de corrida pelo `pausarNoMeio` (pausa entre conferir e gravar): vermelho sempre sem a trava, verde sempre com ela |
| A primeira trava do B32 deu *deadlock* (500) | O `FOR UPDATE` segura também a chave estrangeira da auditoria que aponta para a pessoa (os dois ADMINs se esperavam) | `FOR NO KEY UPDATE`, a trava do `UPDATE` (no `CLAUDE.md`, "Trava entre linhas") |
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
| Commit da fatia 7 do B23 entrou com a suíte vermelha (2026-10-07) | O comando lia o resultado da suíte e commitava em seguida, sem conferir o código de saída; e o `Confere` do teste novo comparava com o objeto do cenário, que já tinha sido editado (o vermelho parou no 500 antes de chegar nele) | Corrigido antes do push (`--amend`, local). Claude: o commit só roda **depois de conferir** o código de saída da suíte (`if [ $r -eq 0 ]`); e a conferência de "não mudou" compara com uma leitura feita **antes** da chamada, nunca com o objeto do cenário |
| CI do lote 3 vermelho no `diff-cover` (2026-10-07) | O catálogo `AcaoAuditada` era um objeto que ninguém carregava (só o tipo era importado): a linha ficou sem cobertura, e o `diff-cover` só roda no CI | Resolvido: o catálogo virou só um tipo. Claude: rodar o `diff-cover` **antes de todo push** (`uvx diff-cover==10.6.0 coverage/cobertura-coverage.xml --compare-branch=origin/main --fail-under=100`, com o `uv` na pasta temporária da sessão) |
| CI vermelho no `verificar` sem nenhum teste rodar (2026-10-09, três vezes) | O Testcontainers baixa o Postgres e o `ryuk` do Docker Hub: primeiro o limite de downloads sem login (as máquinas do GitHub dividem endereços), depois erros 500 e timeout do próprio Docker Hub | Login no CI (`1ee4df0`); a instabilidade é do Docker Hub, e não há o que consertar no código: rodar de novo depois. **Sintoma:** "No test files found" e cobertura 0% — ler o erro de baixo (o `Unhandled Error`) antes de mexer nos testes |
| CI vermelho no `osv-scanner` depois do push do handoff (2026-10-09), e ninguém viu até Matthew avisar | Alerta novo publicado de um dia para o outro (`fast-jwt` 6.3.3, GHSA-x937-hj6v-793p, média); o Claude conferiu o CI no `/retomar` **antes** do push, e não depois | Resolvido: `npm update fast-jwt` (6.3.4, dentro da faixa do `@fastify/jwt`). Claude: conferir o CI (`gh pr checks`) depois de **todo** push, até o fim, inclusive o de documentação |
| CI da F6a vermelho no `diff-cover` (2026-10-08): uma linha do `setor.service.ts` sem teste | O `diff-cover` local deu 100% porque o arquivo era **novo e ainda sem commit**: o Git não o rastreava, e ele ficou fora do diff | Resolvido com o teste. Claude: `git add -N` nos arquivos novos antes do `diff-cover` (na `/verificar` §4), ou rodar depois do commit |

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
- No trabalho, o Prettier ainda está instalado no lado Windows do VS
  Code (inofensivo; pode desinstalar — `SETUP.md` §12.4). O Copilot
  ficou desligado no projeto (`.vscode/settings.json`) e nas
  configurações do trabalho.

## 6. Próximo passo

1. **Matthew: merge do PR #10 (A7)**, com a mensagem entregue na
   conversa. Depois, o `/fechar-fase` da A7, que é a **última fase do
   bloco A**: inclui o passo 5, rever as skills no fim do bloco.
2. **O portão "fundação pronta"** (plano, fim da seção 3):
   - ~~OpenAPI completo, gerando sem erro~~ **conferido em 2026-10-09**
     (Redocly sem erro; o B37 corrigido no caminho);
   - nenhum bug aberto: ok (B1–B37);
   - A0–A7 concluídas, com o CI verde na `main`: falta o merge da A7;
   - e o que ficou adiado dos "pronto quando": **Matthew explicar a A4
     (o B19 e o `SameSite=Strict`), a A6 e a A7 (a trava entre
     linhas)**, no **passeio guiado** (em casa, com o
     `/understand-anything:understand` antes; roteiro no passo 3 abaixo).
3. Roteiro do passeio: uma requisição de ponta a ponta (rota →
   controller → service → `cicloVidaService` →
   `buscarRegistroDoTipoOuFalhar` → `aplicarTransicao` →
   `registroRepository.atualizar` → banco → auditoria → resposta), com
   Matthew dizendo o que cada parte faz antes de Claude explicar; e, para
   a A7, um teste com o `pausarNoMeio` lido linha a linha.
4. Depois do portão: o Bloco B (design) e a C0 (com o `operationId`
   antes do Orval, plano C0).

Da revisão de design das APIs (2026-10-07), anotados para a C1/C2:
**R7**, o erro sem código para máquina (os 409 diferentes só se
distinguem pelo texto; acrescentar um `codigo` é aditivo) e **R8**, o
`DELETE /registros/:id/colaboradores` com corpo (decidir com a tela;
ainda barato de mudar). Sugestões antigas sem prazo: o `logout` sem
`autenticar` não apaga o cookie de sessão vencida; o `include` de papéis
no `buscarPorEmail` sobrou; o `gitleaks detect` vira `gitleaks git` nas
versões novas.

**Chegando em casa:** rodar o **`/retomar`**. Desde 2026-10-09: **chave nova no `.env`, a `URL_DO_SISTEMA`** (copiar a linha do `.env.example`; sem ela, o `npm run ambiente` acusa a falta) e o `fast-jwt` 6.3.4 (o `npm run preparar` resolve). A A5 trouxe **duas dependências** (`@fastify/swagger`, declarado, e `@fastify/swagger-ui`, de desenvolvimento): o `npm run preparar` resolve. Sem migration nem chave nova no `.env`. Desde a última vez que a
branch foi usada em casa (antes da A3): as migrations da A3 e a **M1**
(`sessao_e_preferencia_do_usuario`), e **dependências novas** (cookie,
rate-limit, helmet, cobertura, Vitest 5.0.3). O `npm run preparar`
resolve as duas coisas. Os passos (`SETUP.md` §12.1 se o PC estiver
parado há tempo):

1. Docker Desktop aberto ("Engine running"), Ubuntu, pasta do projeto.
2. `git fetch`, `git switch fase/a7-travas-entre-linhas`, `git pull`.
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
