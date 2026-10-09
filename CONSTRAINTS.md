# Contrato de qualidade

> **O que é este arquivo:** a régua de "bom o bastante para entrar na
> `main`" deste projeto, com números e com o comando que verifica cada
> um. Vale para qualquer pessoa ou agente que escreva código aqui.
> Apertar a régua pode ser feito em silêncio; afrouxar, nunca — ver o
> fim do arquivo.
>
> **Última revisão:** 2026-10-02, por Matthew (entrevista da skill
> `constraint-driven-development`).

---

## 1. Piso (sempre exigido, sem ferramenta nova)

Vale para todo diff, fora do código gerado (`src/generated/`, que não
vai para o Git).

- **Nenhuma supressão nova:** `@ts-ignore`, `@ts-expect-error`,
  `@ts-nocheck`, `biome-ignore`, `eslint-disable`, `v8 ignore` /
  `istanbul ignore`, `nosemgrep`, `gitleaks:allow`. Se o checker está
  errado, a saída é uma linha na tabela de Exceções (§5), não um
  comentário no código.
- **Nenhum trabalho pela metade:** `throw new Error("Not implemented")`
  (ou equivalente), `catch {}` vazio, `TODO`/`FIXME` no lugar da
  implementação.
- **Nenhum teste facilitado:** `.skip`, `.only`, `.todo`, `xit`,
  `xdescribe`; arquivo de teste apagado ou `expect` removido de teste
  que continua existindo — só com o motivo escrito na mensagem do
  commit.
  - **Única exceção, já em uso:** `it.fails` para um bug **registrado**
    no `docs/esquema-backend.md` §7 (o teste que prova o bug antes do
    conserto). O commit do conserto troca para `it`.
- **Nenhum segredo no código:** senha, token, chave ou `JWT_SECRET`
  real só no `.env` (fora do Git); o `.env.example` leva só valores de
  exemplo.
- **Nenhuma configuração afrouxada:** regra desligada no `biome.json`,
  opção de rigor desligada no `tsconfig.json` (`strict`,
  `noUncheckedIndexedAccess`), passo removido do `.github/workflows/ci.yml`.
- **Este arquivo não é afrouxado para uma mudança passar** (§6).

Hoje o código cumpre o piso inteiro: nenhuma supressão, `TODO` ou
`catch {}` vazio fora de `src/generated/` (conferido em 2026-10-02).

---

## 2. Exigido com número

| Dimensão | Regra | Verificado por | Roda em | Falha | Situação |
|---|---|---|---|---|---|
| Tipos | Zero erros | `npm run typecheck` (`tsc --noEmit`) | cada edição, CI | **bloqueia** | ✅ em uso |
| Lint e formatação | Zero erros na nossa config (Biome `recommended`, com `noUnusedImports` subido de aviso para erro em 2026-10-08: o `recommended` só avisava, e o lint passava; e o `noFloatingPromises`, experimental, ligado em 2026-10-09: pega a promessa sem `await` de função `async` nossa, mas não a do Prisma, que o Biome não reconhece como promessa) | `npm run lint` (`biome check .`) | cada edição, CI | **bloqueia** | ✅ em uso |
| Testes | Todos passando | `npm test` (Vitest + Testcontainers) | ao fechar um item (§4), CI | **bloqueia** | ✅ em uso |
| Segredos | Nenhum segredo no código nem no histórico, fora as exceções (§5) | `gitleaks detect --redact --no-banner` (v8.30.1, job `segredos`; exceções no `.gitleaksignore`) | CI | **bloqueia** | ✅ em uso |
| Arquitetura | Zero violações das regras da §2.1 | `npm run lint` (Biome: `noRestrictedImports` por grupo de arquivo e `noImportCycles`, no `biome.json`) | cada edição, CI | **bloqueia** | ✅ em uso |
| Segurança: código (SAST) | Nada de severidade alta ou acima, fora as exceções (§5) | `semgrep scan --config p/default --config p/owasp-top-ten --severity ERROR --error --quiet` (1.179.0 pelo `pipx`, job `sast`; exceções no `.semgrepignore`) | CI | **bloqueia** | ✅ em uso |
| Segurança: dependências | Nada de severidade alta ou acima, fora as exceções (§5) | `osv-scanner scan source -r .` (v2.6.0, job `dependencias`; exceções no `osv-scanner.toml`, com `ignoreUntil` na validade da §5) | CI | **bloqueia** | ✅ em uso |
| Cobertura do projeto | Não cai mais de 0,5% abaixo do valor da §3 | `npm run test:cobertura` (`vitest run --coverage`, `@vitest/coverage-v8`; a trava é o `thresholds.lines` do `vitest.config.ts`) | ao fechar um item (§4), CI | **bloqueia** | ✅ em uso |
| Cobertura das linhas novas | 100% das linhas de produção novas ou modificadas no PR são executadas por algum teste. Linha impossível de alcançar vira exceção na §5, nunca trava mais baixa | `pipx run diff-cover==10.6.0 coverage/cobertura-coverage.xml --compare-branch=origin/<destino> --fail-under=100` (lê o relatório do `npm run test:cobertura`) | CI (só em PR) | **bloqueia** | ✅ em uso |

**Por que esses números:**
- **Tipos, lint e testes em zero:** já são a regra hoje; o CI bloqueia o
  PR. Rebaixar para "avisa" seria afrouxar.
- **Segredos e arquitetura bloqueiam desde o primeiro dia:** segredo que
  entra no histórico já vazou, mesmo apagado depois; e as regras de
  arquitetura já existem (no `CLAUDE.md`) e o código deve cumpri-las —
  o que a instalação achar de antigo vira exceção com prazo.
- **"Alta ou acima" em SAST e dependências:** abaixo disso é quase só
  ruído; é o corte padrão das ferramentas.
- **SAST, dependências e cobertura avisaram só durante a A4:** eram
  ferramentas novas no projeto; o período de aviso serviu para ver o que
  elas acusavam no código (e os falsos positivos) antes de travar. Desde
  o fim da A4, as três bloqueiam o PR.
- **Tolerância de 0,5% na cobertura:** absorve a variação quando um
  arquivo sem relação com a mudança mexe no total.

Um número sem comando nesta tabela é intenção, não regra. Linha
"⏳ a instalar" passa a valer quando a ferramenta estiver instalada e o
comando rodar — cada instalação é configuração, escrita por Matthew.

**Requisitos da instalação no CI (gitleaks, Semgrep, osv-scanner):**
- **Saída enxuta:** só o achado (regra, arquivo, linha), sem banner nem
  progresso — `--no-banner` no gitleaks, `--quiet` no Semgrep. O
  relatório completo vai para um arquivo (JSON/SARIF) guardado como
  artefato do CI, não para o log.
- **`--redact` no gitleaks é obrigatório:** sem ele, o segredo achado
  aparece no log do CI — que é justamente o vazamento que o check
  existe para evitar.
- **O corte é "alta ou acima" na própria ferramenta:** achados abaixo
  disso não falham o check nem aparecem como erro. O nome da flag muda
  por ferramenta e versão (no Semgrep, severidade `ERROR`); conferir na
  documentação da versão instalada, e, se a ferramenta não tiver o
  filtro, filtrar o JSON por severidade num passo do CI.
- **Exceções da §5 na config da ferramenta** (no osv-scanner, o
  `osv-scanner.toml`), cada uma com o ID da §5 no comentário — nunca
  baixando o corte para todo mundo.
- **"Avisa" no CI** é o passo com `continue-on-error: true`: aparece no
  PR, não bloqueia. Hoje nenhum passo tem essa linha (a A4 a tirou de
  todos); check novo que precise de período de aviso a usa, com prazo.

### 2.1 Regras de arquitetura (o que o Biome confere)

No `biome.json` (A4, 2026-10-05, escrito por Matthew): os `overrides`
dividem `src/` em grupos que não se sobrepõem (repositórios, services,
testes, `compartilhado/prisma/` e o resto), cada um com a lista
completa do que não pode importar, e o `noImportCycles` vale para todos.
O dependency-cruiser, escolhido antes, não lê o TypeScript 7 (analisava
0 arquivos e passaria sempre verde); o Biome já estava instalado e
confere a cada edição, não só antes do commit. A mensagem de cada
proibição aponta para a regra abaixo.

1. O client gerado do Prisma (`src/generated/prisma`) só é importado
   por arquivos `*.repository.ts` e por `src/compartilhado/prisma/`.
   Enums usados em Zod e services vêm de `src/compartilhado/entidades/`.
2. As camadas só dependem para baixo:
   `routes → controller → service → repository`. Um repository não
   importa service, controller nem routes; um service não importa
   controller nem routes.
3. Código de produção não importa nada de `src/testes/` nem arquivos
   `*.test.ts`.
4. Nenhum ciclo de importação.

Na instalação (2026-10-05), o código cumpria as quatro, sem nenhuma
exceção; cada regra foi provada com arquivos de mentira que a violavam.

---

## 3. Medido, ainda não exigido

"Medir e travar": cada número aqui é o valor real do projeto, e a
direção diz o que não pode acontecer. Quando melhora, atualiza-se o
número; quando piora, é achado.

| Métrica | Hoje | Direção | Quando vira regra |
|---|---|---|---|
| Cobertura do projeto (linhas) | **95,16%** (2026-10-05, na instalação; trava em 94,66%) | não pode cair | já na §2 |
| Cobertura das linhas novas ou modificadas no PR | **100%** (A4 inteira: 141 linhas novas, nenhuma sem teste) | não pode cair | já na §2 |
| Tempo da suíte completa | ~150–230 s (variou na A4; 225–228 s em 2026-10-06) | não passar de ~5 min | se passar: um banco por worker (`handoff.md`), **nunca** cortar teste |

A cobertura das linhas novas é medida e reportada desde o primeiro PR:
só a cobertura do projeto deixaria passar um arquivo pequeno sem teste
nenhum, porque ele quase não mexe no total.

---

## 4. Quando cada check roda

| Momento | O que roda | Tempo |
|---|---|---|
| **Depois de cada edição de arquivo** | `npm run lint` + `npm run typecheck` + piso (§1) no diff | < 10 s (hoje: ~1,7 s + ~3,8 s) |
| **Commit intermediário** (parte de um item ainda em andamento) | Tudo acima + os arquivos de teste do que mudou (`npx vitest run <arquivo>`) | ~20–40 s |
| **Fechar um item do plano, ou mudança no compartilhado** | Tudo acima + `npm run test:cobertura` (suíte **completa**, com a trava da cobertura) | ~3 min, sem atalho |
| **No CI (todo PR)** | Tudo acima + gitleaks, Semgrep e osv-scanner | sem limite |

**O que conta como "fechar um item":** o último commit de um item do
plano (uma ordem da A3, uma entrega da A4...) e o commit antes de pedir
o push. **Mudança no compartilhado** é qualquer arquivo em
`src/compartilhado/`, `src/middlewares/`, `src/app.ts`, `prisma/` ou
`src/testes/`: uma mudança no `ciclo-vida.service.ts` afeta os seis
tipos, e só a suíte completa pega isso. Commit só de documentação ou só
de formatação não roda testes.

Por que a suíte não roda a cada commit: com ~150–230 s ela passa da
meta de ~90 s de espera, e checagem que atrasa demais acaba sendo
pulada. A régua não cai: o **CI roda a suíte completa em todo PR e
bloqueia o merge** — o que muda é só onde um teste quebrado aparece
primeiro. Quando a suíte ficar abaixo de ~90 s (um banco por worker,
`handoff.md`), ela volta para todo commit.

---

## 5. Exceções

Toda exceção tem dono e validade. Vencida, ou se renova com novo
motivo, ou o problema é consertado. Os IDs começam com **X** para não
colidir com as decisões E1–E3 do `docs/esquema-backend.md` §9.

| ID | Regra | Onde | Motivo | Dono | Vence |
|---|---|---|---|---|---|
| X1 | Dependências: nada alto ou acima | `deepmerge-ts` e `mysql2`, transitivas do Prisma 7 (4 vulnerabilidades altas no `npm audit`) | Risco prático baixo, aceito no `docs/trd.md` §13 (o porquê fica lá; aqui, o dono e o prazo): o `deepmerge-ts` só junta a config do Prisma, que é nossa; o `mysql2` só é usado com MySQL. A "correção" do `npm audit fix --force` rebaixa para o Prisma 6 e quebra o projeto — **nunca rodar**. Reavaliar a cada atualização do Prisma | Matthew | 2026-12-31 |
| X2 | Segredos: nenhum no histórico | Dois tokens JWT de desenvolvimento em `.http` antigos (commits `e30f6f9` e `9226ebb`, de 16 e 17/09), no `.gitleaksignore` | Vencidos (5 h) e de um `JWT_SECRET` já trocado (L8). O repositório é público: o que entrou no histórico pode ter sido copiado, e reescrever o histórico não desfaz isso. Trocar o `JWT_SECRET` de todo ambiente que ainda use o antigo (o PC de casa) | Matthew | permanente (histórico); revisar se um token novo aparecer |
| X3 | Segredos: nenhum no código | O `JWT_SECRET` dos testes em `src/testes/setup-ambiente.ts`, no `.gitleaksignore` | Só vale no Postgres descartável do Testcontainers; não abre nenhum ambiente real. Se o arquivo mudar e o gitleaks acusar de novo, renovar a impressão | Matthew | permanente, enquanto for só de teste |
| X4 | SAST: nada alto ou acima | `testes/setup-usuarios-teste.sql` (hashes bcrypt dos 7 usuários de teste), no `.semgrepignore` | Seed do banco de desenvolvimento, com senhas de teste conhecidas. Nunca roda em produção | Matthew | permanente, enquanto for só de desenvolvimento |

---

## 6. Como esta régua muda

- **Apertar** (número melhor, regra nova, aviso virando bloqueio): pode
  vir em qualquer commit.
- **Afrouxar** (número pior, check removido ou rebaixado para aviso,
  exceção nova): só em **commit próprio**, separado da mudança que
  estava falhando, com o motivo na mensagem e **aprovação de Matthew**.
  Um agente que bate num check vermelho conserta o código; nunca propõe
  mexer na régua como saída.
- Na revisão de todo PR, conferir no diff: número da §2 ou §3 que
  baixou, `.skip`/`.only` novo, teste apagado ou `expect` removido,
  supressão nova, `catch {}` ou `TODO` novo, linha nova na §5.
