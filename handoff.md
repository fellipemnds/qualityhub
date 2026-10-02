# Handoff — estado da sessão

> Lido no **início de toda sessão** (regra no `CLAUDE.md`) e atualizado
> no **fim de toda sessão** ou quando Matthew disser "vou trocar de
> computador". Aqui fica só o que muda de sessão para sessão; o que é
> estável mora nos documentos apontados.

**Última atualização:** 2026-10-02 (meio do dia, no trabalho). A A3 foi mesclada; a análise do repositório está no PR #5, ainda aberto; o `casa.txt` ainda não existe.

## 1. Objetivo

**Análise do repositório antes da A4**, com as skills do `agent-skills`:
contrato de qualidade, auditoria de segurança, revisão e simplificação
de código, e mais uma análise que Matthew vai trazer. Depois, a **A4 —
Sessão nova** (`docs/plano-implementacao.md`, seção A4).

## 2. Estado atual

- **A3 concluída:** PR #4 mesclado na `main` (`ea71cb7`), branch local
  apagada.
- Branch **`chore/analise-repositorio`**, **PR #5 aberto**
  (https://github.com/fellipemnds/qualityhub/pull/5), CI verde no
  `36d27c3`. Matthew faz o merge.
  - `CONSTRAINTS.md` (contrato de qualidade) e a regra no `CLAUDE.md`.
  - Auditoria de segurança: L2, L7 e L8 aplicados; B19 registrado
    (`esquema-backend.md` §7); os outros achados alocados no plano (A4,
    A5, A6).
  - Revisão de código: o alvo é o `ciclo-vida.service.ts`. Os testes de
    caracterização e as quatro simplificações estão na tabela da A4,
    **antes do B19**. O texto dos testes já foi aprovado na conversa de
    2026-10-02: auditoria de cada transição e 404 das transições, num
    arquivo novo, `src/compartilhado/registro/ciclo-vida.service.test.ts`.
- Suíte: **251 passando** (o teste novo do bcrypt), ~175 s nesta
  máquina. Lint e typecheck limpos.
- O que Matthew aprendeu hoje: contrato de qualidade ("medir e travar",
  piso, exceção com dono e prazo); modelagem de ameaças e OWASP (IDOR,
  TOCTOU, enumeração por tempo, custo do bcrypt); Cerca de Chesterton;
  teste de caracterização.

## 3. Arquivos no meio de uma mudança

Nenhum.

## 4. O que foi alterado nesta sessão

`git log ea71cb7..chore/analise-repositorio`: o contrato de qualidade,
a alocação da auditoria, o endurecimento (L2, L7, L8) e este registro.
O container do banco **do trabalho** foi recriado (porta só em
`127.0.0.1`).

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

1. **A outra análise** que Matthew vai trazer, ainda na
   `chore/analise-repositorio` (o PR #5 recebe os commits novos).
2. Merge do PR #5; voltar para a `main`, `git pull`, apagar a branch
   local.
3. **Abrir a A4** (`fase/a4-sessao`), na ordem da tabela da A4:
   1. commit `docs:`: este handoff no início da fase;
   2. commit `test:`: os testes de caracterização (o texto aprovado);
   3. as quatro simplificações do `ciclo-vida`, cada uma num commit
      `refactor:` com a suíte completa (a `estadoAposDecisao` é de
      Matthew);
   4. o B19;
   5. depois, o resto da A4.
4. Durante a A4: Matthew instala as cinco ferramentas do
   `CONSTRAINTS.md` antes de o aviso virar bloqueio.

**Chegando em casa** (primeira vez depois da A3; `SETUP.md` §12.1 se o
PC estiver parado há tempo):

1. Docker Desktop aberto ("Engine running"), Ubuntu, pasta do projeto.
2. `git fetch`, `git switch main` (ou a branch onde o trabalho estiver),
   `git pull`.
3. **`npm run preparar`**: obrigatório. Aplica as migrations do
   `@db.Date` e do `investigacaoId` obrigatório (`NOT NULL`, RN-49) no
   banco de lá. Se esta última falhar (o banco de casa tem ações sem
   investigação), recriar o banco: `SETUP.md` §12, passos 6 e 7 (reset +
   usuários de teste).
4. **`JWT_SECRET` com 32 caracteres ou mais** no `.env` de casa, e
   `docker compose up -d` para recriar o container (ver as pendências
   acima).
5. Extensões do VS Code: a lista do **`SETUP.md` §12.4** (um comando no
   terminal do WSL + duas no Windows). Conferir `node -v` (24). O Copilot
   já vem desligado pelo `.vscode/settings.json` do projeto.
6. **Primeira foto de casa:** `npm run ambiente -- casa` e depois
   `npm run ambiente -- comparar` (`SETUP.md` §12.5). O esperado: só o
   `hostname` e as extensões que **não** vão para casa (Prettier, REST
   Client, Live Server, Docker antiga, Dev Containers). Registrar aqui o
   que mais aparecer, e commitar o `docs/ambiente/casa.txt`.
7. `npm test` para confirmar: 251 passando.
