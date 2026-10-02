# Handoff — estado da sessão

> Lido no **início de toda sessão** (regra no `CLAUDE.md`) e atualizado
> no **fim de toda sessão** ou quando Matthew disser "vou trocar de
> computador". Aqui fica só o que muda de sessão para sessão; o que é
> estável mora nos documentos apontados.

**Última atualização:** 2026-10-02 (início do dia, no trabalho; Matthew não mexeu em casa, então a A3 ainda não foi mesclada e o `casa.txt` ainda não existe).

## 1. Objetivo

Fase **A3 — correções de regra** (`docs/plano-implementacao.md`, seção
A3): cada bug com um teste que falha antes e passa depois (TDD). **Todas
as 19 ordens estão feitas e commitadas**; falta fechar a fase (CI e merge).

## 2. Estado atual

- Branch **`fase/a3-correcoes`**, PR **#4 em rascunho**
  (https://github.com/fellipemnds/qualityhub/pull/4), com a lista de
  ordens marcada até a 18 e um parágrafo sobre a regra revista.
- **Feito em 2026-10-01** (detalhes em cada linha do `docs/esquema-backend.md` §7):
  - **B10**: a ação só aponta para investigação desta NC.
  - **Regra revista com a analista (PRD Q17, Q18):** os planos de ação
    são conferidos pela **Investigação**, não pela NC — RN-21 e RN-24
    revistas, RN-49 (ação nasce ligada a investigação **aberta**, coluna
    `NOT NULL`) e RN-50 (cancelar investigação com ação pendente é
    recusado). Registro no `docs/changelog-arquitetura.md` (seção A3).
  - **Ordem 8 (8a–8f):** escada de cenários na ordem real
    (`investigacaoAberta` → `ncProntaParaFechar` com a ação de plano
    aprovado); RN-49; **`avaliarFechamentoNC`, escrita por Matthew em TDD**
    (primeira função pura do projeto); submeter da NC com 409 e a lista
    no campo `error` + `GET /nc/:id/checklist-fechamento`; RN-24 na
    investigação (o **B5**); RN-50.
  - **B4, B6, B3, B13, B12, B8, B15, B16, B17, RN-48 e B18** (ordens 9 a 19).
- Suíte: **250 passando, nenhuma falha esperada** (os `it.fails` do B15
  e do B18 viraram `it`), 33 arquivos, ~140–160 s. Lint e typecheck
  limpos.
- O que Matthew aprendeu hoje: função pura (sem banco nem relógio,
  testada em milissegundos) e a divisão "o service carrega, a função
  decide"; `.some`, `.filter`, `.map`, `.every`; ternário e `&&`; `??` com
  `.trim()`; alargamento de tipos (`"RASCUNHO"` virando `string` sem a
  anotação); `toMatchObject` em listas; distinguir **teste errado** de
  **código errado**; prova de quebra; o Copilot embutido no VS Code (e
  por que desligá-lo para aprender).

## 3. Arquivos no meio de uma mudança

Nenhum. O B18 foi commitado no fim do dia, com este handoff.

## 4. O que foi alterado nesta sessão

`git log 3744a21..fase/a3-correcoes` — de B10 a RN-48, um commit por
item. **Push:** Matthew dá no trabalho, no fim do dia. Depois: conferir
o **CI do PR #4** (o primeiro com a migration
`investigacao_obrigatoria_na_acao`).

O banco de desenvolvimento **do trabalho** foi resetado (tinha 10 ações
sem investigação) e os usuários de teste recarregados.

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
- No trabalho, o Prettier ainda está instalado no lado Windows do VS
  Code (inofensivo; pode desinstalar — `SETUP.md` §12.4). O Copilot
  ficou desligado no projeto (`.vscode/settings.json`) e nas
  configurações do trabalho.

## 6. Próximo passo

**Fechar a A3** (de onde estiver):

1. ~~Conferir o **CI do PR #4**~~ — **verde** no `c173051` (conferido em 2026-10-02).
   Foto do trabalho de 2026-10-02: só Docker 29.8.0 → 29.8.1 e a
   extensão do Claude Code 2.1.286 → 2.1.287 (nada que afete o projeto).
2. Checklist "pronto quando" do plano §1.1; tirar o PR #4 do rascunho e
   fazer o merge na `main` (pode ser no trabalho mesmo).
3. Depois: a **A4 — Sessão nova** (o B7), conforme o plano.

**Chegando em casa** (primeira vez com esta branch; `SETUP.md` §12.1 se
o PC estiver parado há tempo):

1. Docker Desktop aberto ("Engine running"), Ubuntu, pasta do projeto.
2. `git fetch` e `git switch fase/a3-correcoes` (ou a `main`, se a A3
   já tiver sido mesclada), depois `git pull`.
3. **`npm run preparar`** — obrigatório: aplica as migrations do
   `@db.Date` e do `investigacaoId` obrigatório (`NOT NULL`, RN-49) no
   banco de lá. Se esta última falhar (o banco de casa tem ações sem
   investigação), recriar o banco: `SETUP.md` §12, passos 6 e 7 (reset +
   usuários de teste).
4. Extensões do VS Code: a lista do **`SETUP.md` §12.4** (um comando no
   terminal do WSL + duas no Windows). Conferir `node -v` (24). O Copilot
   já vem desligado pelo `.vscode/settings.json` do projeto.
5. **Primeira foto de casa:** `npm run ambiente -- casa` e depois
   `npm run ambiente -- comparar` (`SETUP.md` §12.5). O esperado: só o
   `hostname` e as extensões que **não** vão para casa (Prettier, REST
   Client, Live Server, Docker antiga, Dev Containers). Registrar aqui o
   que mais aparecer, e commitar o `docs/ambiente/casa.txt`.
6. `npm test` para confirmar: 250 passando.
