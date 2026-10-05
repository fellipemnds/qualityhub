# Handoff — estado da sessão

> Lido no **início de toda sessão** (regra no `CLAUDE.md`) e atualizado
> no **fim de toda sessão** ou quando Matthew disser "vou trocar de
> computador". Aqui fica só o que muda de sessão para sessão; o que é
> estável mora nos documentos apontados.

**Última atualização:** 2026-10-05 (chegada no trabalho, `/retomar`). Nada foi feito em casa no fim de semana: o estado é o de 2026-10-02. A foto do trabalho só mudou na extensão do Claude Code (2.1.287 → 2.1.289); ferramentas, `.env`, migrations e plugins em dia. O `comparar` ainda não roda: o `casa.txt` não existe, e a primeira foto de casa continua pendente. Nesta sessão, a quarta simplificação, `estadoAposDecisao`, ficou pronta (Matthew passou o item para Claude e acompanhou). As quatro simplificações do `ciclo-vida` estão feitas; o próximo é o B19.

## 1. Objetivo

Fase **A4 — Sessão nova** (`docs/plano-implementacao.md`, seção A4):
o B7 (cookie `HttpOnly`, papéis conferidos a cada requisição). **Antes**
dele, na ordem da tabela da A4: os testes de caracterização, as quatro
simplificações do `ciclo-vida.service.ts` e o B19.

## 2. Estado atual

- Branch **`fase/a4-sessao`**, ainda sem PR (o `/abrir-pr` abre em
  rascunho). Commits da fase até aqui (`git log c10844c..fase/a4-sessao`):
  - a colinha das skills (`docs/colinha-agent-skills.md`) e a abertura
    da A4;
  - **`test:`** caracterização do ciclo de vida
    (`src/compartilhado/registro/ciclo-vida.service.test.ts`, 15 testes:
    auditoria de cada transição e 404);
  - **`refactor:`** `aplicarTransicao` (o "atualizar + auditar" num
    lugar só, onde a trava do B19 vai entrar);
  - **`fix:`** `buscarRegistroOuFalhar`, com o 404 sempre "Item não
    encontrado." (o teste ficou vermelho antes, nos 5 casos);
  - **`refactor:`** validador `() => void` em `publicar`, `submeter` e
    `concluir`, como o do `cancelar` (11 chamadas nos 6 services);
  - **`refactor:`** `estadoAposDecisao` (2026-10-05): função pura com 3
    testes, sem o ramo de vários portões, e `{ fecharAoAprovar }` no
    lugar do booleano solto.
- Suíte: **269 passando** (266 + 3). Lint e typecheck limpos.
- **A suíte está cada vez mais lenta, com os mesmos testes:** 141 s →
  276 s (2026-10-02) → **568 s** (2026-10-05, no trabalho). Só o arquivo
  da `estadoAposDecisao` (3 testes) levou 84 s, quase tudo para subir o
  Postgres. Olhar o Docker Desktop (Settings → Resources) e a memória do
  WSL (`free -h`) **antes** de mexer nos testes.
- O que Matthew aprendeu em 2026-10-02: contrato de qualidade; modelagem de
  ameaças e OWASP (IDOR, TOCTOU, enumeração por tempo, custo do bcrypt);
  Cerca de Chesterton; teste de caracterização; skills locais do Claude
  Code; refatoração em passos pequenos, cada um com a suíte completa.

## 3. Arquivos no meio de uma mudança

Nenhum.

## 4. O que foi alterado nesta sessão

`git log ea71cb7..fase/a4-sessao`: a análise do repositório inteira (PR
#5, mesclado) e os commits da A4 listados acima. O container do banco
**do trabalho** foi recriado (porta só em `127.0.0.1`).

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

**Pendências anotadas:**
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
- **Em casa, antes do `npm run dev`:** o `JWT_SECRET` do `.env` de lá
  precisa ter **32 caracteres ou mais** (auditoria L8; o servidor recusa
  subir com menos). O do trabalho tem 44. Gerar com
  `openssl rand -base64 32` se precisar. E recriar o container do banco
  (`docker compose up -d`) para a porta ficar só em `127.0.0.1` (L7).
- No trabalho, o Prettier ainda está instalado no lado Windows do VS
  Code (inofensivo; pode desinstalar — `SETUP.md` §12.4). O Copilot
  ficou desligado no projeto (`.vscode/settings.json`) e nas
  configurações do trabalho.

## 6. Próximo passo

1. O **B19**: começar pela skill **`/bug`** (registrar e fechar bugs nos
   documentos), testada no registro dele; depois, o teste de
   concorrência que falha e o conserto, dentro do `aplicarTransicao`.
2. Durante a fase: Matthew instala as cinco ferramentas do
   `CONSTRAINTS.md` e escreve os scripts `verificar:rapido`,
   `verificar:item` e `scripts/piso.mjs`.

**Chegando em casa:** rodar o **`/retomar`** (primeiro uso real; ele
segue os passos abaixo e confere plugins e ferramentas). Desde a última
vez que a branch foi usada em casa (antes da A3 entrar): as duas
migrations da A3 (`dias_de_calendario_como_date` e
`investigacao_obrigatoria_na_acao`), o
`.env.example` com as credenciais do compose e o `JWT_SECRET` de 32
caracteres ou mais, e nenhuma dependência nova (o `package-lock.json`
não mudou). O `npm run preparar` resolve as migrations. Se algo sair
diferente do esperado, ajustar a skill. Os passos, para referência
(`SETUP.md` §12.1 se o PC estiver parado há tempo):

1. Docker Desktop aberto ("Engine running"), Ubuntu, pasta do projeto.
2. `git fetch`, `git switch fase/a4-sessao`, `git pull`.
3. **`npm run preparar`**: obrigatório. Aplica as migrations do
   `@db.Date` e do `investigacaoId` obrigatório (`NOT NULL`, RN-49) no
   banco de lá. Se esta última falhar (o banco de casa tem ações sem
   investigação), recriar o banco: `SETUP.md` §12, passos 6 e 7 (reset +
   usuários de teste).
4. **`JWT_SECRET` com 32 caracteres ou mais** no `.env` de casa, e
   `docker compose up -d` para recriar o container (ver as pendências
   acima). O `DATABASE_URL` do `.env.example` agora tem as credenciais
   do compose.
5. Extensões do VS Code: a lista do **`SETUP.md` §12.4** (um comando no
   terminal do WSL + duas no Windows). Conferir `node -v` (24). O Copilot
   já vem desligado pelo `.vscode/settings.json` do projeto.
6. **Primeira foto de casa:** `npm run ambiente -- casa` e depois
   `npm run ambiente -- comparar` (`SETUP.md` §12.5). O esperado: só o
   `hostname` e as extensões que **não** vão para casa (Prettier, REST
   Client, Live Server, Docker antiga, Dev Containers). Registrar aqui o
   que mais aparecer, e commitar o `docs/ambiente/casa.txt`.
7. `npm test` para confirmar: **266 passando**.
