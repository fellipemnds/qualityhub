# Handoff — estado da sessão

> Lido no **início de toda sessão** (regra no `CLAUDE.md`) e atualizado
> no **fim de toda sessão** ou quando Matthew disser "vou trocar de
> computador". Aqui fica só o que muda de sessão para sessão; o que é
> estável mora nos documentos apontados.

**Última atualização:** 2026-10-01 (início do dia, no trabalho — Matthew não mexeu em casa no dia 30; a primeira foto de casa continua pendente).

## 1. Objetivo

Fase **A3 — correções de regra** (`docs/plano-implementacao.md`, seção
A3): cada bug com um teste que falha antes e passa depois (TDD).

## 2. Estado atual

- **A2 mesclada** (PR #3). Branch **`fase/a3-correcoes`**, PR **#4 em
  rascunho** (https://github.com/fellipemnds/qualityhub/pull/4).
- **Feito na A3** (ordens 1 a 6 do plano):
  - **B9** (Matthew, primeiro TDD): `detectadoEm` comparado com o agora
    a cada validação (`.refine`), com relógio falso no teste.
  - **B11**: `hojeEmSaoPaulo()` em `src/compartilhado/datas/` (com
    `formatToParts`); ano do código, prazo da verificação e B9 no dia de
    São Paulo. **Testes rodam em `TZ=UTC`** (`vitest.config.ts`, escrito
    por Matthew).
  - **B14**: transições com `z.date()` (recusa `null`); entrada da API só
    em `"AAAA-MM-DD"` (`diaDeCalendario()`, `meiaNoiteUtc()`); colunas de
    dia como **`@db.Date`** (migration `dias_de_calendario_como_date`).
    Convenção registrada no TRD §6.
  - **Plano aprovado** derivado de `Aprovacao`
    (`acaoCorretivaRepository.planoAprovado`), exposto no `GET`.
  - **B1**: finalizar a execução exige o plano aprovado.
  - **B2**: plano travado depois de aprovado (`CAMPOS_DO_PLANO`; o
    submeter também recusa). Degrau `"PLANO_APROVADO"` no
    `levarAcaoCorretivaAte`.
- Suíte: **248 passando + 2 falhas esperadas** (`it.fails`: os dois do
  B18), 33 arquivos, ~140–160 s. Lint e typecheck limpos.
- O que Matthew aprendeu hoje: TDD (vermelho pelo motivo certo →
  verde); valor × função (o `new Date()` calculado na carga); relógio
  falso (`vi.useFakeTimers({ toFake: ["Date"] })`, login **depois** de
  mexer no relógio, `afterEach` com `useRealTimers`); fuso horário
  (instante × dia de calendário, fuso do servidor × fuso do negócio,
  por que os testes rodam em UTC); `Intl.DateTimeFormat` e
  `formatToParts`; Temporal (Node 26); valor derivado × guardado.

## 3. Arquivos no meio de uma mudança

Nenhum.

## 4. O que foi alterado nesta sessão

`git log e3f778b..fase/a3-correcoes` (inclui o fechamento da A2). Bugs
corrigidos marcados com ✅ em `docs/esquema-backend.md` §7; convenção de
datas no `docs/trd.md` §6; extensões e versões do ambiente no
`SETUP.md` §12.4 (novo); foto do ambiente (`npm run ambiente`,
`docs/ambiente/trabalho.txt`) no §12.5 (novo).

**Push feito** (até `3744a21`) e **CI do PR #4 verde**, já com a
migration do `@db.Date`. Falta marcar no PR #4 as ordens 3 a 6.

**2026-10-01, foto do trabalho:** só mudou a extensão do Claude Code
(2.1.285 → 2.1.286, atualização automática).

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

**Pendências anotadas:**
- **Node 26 vira LTS em 28/10/2026.** Depois disso, avaliar a migração:
  conferir o suporte do Prisma 7 e das dependências; ao migrar, trocar o
  corpo do `hojeEmSaoPaulo()` por
  `Temporal.Now.plainDateISO("America/Sao_Paulo").toString()` (os testes
  da função provam a troca). O Node 24 tem segurança até 30/04/2028.
- Na D1: excluir `**/*.test.ts` e `src/testes/` do build.
- **Suíte em ~120–160 s.** Medir antes de otimizar; um banco por worker
  é a opção de maior ganho. **Não** montar cenário direto no banco.
- **Rever o `podeExecutar`** (colaborador **ou** aprovador designado × o
  PRD §8, que pede colaborador): decidir com a analista se vira bug.
- **Aprovador na lista das guardas: na C2** (decidido em 2026-10-01).
  Hoje o `cicloVidaService.submeter` confere o aprovador **antes** da
  guarda do tipo, então a NC sem aprovador recebe o 409 genérico, sem a
  lista do que falta (só mensagem; a regra está protegida, e a tela usa
  o checklist). Na C2, quando os seis tipos ganharem a lista do envio,
  o aprovador entra nela para todos de uma vez. Registrado no plano (C2)
  e no esquema §4.3.
- No trabalho, o Prettier ainda está instalado no lado Windows do VS
  Code (inofensivo; pode desinstalar — `SETUP.md` §12.4).

## 6. Próximo passo

**Chegando em casa** (primeira vez no dia; `SETUP.md` §12.1 se o PC
estiver parado há tempo):

1. Docker Desktop aberto ("Engine running"), Ubuntu, pasta do projeto.
2. `git fetch` e `git switch fase/a3-correcoes` (a branch é nova para o
   PC de casa), depois `git pull`.
3. **`npm run preparar`** — obrigatório: aplica as migrations do
   `@db.Date` e do `investigacaoId` obrigatório (`NOT NULL`, RN-49) no
   banco de lá. Se esta última falhar (o banco de casa tem ações sem
   investigação), recriar o banco: `SETUP.md` §12, passos 6 e 7 (reset +
   usuários de teste). O do trabalho já precisou, em 2026-10-01.
4. Extensões do VS Code: a lista do **`SETUP.md` §12.4** (um comando no
   terminal do WSL + duas no Windows). Conferir `node -v` (24).
5. **Primeira foto de casa:** `npm run ambiente -- casa` e depois
   `npm run ambiente -- comparar` (`SETUP.md` §12.5). O esperado: só o
   `hostname` e as extensões que **não** vão para casa (Prettier, REST
   Client, Live Server, Docker antiga, Dev Containers). Registrar aqui o
   que mais aparecer, e commitar o `docs/ambiente/casa.txt`.
6. `npm test` para confirmar: 248 + 2 falhas esperadas.

**Depois, na A3:** a ordem 8 inteira (8a–8f, regra revista na **PRD
Q17** e **Q18**) está feita: escada de cenários na ordem real, RN-49,
`avaliarFechamentoNC` (Matthew, TDD), submeter da NC com a lista e
`GET /nc/:id/checklist-fechamento`, RN-24 na investigação (o B5) e RN-50
(cancelar investigação com ação pendente). A **ordem 9 (B4)** também:
`NAO_EFICAZ` reabre só o que estiver fechado. E a **ordem 10 (B6)**:
`PARCIALMENTE_EFICAZ` copia todos os colaboradores. E a **ordem 11
(B3)**: o autor da ação automática é quem concluiu a verificação. E a
**ordem 12 (B13)**: filho nasce com o aprovador da NC (RN-46). E a
**ordem 13 (B12)**: cancelar recusa rascunho (RN-06). E a **ordem 14
(B8)**: a rota `DELETE /verificacoes/:id` saiu. E a **ordem 15
(B15)**: contador criado ou incrementado num comando só (`INSERT ...
ON CONFLICT`). E a **ordem 16 (B16)**: colaborador inexistente
responde 404. E a **ordem 17 (B17)**: atribuições só em
`RASCUNHO`/`ABERTO`, com a ação `TROCAR_APROVADOR_EM_APROVACAO` (RN-47).
E a **ordem 18 (RN-48)**: retirar da aprovação, nos cinco tipos com portão.
O próximo é a **ordem 19, o B18**, o último da A3: os testes já existem
com `it.fails`.
