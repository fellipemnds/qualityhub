# QualityHub — Plano de Implementação

> **O que é este documento:** a ordem em que o sistema é construído a
> partir daqui — fases, o que cada uma entrega, quem escreve o quê, o
> que se aprende e quando a fase está pronta. Os documentos que ele
> executa: `docs/prd.md`, `docs/fluxo-app.md`, `docs/ui-ux.md`,
> `docs/trd.md`, `docs/esquema-backend.md`.
>
> **Status:** v1 (2026-09-24). Decisões na §1 e na §9.
>
> **Sem datas, de propósito.** O time não tem pressa (PRD §2); o plano
> diz a **ordem** e o **tamanho relativo** (P, M, G), não prazos.

---

## 1. Como trabalhamos

Decidido com Matthew em 2026-09-24:

| Regra | Como funciona |
|---|---|
| **Fundação antes do front** | Testes, correções, sessão, contrato da API e usuários ficam prontos antes da primeira tela (Bloco A) |
| **Depois, fatias verticais** | Cada funcionalidade nova (Feed, anexos, pendências, relatórios...) é feita **junto com a tela dela**: backend + tela da mesma coisa, na mesma fase (Bloco C) |
| **Quem escreve** | 🧑 **Matthew** escreve **tudo o que puder ser codado**, inclusive configuração (Vitest, CI, scripts), depois de Claude explicar o conceito. 🤖 **Claude** só gera o que é **repetição** de um padrão que Matthew já escreveu. 👀 Claude revisa tudo. *(Decidido em 2026-09-24: esta regra vale sobre as marcações 🤖 das tabelas abaixo — item que não for repetição passa a ser 🧑.)* *(Revisto em 2026-09-28: Matthew escreve só o que ensina conceito novo — o teste "pronto quando" da A1, o de concorrência da A2 e o B9 da A3; Claude faz o resto na ordem do plano, anunciando antes de cada item e esperando a confirmação de Matthew. Esta revisão vale sobre as marcações 🧑 das tabelas.)* |
| **Git** | **Uma branch e um Pull Request por fase.** O CI roda no PR; só entra na `main` com tudo verde |
| **Bug** | Começa por um **teste que falha**; o conserto faz passar (TRD §9.4) |
| **Arquivos `.http`** | Cada um é **apagado** quando um teste automático cobre o mesmo fluxo |
| **Dois computadores** | Matthew alterna entre trabalho e casa: **push ao sair, `git pull` + `npm run preparar` ao chegar**, e o `handoff.md` sempre atualizado (`SETUP.md` §12) |

### 1.1 Pronto quando (vale para toda fase)

- [ ] Testes novos escritos, e **todos** os testes passando
- [ ] `typecheck` e Biome sem erros
- [ ] CI verde no Pull Request
- [ ] Documentos atualizados: changelog (decisões), status no documento
      afetado, `CLAUDE.md` (se mudou algo que uma sessão futura precisa
      saber)
- [ ] `.http` coberto aposentado
- [ ] **Matthew consegue explicar** o que a fase mudou e por quê

---

## 2. Visão geral

```mermaid
flowchart TD
    subgraph A[Bloco A — Fundação do backend]
        A0[A0 Preparação] --> A1[A1 Aprender testes<br/>+ infraestrutura]
        A1 --> A2[A2 Rede de proteção]
        A2 --> A3[A3 Correções B1–B18]
        A3 --> A4[A4 Sessão nova]
        A4 --> A5[A5 Contrato da API]
        A5 --> A6[A6 Usuários e setores]
        A6 --> A7[A7 Travas entre linhas]
    end

    subgraph B[Bloco B — Design, em paralelo]
        B1[B1 Identidade visual] --> B3
        B2[B2 Wireframes Figma] --> B3[B3 Mockups]
        B3 --> B4[B4 Protótipo HTML<br/>+ teste com colegas]
    end

    subgraph C[Bloco C — Frontend em fatias]
        C0[C0 Base do front<br/>+ login] --> C1[C1 NCs]
        C1 --> C2[C2 Itens filhos]
        C2 --> C3[C3 Pendências]
        C3 --> C4[C4 Feed]
        C4 --> C5[C5 Anexos]
        C5 --> C6[C6 Administração]
        C6 --> C7[C7 Relatórios]
        C7 --> C8[C8 Revisão final]
    end

    subgraph D[Bloco D — Produção]
        D0{D0 Decidir<br/>hospedagem} --> D1[D1 Ambiente de produção]
        D1 --> D2[D2 Piloto]
        D2 --> D3[D3 Planilha aposentada]
    end

    A7 --> C0
    B4 --> C0
    D0 -.-> C5
    C8 --> D1
```

O **Bloco B** não depende do código: pode andar enquanto o Bloco A
acontece. A **decisão de hospedagem (D0)** também pode sair a qualquer
momento, mas precisa existir **antes do C5** (anexos).

---

## 3. Bloco A — Fundação do backend

### A0 — Preparação · P

**Objetivo:** limpar o terreno antes de escrever testes.

| Entrega | Quem |
|---|---|
| Scripts no `package.json`: `typecheck`, `lint`, `lint:fix`. **Feito** — `test` entra na A1 (com o Vitest) e `build` na D1 (onde é usado) | 🤖 |
| Biome configurado; primeira formatação do código (commit separado, só formatação) | 🤖 |
| Remover o barramento de eventos (ADR-38) | 🤖 |
| `ignoreTrailingSlash` → `routerOptions` (pendência 5) | 🤖 |
| Apagar os modelos comentados no fim do `schema.prisma` (M5) | 🤖 |
| Apagar `testes/requests-acao-corretiva.http` (descreve o modelo antigo) | 🤖 |
| Proteger a `main` no GitHub (exigir PR para entrar) | 🧑 na interface do GitHub, com instruções |
| Decidir como os Pull Requests são abertos. **Decidido:** o PR da A0 pelo site do GitHub (para ver cada etapa); o `gh` é instalado no começo da A1, quando ler o CI passa a importar | 🧑 decide |

**Aprendizado:** o que é lint e formatação automática; o que é proteção
de branch.

### A1 — Aprender testes + infraestrutura · M

**Objetivo:** Matthew entende e escreve testes; o projeto passa a ter
onde colocá-los.

**Pré-requisito:** Docker Desktop **aberto** — os testes criam um
Postgres pelo Docker. A integração com o WSL foi confirmada em
2026-09-24.

**Conceitos**, explicados antes de codar, nesta ordem:
1. O que é um teste automático e o que ele protege.
2. A estrutura de todo teste: **preparar → agir → conferir**.
3. Teste **unitário** × teste **de API** — e por que aqui a maioria é de
   API (TRD §9.3).
4. `app.inject()`: simular uma requisição sem abrir porta.
5. **Testcontainers**: um Postgres de verdade, criado e destruído pelo
   próprio teste.
6. **Isolamento**: por que cada teste começa com o banco vazio.
7. **Fábricas**: funções que criam usuários e itens de teste com uma
   linha.
8. Ler um teste que falha: a mensagem, o esperado e o recebido.

| Entrega | Quem |
|---|---|
| Vitest + Testcontainers configurados; banco criado uma vez por execução, tabelas limpas antes de cada teste | 🧑 com orientação passo a passo |
| Fábricas: os 7 perfis de usuário de `setup-usuarios-teste.sql`; login devolvendo o token | 🧑 a primeira, 🤖 as outras seguindo o padrão |
| **Um único helper de autenticação** para os testes (`loginComo(perfil)`): na A4 o login passa a devolver cookie em vez de token, e só esse helper muda | 🧑 |
| **Primeiros testes**: login com sucesso, senha errada, usuário sem senha (RN-38) | 🧑 |
| **Um teste unitário**: `temPapel` | 🧑 |
| **Instalar e autenticar o `gh`** (`sudo apt install gh` + `gh auth login`), para Claude abrir PRs e ler o resultado do CI | 🧑 com instruções |
| **GitHub Actions**: `npm ci` → `prisma generate` → Biome → typecheck → testes, em todo push e PR (o `prisma generate` é obrigatório porque `src/generated/` não vai para o Git — TRD §9.5). Depois disso, exigir o CI verde na proteção da `main` | 🧑 com orientação |

**Pronto quando:** Matthew escreveu sozinho um teste de API novo (ex.:
criar rascunho de NC) sem consultar exemplo.

### A2 — Rede de proteção · M

**Objetivo:** tudo que **já funciona** hoje fica coberto por teste,
antes de qualquer mudança de regra.

| Entrega | Quem |
|---|---|
| **Fluxo completo** (a partir de `requests-fluxo-completo.http`): NC → classificação → contenção → investigação → ação → verificação → fechamento | 🧑 o caminho feliz; 🤖 os modos de falha |
| Máquina de estados: cada transição válida e inválida, para cada tipo | 🤖 (padrão repetido por tipo), 🧑 a primeira |
| Permissões: as três camadas; "tem o papel mas não é **o** aprovador"; RN-20 (classificar) | 🧑 |
| Código sequencial **sob concorrência**: várias publicações simultâneas, nenhum número repetido ou pulado | 🧑 com orientação (é o teste mais interessante do projeto) |
| Atribuições: um aprovador por item, sem duplicata, RN-12 | 🤖 |
| Aposentar os `.http` cobertos | 🤖 |

**Os bugs B1–B18 não entram aqui.** Esta fase fotografa o que está
**certo**; os bugs ganham seus testes na A3.

### A3 — Correções de regra · G

**Objetivo:** corrigir os comportamentos errados (`esquema-backend.md`
§7), cada um com um teste que falha antes e passa depois.

| Ordem | Correção | Quem |
|---|---|---|
| 1 | **B9** — data de detecção comparada com o dia de hoje **a cada validação** (hoje, com o servidor ligado há dias, ninguém registra NC nova). Primeiro porque é grave e pequeno — bom primeiro TDD | 🧑 |
| 2 | **B11** — função "dia de hoje em `America/Sao_Paulo`", usada no ano do código, nos prazos e no B9 | 🧑 |
| 3 | **B14** — data obrigatória vazia recusada nos cinco schemas (hoje o `null` vira 01/01/1970). Junto do B11 porque também é sobre datas | 🤖 |
| 4 | **Plano aprovado** derivado de `Aprovacao` (§4.2 do esquema) — base das próximas | 🧑 |
| 5 | **B1** — finalizar execução exige plano aprovado | 🧑 |
| 6 | **B2** — plano travado depois de aprovado | 🧑 |
| 7 | **B10** — investigação obrigatória no plano, da mesma NC, não cancelada | 🧑 |
| 8a | **Escada de cenários na ordem real** (PRD Q17): investigação aberta → ação com plano aprovado → investigação fechada; o `levarAcaoCorretivaAte` parte de uma investigação aberta. Só refatoração: nenhuma regra muda, a suíte continua verde com os mesmos testes. Commit separado | 🤖 |
| 8b | **RN-49** — `investigacaoId` obrigatório na criação, não se apaga, só com investigação em `ABERTO` (amplia o B10). Migration: coluna `NOT NULL`, para o banco também garantir | 🤖 |
| 8c | **`avaliarFechamentoNC`** — função pura que devolve a lista do que falta, um item por requisito, em dois grupos, filhos e envio (RN-21: toda investigação não cancelada fechada; TRD §5, esquema §4.3). Testada sem banco | 🧑 |
| 8d | **Submeter da NC** usando a função: 409 com a lista (o `AppError` passa a levar detalhes no campo `error`) + rota `GET /nc/:id/checklist-fechamento` | 🤖 |
| 8e | **RN-24 — o B5**: a Investigação só é submetida com os planos das suas ações aprovados; mesmo formato de lista e 409 do 8d. Vem depois da RN-49, que garante que nenhuma ação se liga depois do envio | 🤖 |
| 8f | **RN-50** — cancelar a Investigação exige as ações dela canceladas ou fechadas (409 com a lista das que faltam) | 🤖 |
| 9 | **B4** — `NAO_EFICAZ` reabre só o que estiver fechado | 🧑 |
| 10 | **B6** — `PARCIALMENTE_EFICAZ` copia todos os colaboradores | 🤖 |
| 11 | **B3** — autor certo na auditoria da ação automática | 🤖 |
| 12 | **B13** — filho nasce com o aprovador da NC (RN-46) | 🤖 |
| 13 | **B12** — cancelar recusa rascunho (RN-06) | 🤖 |
| 14 | **B8** — remover `DELETE /verificacoes/:id` | 🤖 |
| 15 | **B15** — primeira publicação do ano sob concorrência: criar ou incrementar o contador num único comando atômico. O teste já existe (`sequencia.test.ts`, com `it.fails`): o conserto é trocar para `it` | 🤖 |
| 16 | **B16** — colaborador inexistente responde 404, não 500 | 🤖 |
| 17 | **B17** — atribuições só em `RASCUNHO`/`ABERTO`; em `EM_APROVACAO`, só o `GERENTE` troca o aprovador (RN-47) | 🤖 |
| 18 | **RN-48** — retirar da aprovação (`POST /<tipo>/:id/retirar`): transição nova no `ciclo-vida.service.ts`, auditada. Não é bug: regra nova (PRD Q16) | 🤖 |
| 19 | **B18** — motivo em branco (reabrir, cancelar) recusado com 400 no schema; mensagens corrigidas. Testes prontos com `it.fails` | 🤖 |

**Aprendizado:** TDD (escrever o teste antes do conserto); por que uma
regra deve morar num lugar só.

### A4 — Sessão nova · M

**Objetivo:** revogação imediata e cookie seguro (TRD §4, ADR-35). É o
**B7**.

| Entrega | Quem |
|---|---|
| **Antes do B19: simplificar o `ciclo-vida.service.ts`** (revisão de código de 2026-10-02), para o conserto do B19 cair num lugar só. Primeiro, os **testes de caracterização** (auditoria de cada transição e 404 das transições, em `ciclo-vida.service.test.ts`; o texto foi aprovado na conversa). Depois, um commit `refactor:` por item, com a suíte completa a cada um: (1) `aplicarTransicao`, o "atualizar + auditar" que hoje está copiado em 7 transições; (2) `buscarRegistroOuFalhar`, com a mensagem única "Item não encontrado." (muda o texto; a asserção entra antes, vermelha); (3) o validador no formato do `cancelar` (`() => void`), sem o parâmetro `dados: unknown`; (4) `estadoAposDecisao`, uma função pura, com `{ fecharAoAprovar }` no lugar do booleano solto (o nome perdeu o "último portão" junto com o ramo) e sem o ramo de vários portões, que não roda desde que a Ação Corretiva voltou a ter um portão só | 🤖 os testes e os itens 1–3; o item 4 era de 🧑, e Matthew passou para 🤖 em 2026-10-05, acompanhando |
| **B19**: transições sem trava sob concorrência (`esquema-backend.md` §7). Um teste de concorrência que falha por transição, depois o `UPDATE` condicionado ao estado esperado. Inclui o convite usado duas vezes no `definir-senha` | 🤖 o padrão do teste já é conhecido (A2) |
| **Depois do B19:** simplificar o `finalizarExecucaoAcaoCorretiva` (100 linhas; extrair um `gerarVerificacao`) e corrigir os comentários de `acao-corretiva.service.ts:141-165` (sem acento; o do `decidir`, que estava em cima do `retirar`, já foi para o lugar no item 4 acima) | 🤖 |
| Migration **M1**: `desativadoEm`, `sessaoValidaDesde`, `telaInicial` | 🧑 |
| Login com cookie `HttpOnly`/`Secure`/`SameSite=Strict`; "manter conectado" (30 dias) ou cookie de sessão (teto 12 h) | 🧑 |
| Middleware `autenticar`: busca usuário ativo, papéis atuais e `sessaoValidaDesde` a cada requisição | 🧑 |
| `POST /auth/logout`, `POST /auth/sair-de-todos`, `GET /auth/eu`, `PATCH /auth/eu` | 🤖 |
| Limite de tentativas no login; sucesso na auditoria, falha no log (E1); usuário inativo recusado com a mesma mensagem (RN-38) | 🤖 |
| Login com o **mesmo tempo de resposta** para e-mail inexistente (comparar com um hash falso) — auditoria L1 | 🤖 |
| `@fastify/helmet` (cabeçalhos de segurança) — auditoria R3. **Sem** `@fastify/cors`: front e back na mesma origem (TRD §2.1), e sem o plugin o navegador já recusa outras origens. O HTTPS fica na D1 | 🤖 |
| Testes: papel revogado vale na hora; usuário inativo recebe 401; "sair de todos" derruba sessão antiga; cookie de sessão sem validade | 🧑 |
| **Instalar as cinco ferramentas do `CONSTRAINTS.md`** (gitleaks, Semgrep, osv-scanner, as regras de arquitetura e `@vitest/coverage-v8`; a arquitetura ficou no Biome, porque o dependency-cruiser não lê o TypeScript 7) antes do fim da fase: o "só avisa" de SAST, dependências e cobertura vira bloqueio no fim da A4 | 🧑 (configuração) |
| **B21** e depois **B20** (`esquema-backend.md` §7, revisão de segurança de 2026-10-05): erro 4xx do Fastify sai com o status dele; depois, corpo só em JSON (`text/plain` → 415). Um teste que falha por bug | 🧑 passo a passo |

**Aprendizado:** cookie × token no cabeçalho; o que `HttpOnly`,
`Secure` e `SameSite` protegem; por que papéis no token atrasam a
revogação.

### A5 — Contrato da API · M (muito repetitivo)

**Objetivo:** a API se descreve sozinha, e o frontend vai poder gerar o
cliente (TRD §7, ADR-37).

| Entrega | Quem |
|---|---|
| Prefixo `/api` em todas as rotas, e o `Path` do cookie `qh_sessao` de `/` para `/api` (TRD §4.1; na A4 ficou `/` porque as rotas ainda não tinham o prefixo) | 🤖 |
| **B23** (rotas aceitam o `id` de um item de outro tipo): o ciclo de vida confere o tipo e responde 404; começa por teste. **Antes** do schema de resposta da Contenção, que transformaria o `GET` com tipo errado em 500. **Feito** (2026-10-07) | 🧑 o ciclo de vida e o primeiro tipo (passo a passo); 🤖 a repetição nos outros |
| **B24** (editar não muda o `atualizadoEm`): a edição toca o `Registro` na mesma transação; começa por teste. Depois do B23. **Feito** (2026-10-07) | 🤖 |
| **B25** (o `finalizar-execucao` aceita o `id` de outro tipo): busca com tipo, como o B23. Achado pela trava do lote 5 (2026-10-08), que é o teste que falha primeiro. **Feito** (2026-10-08) | 🤖 |
| **B26** (e-mail sem teto: um anônimo enchia a memória pela chave do limite de tentativas): `.max(254)` e a trava dos tetos apertada, que é o teste que falha primeiro. Achado na revisão de segurança da fase. **Feito** (2026-10-08) | 🤖 |
| **Schema de resposta** em todas as rotas, com o contrato D1–D5 (changelog) e o **B22** (dia de calendário sai em `"AAAA-MM-DD"`, por um codec; começa por teste) | 🧑 as de NC (o padrão); 🤖 as demais |
| `@fastify/swagger`: OpenAPI em `/api/docs/json`; interface em `/api/docs` só em desenvolvimento. O `Content-Security-Policy` do `helmet` (A4) pode bloquear os scripts da interface: se bloquear, afrouxar só nessa rota. **Feito** (2026-10-07): OpenAPI 3.1, JSON também só em desenvolvimento, e o CSP não bloqueou (conferido no navegador) | 🤖 com explicação |
| Catálogo de ações de auditoria tipado (pendência 1). A edição grava `SALVAR_RASCUNHO` mesmo com o item `ABERTO`: o nome engana quem lê a trilha. **Feito** (2026-10-07): `AcaoAuditada`, com `EDITAR` e `REMOVER_COLABORADORES` | 🤖 |
| `GET /saude` no lugar de `GET /`. **Feito** (2026-10-07): `GET /api/saude`, sem testar o banco (fica para a D1) | 🤖 |
| Último motivo de reprovação no detalhe de todo item (L7). **Feito** (2026-10-07): `ultimoMotivoReprovacao` no detalhe dos cinco tipos com portão | 🤖 |
| ~~Erros do próprio Fastify (JSON malformado, corpo grande demais) respondem com o status deles (400, 413), não 500 — auditoria L3~~ **Feito na A4, como B21** (2026-10-06); o teste do 413 entra com os tetos de entrada (L4), abaixo | — |
| Permissão conferida **antes** de buscar o usuário-alvo no `definirAprovador` (quem não pode agir não aprende nada com a resposta) — auditoria L5. **Feito** (2026-10-07): permissão, item, estado e só então o usuário escolhido | 🤖 |
| **Avaliar** as funções repetidas nos seis services de entidade (`retirarX`, `decidirX`, `cancelarX`, `buscarPorIdX`, `listarX`; revisão de código de 2026-10-02). Mudar o padrão de módulo é decisão de arquitetura: registrar no `changelog-arquitetura.md` antes de mexer. **Feito** (2026-10-08): ficam como estão, com a trava do B23 sobre o OpenAPI (changelog, "Fase A5") | 🧑 decide; 🤖 propõe |
| Tetos de entrada (auditoria L4): `.max()` nos textos, paginação nas listas dos filhos, avaliar `z.strictObject` (recusar campo extra com 400 em vez de descartar), e o teste do 413 (corpo acima de 1 MB). **Feito** (2026-10-07): tetos `TEXTO_CURTO`/`TEXTO_LONGO`, senha até 72 bytes, corpo estrito, as cinco listas dos filhos paginadas, o 413 testado | 🤖 |

**Aprendizado:** o que é OpenAPI e por que o schema de **resposta**
importa tanto quanto o de entrada.

### A6 — Usuários, setores e pessoas · M

**Objetivo:** administrar o sistema sem mexer no banco à mão (RF-15,
RF-20).

| Entrega | Quem |
|---|---|
| Migration **M2** (`Setor.desativadoEm`). **Feito** (2026-10-08): migration `setor_desativacao`, só a coluna; quem a usa são as rotas de setores | 🤖 |
| **Trava da RN-43**: não inativar/revogar `APROVADOR` de quem é aprovador de item aberto (`RASCUNHO`, `ABERTO`, `EM_APROVACAO`), devolvendo a lista; e não inativar/revogar o `ADMIN` do último `ADMIN` ativo (`interview-me`, 2026-10-08; PRD RN-43). **Feito** (2026-10-08): no revogar e no inativar, pelo `conferirSaida` | 🧑 |
| Rotas de usuários, setores e `GET /pessoas` (`esquema-backend.md` §6.2), incluindo reativar (E2); convite novo invalida os anteriores; definir senha recusa usuário inativo e **derruba as sessões** (soma 1 à `versaoSessao`, B27) (redefinir a senha derruba as sessões antigas, TRD §4.1; na A4 a senha só era definida no primeiro acesso, sem sessão a derrubar). Em 7 fatias (F1–F7, abaixo da tabela). **F1 feita** (2026-10-08): `GET /usuarios` (busca, situação, paginado) e `GET /usuarios/:id`. **F2 feita** (2026-10-08): `PATCH /usuarios/:id` (nome e setor; vale para o inativo). **F3 feita** (2026-10-08): conceder e revogar papel, com a trava da RN-43 e a do último `ADMIN` (as travas, de Matthew). **F4 feita** (2026-10-08): inativar e reativar, com as travas extraídas para o `conferirSaida` (Matthew). **F5 feita** (2026-10-08, em três fatias: o B27, o convite que revoga os anteriores e o definir senha endurecido; desenho no changelog). **F6 feita** (2026-10-08, em duas fatias: listar, criar e renomear; desativar e reativar, com a RN-44 detalhada). **As rotas da A6 estão completas.** **F7 feita** (2026-10-08, antes da F4–F6): `GET /pessoas` | 🤖 seguindo o padrão; 🧑 revisa |
| **Script do primeiro acesso** (`npm run criar-admin`): cria o primeiro setor e o primeiro `ADMIN` e mostra o link de convite. Sem ele, produção não tem como começar — criar usuário exige já ser `ADMIN`, e todo usuário exige um setor. **Feito** (2026-10-09, escrito por Matthew): o miolo `garantirAdmin` (garante que o e-mail seja um `ADMIN` ativo, com convite novo; serve também de recuperação; trava a linha da pessoa antes de ler) e a casca `criarAdminPeloTerminal` (perguntas, Zod, confirmação, link), com o ponto de entrada `src/criar-admin.ts` fora da cobertura (exceção X5); desenho no changelog | 🧑 |
| Testes das travas e das permissões de `ADMIN`. **Feito** (2026-10-09, escrito por Matthew): os limites da RN-43, onde a trava **não** age (revogar o `APROVADOR` de quem é aprovador só de itens `FECHADO`, ou só colaborador de item aberto; revogar o `EDITOR` de quem é aprovador de item aberto), cada um com prova de quebra. As permissões de `ADMIN` já estavam cobertas pelas tabelas de permissões da A2 (`permissoes.*.test.ts`: o `admin` recusado nas ações de negócio das seis entidades) e pelo `GET /pessoas`: sem teste novo | 🧑 |
| **B27** (login em voo sobrevive à derrubada das sessões): o JWT leva a versão da sessão (`sv`), e o `autenticar` exige igualdade. Junto da F5, que promete "redefinir a senha derruba as sessões"; começa por teste. **Feito** (2026-10-08, F5a): a `versaoSessao` no lugar da data | 🤖 |
| **B28** (pessoa inativa designada aprovadora ou colaboradora; contornava a trava da RN-43), achado na revisão da fase (`/abrir-pr`, 2026-10-09). **Feito** (2026-10-09, na sessão na nuvem): as rotas de atribuição recusam a pessoa inativa com 409, e a cópia dos colaboradores do B6 a pula | 🤖 |
| Setor inexistente no `POST`/`PATCH` da NC responde 404, não 500 (auditoria L6 — confirmar antes com teste, como o B16). Junto: o `setorId` do `ncBaseSchema` sai do `z.coerce.number()` para `z.number()`, como no criar usuário (o coerce aceita `true`, `"1"` e `[1]` como setor 1; revisão da A5). **Feito** (2026-10-08): o `conferirSetor` (`modulos/setor/conferir-setor.ts`) responde 404 no `POST`/`PATCH` da NC e também no `POST /usuarios`, que tinha o mesmo 500; as rotas novas que recebem setor o usam. NC num setor **desativado** (RN-44): decidir na fatia de setores | 🤖 |

**Ordem** (combinada no começo da fase, 2026-10-08): M2 → L6 → as rotas, em fatias, com a trava da RN-43
entrando na fatia de revogar papel e inativar (ela precisa dessas rotas) → o script do primeiro acesso → os testes
de `ADMIN`. As travas da A5 valem para as rotas novas: o `GET /setores` pagina ou entra como exceção, e a trava
do `{id}` precisa lidar com o `id` numérico do setor.

**Fatias das rotas:** F1 leitura de usuários · F2 editar usuário · F3 papéis, com a trava da RN-43
(`interview-me` antes) · F4 inativar e reativar · F5 convite e senha (`doubt-driven-development` e
`security-and-hardening` antes) · F6 setores · F7 pessoas.

### A7 — Travas entre linhas · P

**Objetivo:** as regras que conferem **outras linhas** (os filhos da NC, as ações da investigação, os outros
`ADMIN`s, as pessoas do setor, os colaboradores) continuarem valendo com duas requisições ao mesmo tempo; e o
filho novo só com a NC aberta (RN-51). Nasceu da revisão de concorrência da A6 (2026-10-09), que confirmou cada
caso com teste.

**O mecanismo, um só:** **travar antes de ler** (o mesmo do `garantirAdmin` e, por outro caminho, do B19). Antes de
conferir uma regra que depende de outra linha, a transação trava essa linha; a requisição concorrente espera e,
quando segue, lê o estado novo. Os dois lados da corrida travam a **mesma** linha (o pai, o item, a pessoa, o setor);
o último `ADMIN`, em que cada lado mexe numa pessoa diferente, usa uma trava única (*advisory lock*).

| Entrega | Quem |
|---|---|
| **B29** (filho novo só com a NC aberta, RN-51) e a trava da NC no `submeter` **Feito** (2026-10-09) | 🤖 |
| **B30** e **B31** (a trava da investigação: enviar, cancelar, criar e religar ação) **Feito** (2026-10-09) | 🤖 |
| **B32** (último `ADMIN`) e **B33** (revogar ou inativar × designar) **Feito** (2026-10-09) | 🤖 |
| **B34** (RN-12) e **B36** (a troca de aprovador que respondia 500): a trava do item nas atribuições **Feito** (2026-10-09) | 🤖 |
| **B35** (desativar o setor × escolher o setor) **Feito** (2026-10-09) | 🤖 |
| **B37** (o OpenAPI com `$ref` sem destino no `conteudo` da investigação), achado ao conferir o portão. **Feito** (2026-10-09): o `conteudo` como objeto de chaves livres e a trava de `$ref` no `app.test.ts`; o OpenAPI passa no Redocly sem erro | 🤖 |

**Quem escreve:** combinado em 2026-10-09, na sessão na nuvem (Matthew pelo iPad, sem como digitar código): Claude
escreve, Matthew revisa os diffs. Cada bug começa por um teste que falha. Os de corrida usam o `pausarNoMeio`
(`testes/cenarios.ts`), que pausa a transação entre conferir e gravar e dispara a outra requisição nesse intervalo:
com o `Promise.all`, a corrida acontecia em uma rodada a cada quatro, e o teste passaria sem provar nada.

### ✅ Portão: fundação pronta

Antes do Bloco C começar:
- A0–A7 concluídas, CI verde na `main`.
- Nenhum bug aberto no `esquema-backend.md` §7.
- OpenAPI completo, gerando sem erro.
- O "pronto quando" adiado da A4, da A6 e da A7 (Matthew explicar a fase), no **passeio guiado**,
  em três sessões curtas durante o Bloco B: A4 (o B19 e o `SameSite=Strict`), A6 (a RN-43 e o
  convite) e A7 (a trava entre linhas, um teste do `pausarNoMeio` linha a linha). **Condição para o
  C0** (decisão de Matthew, 2026-10-13).

---

## 4. Bloco B — Design (em paralelo ao Bloco A)

Não depende de código. Detalhes em `docs/ui-ux.md` §2.

| Fase | Entrega | Quem | Depende de |
|---|---|---|---|
| **B1 · Identidade visual** | Identidade **própria da plataforma Andon** (decisão de 2026-10-13: a da empresa não combina com o app; o nome é de 2026-10-15, antes Dusk & Dawn, e **provisório** desde 2026-10-20: o nome e o símbolo viram uma pendência só, sem prazo), que vai ganhar módulos além das NCs (as faces Dawn e Dusk do começo ficaram suspensas em 2026-10-14, `docs/marca.md`), e a autoria de Matthew numa tela "Sobre" (`ui-ux.md` §1): direção, paleta (o **Grafite**, sem cor de destaque desde 2026-10-20; a cor só nos estados, com o contraste conferido), fonte, o **logotipo provisório** ("andon" em Figtree 600 e o favicon "a"; o símbolo saiu da B1 em 2026-10-20 e virou pendência à parte, sem prazo: quando sair, troca um SVG num componente só), e a assinatura da empresa (o logo dela monocromático no login, no menu, no e-mail de convite e nos relatórios; `ui-ux.md` §1). Sem limite de sessões (Matthew, 2026-10-14: antes uma marca forte que uma rápida) | 🧑 Matthew decide, 🤖 Claude conduz e gera as opções | — |
| **B2 · Wireframes (G1)** | Frames cinzas no Figma a partir de `ui-ux.md` §7, uma tela por frame | 🤖 cria no Figma de Matthew; 🧑 ajusta | — |
| **B3 · Fundações + mockups (G2, G4)** | Pelo método do `ui-ux.md` §2.2 (decidido em 2026-10-23): os tokens em **duas camadas** (primitivos e semânticos; de componente só por exceção), a **base comum** (os tokens e os 5 átomos: botão, campo, estado/etapa/prazo, ícone, avatar) e depois **as telas puxam o resto**, uma por vez, na ordem das fatias C (T-01 → T-05, T-06, T-04 → T-07 → T-03 → T-09 a T-12 → T-08), com as cinco regras de governança. Componentes com variantes = enums, nas páginas Átomos, Moléculas e Organismos; telas com cor e os estados vazio/carregando/erro/sem permissão. Decisão de desenho no meio do caminho: a skill `/desenhar`. Termina num **`DESIGN.md`** na raiz (o formato aberto do Google: os tokens com valores exatos e o porquê de cada um), que os agentes seguem na fase C em vez de inventar cor; o `impeccable` gera um a partir do que ficou pronto (2026-10-13); com o histórico das mudanças e a tabela componente do Figma → arquivo React (no lugar do Code Connect, se ele não funcionar pelo conector) | 🧑 (é onde mais se aprende Figma); 🤖 revisa | B1, B2 |
| **B4 · Protótipo + teste (G3)** | Protótipo HTML clicável; **3 colegas** completam sem ajuda: registrar NC com rascunho, aprovar item, comentar com menção | 🤖 o protótipo; 🧑 conduz o teste | B3 |

### B2 — a ordem dos itens

Proposta em 2026-10-20 e aprovada por Matthew. Os itens 1 e 2 não usam o Figma; do 3 em diante, o conector
(no plano Starter, ele parou depois de ~15 chamadas, e o item 3 mede o limite do plano novo). São cerca de 26
frames: 12 telas, a T-07 com 5 variantes e o celular de T-01 a T-07, menos a Investigação.

| # | Entrega | Quem |
|---|---|---|
| 1 | O registro da B1 concluída e o PR da B2 em rascunho **Feito** (2026-10-21) | 🤖 |
| 2 | Os wireframes em texto que faltam no `ui-ux.md` §7: Login, Definir senha, Classificação, Contenção, Verificação, Relatórios e as 4 de administração **Feito** (2026-10-21): §7.7 a §7.16, com as recusas da RN-43 e da RN-44 e o diálogo da Verificação; a Classificação com a nota da Q21/Q22 para a C2 | 🤖 escreve; 🧑 revisa |
| 3 | A página "Wireframes" no Figma e a casca (menu, barra inferior, logotipo provisório) **Feito** (2026-10-21): as cascas do computador (1440) e do celular (390) e quatro componentes (`Casca/Menu lateral`, `Casca/Menu da pessoa (aberto)`, `Casca/Barra superior (celular)`, `Casca/Barra inferior (celular)`), em cinza e Figtree, com as notas ao lado. Organizada em duas Sections (Casca e Componentes da casca). O limite do plano de estudante: 8 chamadas sem bloqueio (no Starter, parou em ~15); a medida segue no lote A | 🤖 |
| 4 | Lote A: Nova NC (celular) e Detalhe da NC **Feito** (2026-10-21, junto dos lotes B a D) | 🤖 cria; 🧑 ajusta |
| 5 | Lote B: Pendências e Lista **Feito** (2026-10-21). A pausa saiu: Matthew pediu todas as telas de uma vez e o refinamento item por item depois | 🤖 cria; 🧑 ajusta |
| 6 | Lote C: as 5 variantes da T-07 **Feito** (2026-10-21), com o balão do botão bloqueado (Contenção) e o diálogo do efeito (Verificação) | 🤖 cria; 🧑 ajusta |
| 7 | Lote D: Login, Definir senha, Relatórios e administração **Feito** (2026-10-21), com as recusas da RN-43 e da RN-44 e o convite gerado | 🤖 cria; 🧑 ajusta |
| 7a | **Novo (2026-10-22, decisão (a) da revisão):** a navegação do celular revista (a barra flutuante e a tela Eu, T-13, **feitas** na seção "Decisão (a)" do Figma) e as **versões de celular** de Relatórios e administração (T-08 a T-12, com o convite gerado da T-11), que o `fluxo-app.md` §1 passou a pedir, e a do diálogo do efeito da Verificação (pedido de Matthew, 2026-10-22: toda tela nas duas versões, menos as que são de um só, a Investigação no computador e a tela Eu no celular). Depois, aplicar a barra nova nas telas raiz do celular que já existem: o **T-03 feito** (2026-10-22, com a tela Eu na mesma seção); falta o T-04. As versões de celular de T-08 a T-12 (com o convite) e do diálogo do efeito **feitas** (2026-10-22), cada tela ao lado da sua versão de computador | 🤖 cria; 🧑 ajusta |
| 7b | **Novo (2026-10-22, decisão (b) da revisão):** o Detalhe da NC no celular em quatro abas, com o bloco do título (`ui-ux.md` §7.3; os frames **feitos** na seção "Decisão (b)" do Figma). O T-06 celular da seção "NCs · T-05 e T-06" **trocado** pelas quatro abas (2026-10-22). Falta conferir se a T-07 no celular segue o mesmo padrão. Para a B3: o token `fundo/destaque` | 🤖 cria; 🧑 ajusta |
| 7c | **Novo (2026-10-22, decisão (c) da revisão):** a Investigação de quem preenche (aberta), ao lado da do aprovador, **feita**; o aprovador sem "+ Nova ação corretiva" (RN-49). O arquivo passou a guardar as decisões na página "Decisões (histórico)", e a página Wireframes só as telas decididas | 🤖 cria; 🧑 ajusta |
| 7d | **Novo (2026-10-22, decisão (e) da revisão):** a navegação do computador vira uma **doca flutuante embaixo, no centro** (componente `Shell/Doca`, 5 variantes pelo item ativo), com o Buscar (Ctrl K) e a pessoa no fim, e 96 px livres embaixo do conteúdo; **aplicada** nas 16 telas de computador; o menu antigo e o trilho (a opção recomendada pelo Claude, não escolhida) foram para o histórico | 🤖 cria; 🧑 decide |
| ~~8~~ | ~~Conferir o G1 (`ui-ux.md` §2) e o `/abrir-pr`~~ **Substituído em 2026-10-23** pelos itens 8 a 14 abaixo: com o método do Design System (`ui-ux.md` §2.2), a B3 refaz cada tela com os componentes, então a revisão dos wireframes fica **só na estrutura** (toda tela existe, toda ação é alcançável) e se junta ao G1, numa passada só | — |

**Os itens 8 a 14 (replanejados em 2026-10-23, com a skill `planning-and-task-breakdown`).** Cada um termina num commit. A verificação de uma tarefa de desenho: o ok de Matthew no frame, o checklist (`docs/identidade/revisao-wireframes.md`) e os documentos em dia. O acabamento visual (os achados 4 a 6 da seção 1 do checklist) vai para a B3. Peça nova: uma **tabela do G1** no §6 do checklist, uma linha por ação do `fluxo-app.md` §7, com o link do frame onde ela aparece; cada seção preenche a dela. **Os gestos da casa** (`ui-ux.md` §6.2, decididos em 2026-10-23): cada seção confere também os gestos 1 a 4 em cada tela (o bloco do título com hierarquia, a frase de estado, o número protagonista e o formulário com ritmo); o gesto 5, movimento e voz, é da B3.

| # | Entrega | Aceite | Quem |
|---|---|---|---|
| 8 | Os 3 achados de estrutura da seção 1: a barra de baixo do celular (a pílula Pendências · NCs · Eu, com o ＋ ao lado), a barra de cima sem o avatar e o menu da pessoa abrindo para cima, com a assinatura **Feito** (2026-10-23): a barra virou o conjunto `Shell/Barra inferior` (Ativo = Pendências, NCs, Eu; a do Eu é a mesma barra sem o ＋), com as abas dividindo a largura por igual (o "Pendências" estava apertado, achado de Matthew) e o **selo do contador** nas Pendências, o mesmo da doca (pedido de Matthew; refinado pelas referências do Mobbin, BlaBlaCar e TikTok: um círculo de 16 px com folga para o número, sobre o canto do ícone e longe da curva da pílula, e o da doca no mesmo tamanho); a T-03, a T-13 e a **T-04** passaram a usar o componente (o pendente do 7a, adiantado); o componente antigo foi para o histórico da decisão (a), marcado "não usar" | Os 3 componentes batem com as decisões (a) e (e), e as telas que os usam também | 🤖; 🧑 confere |
| 9 | Seção 2, Acesso (T-01 e T-02, nos dois tamanhos), e a tabela do G1 criada **Feito** (2026-10-23): as tabelas do G1 no checklist (§6.1, as telas; §6.2, as ações); o componente novo `Campo/Senha` (o botão de mostrar a senha e a regra da senha como ajuda fixa, não só no placeholder) | O ok de Matthew em cada frame; as linhas dessas telas na tabela | 🤖 e 🧑 |
| | **Conferência:** o jeito de revisar (estrutura e G1 juntos) funciona? | | 🧑 |
| 10 | Seção 3a: T-03, T-13 e T-04 (a barra nova da T-04 celular já entrou no item 8). **Feito** (2026-10-23): a decisão (f), pela `/desenhar`, ficou com a tabela plana e as pílulas (a A), o agrupar por etapa opcional no computador e a busca visível que some ao rolar (`ui-ux.md` §7.2); a T-03 celular ganhou o filtro por tipo, e a T-04 celular, a frase de estado e o Carregar mais. A ficha achou a lacuna L10: a lista não devolve total nem contagem (C1). **Com uma decisão pela `/desenhar`, a primeira:** os filtros da T-04 no celular, onde as abas (Todas · Minhas · Vencidas) e o "Filtros" viraram pílulas iguais e faltam os filtros do computador (Estado, Etapa, Setor, Mais filtros); achado de Matthew, 2026-10-23. A aparência das pílulas fica para a B3 | O mesmo, e os filtros decididos | 🤖 e 🧑 |
| 11 | Seção 3b: T-05 e T-06 (as quatro abas do celular) **Feito** (2026-10-23): a T-05 em grupos com a ajuda fixa (a propriedade Ajuda no `Campo/Texto` e no `Campo/Área`) e os responsáveis no celular; a T-06 com os 7 achados (o + Nova da Ação Corretiva contra a RN-49, os dados alinhados entre os tamanhos, o envio no computador, o + Anexar, o bloco escuro no computador) e a **decisão (g)**, pela `/desenhar`: as abas do Deel, o feed em linha do tempo com o Responder, os Itens da NC agrupados ou não, em lista ou cartões, com o medidor em segmentos, o painel Atividade que empurra a página e recolhe a lateral numa faixa, o checklist com ícones, as atribuições com tags e a classificação nos Dados (`ui-ux.md` §7.3). No caminho, o `Item/Estado` virou um conjunto com os ícones SVG (os símbolos não existem na Figtree; 173 pílulas trocadas) | O mesmo | 🤖 e 🧑 |
| | **Conferência:** as NCs fechadas | | 🧑 |
| 12 | Seção 4: a T-07 dos cinco tipos, com o padrão do celular. **Feito** (2026-10-26): duas decisões pela `/desenhar`, a **(h)** (os filhos no celular empilhados, como o Linear e o GitHub; o tipo como título do bloco e o estado embaixo; e, no caminho, o **feed só na NC**, PRD Q25) e a **(i)** (a **Investigação no celular**, uma etapa por tela, e a leitura corrida do aprovador; revê o princípio 4 do `fluxo-app.md`). Os cinco revistos nos dois tamanhos: a Classificação como fica depois da C2 (Q22: Concluir classificação, sem aprovador) e com o Sobre a NC; a Contenção com a data em atalhos, a disposição em cartões e o rascunho (o Publicar e o Excluir rascunho dos filhos); a Verificação com o Sobre a ação; a Ação Corretiva empilhada, com o plano em grade, o plano em edição, o diálogo do Finalizar e a faixa abaixo de 1440; a Investigação com a faixa de resumo. Regras novas: o Como verificar e a causa direta vinda da hipótese (PRD Q26, RN-24). Componentes novos: `Anexos/Área de arrastar`, o campo de data com atalhos e a linha de indicadores. Para a B3: a variante "data" do `Campo/Texto` (com o ícone do calendário) e a "preenchido"; o nome que quebra com duas etiquetas na lateral; as explicações da disposição, a conferir com a analista | O mesmo; Salvar, Publicar e Submeter de cada tipo na tabela | 🤖 e 🧑 |
| 13 | Seção 5: T-08 a T-12 e o convite; e a T-03 Minhas pendências de novo, nos dois tamanhos, para ficar mais convidativa (pedido de Matthew, 2026-10-26). **A T-03 feita** (2026-10-26): a decisão **(j)**, pela `/desenhar` (Asana, Deel e Notion), ficou com a **C2**, proposta de Matthew: a saudação, o cartão **O mais urgente** da A e o resumo da B virado **gavetinhas** (fechadas no celular, abertas no computador, com a linha "em dia"); no computador, o avatar, o Nova NC, o cartão rico e **Suas NCs**; o vazio em dois casos; os ícones do lucide nas telas da T-03. A versão do **colaborador** (só `EDITOR`: sem Aprovar nem Triagem) entrou ao lado, para provar que as gavetas mudam com os papéis. Para a C3: os responsáveis do cartão (esquema §4.4). **Falta:** T-08 a T-12 e o convite | O mesmo | 🤖 e 🧑 |
| 14 | **A busca** (pedido de Matthew, 2026-10-26): a janela do Buscar e do Ctrl K no computador, com a doca (hoje só existe no histórico da decisão (e), desenhada sobre o trilho descartado: itens, NCs e "Ir para", `ui-ux.md` §6.1) e **onde fica a busca no celular**, que não tem entrada de busca geral (só a da T-04); é decisão de desenho, pela `/desenhar`; a rota é o `GET /registros/busca` da C4. Junto, **a janela dos atalhos de teclado** (o **?**, pedido de Matthew, 2026-10-26: o conjunto curto do `ui-ux.md` §6.1) e o "Atalhos de teclado" no menu da pessoa. O menu "Mais" aberto (Cancelar, Retirar da aprovação, Reabrir, Excluir rascunho: ainda sem desenho), o `DialogoMotivo` (Reprovar, Cancelar, Reabrir) e os estados que faltam (o filho reprovado com o último motivo, L7; a Contenção fechada); ~~a página Wireframes reorganizada~~ (**feita** em 2026-10-26, no fim do item 12: os blocos Celular e Computador, cada um com as seções na ordem do fluxo); e o G1 fechado; o `/abrir-pr` | Nenhuma linha vazia na tabela do G1; o PR fora do rascunho | 🤖; 🧑 decide o merge |

### B3 — a ordem dos itens

Planejada em 2026-10-23 (`planning-and-task-breakdown`), pelo método do
`ui-ux.md` §2.2: a base comum primeiro, depois as telas na ordem das
fatias C. Começa pela `/comecar-fase`, numa branch nova. A verificação de
cada tarefa: o script de valor solto sem achados, o contraste conferido
nos dois modos, o ok de Matthew e os documentos em dia; cada uma termina
num commit. A partir do item 6, cada tela traz as moléculas e os
organismos que faltam e os estados do G4 (vazio, carregando, erro, sem
permissão), nos dois tamanhos e nos dois modos, com o gesto 5 da casa
(movimento e voz, `ui-ux.md` §6.2).

| # | Entrega | Aceite | Quem |
|---|---|---|---|
| 1 | Os primitivos: a coleção nova (a escala do Grafite e os tons dos estados) e os 18 semânticos da coleção Cor apontando para ela; e o semântico **`marca/toque` reservado** (`ui-ux.md` §2.2, item 1), começando no cinza | Nenhum semântico com valor direto; o contraste dos pares numa tabela, nos dois modos | 🤖 |
| 2 | O script de valor solto (lista toda cor e medida sem variável) e as páginas Átomos, Moléculas, Organismos e Mockups | Acha um retângulo solto plantado de propósito (a prova de quebra) e passa limpo na Fundações | 🤖 |
| 3 | Átomos I: o Botão de Matthew conferido contra o "pronto quando" (`ui-ux.md` §2.2, regra 4) e o Campo, com o erro e o foco (achado 6) | O script limpo; os estados e os dois modos | 🧑 |
| 4 | Átomos II: Estado/Etapa/Prazo (achado 5), Ícone (os SVG do Lucide) e Avatar (gerado pelo nome, `docs/marca.md`) | O mesmo; o badge cobre os 5 estados (G2); os **72 chevrons de texto** do arquivo (›, ⌄, ∨, as letras da Figtree fazendo papel de ícone, achado de Matthew em 2026-10-23) trocados pelo ícone; o ícone do olho do `Campo/Senha` reavaliado (Matthew, 2026-10-23: o do Lucide é o padrão do Android); o `Item/Estado` já virou um conjunto com os ícones SVG (2026-10-23, na B2): falta ligá-lo às cores dos estados | 🧑 |
| | **Conferência:** a base comum pronta | | 🧑 |
| 5 | T-01 e T-02 em mockup: a **prova do caminho** do token à tela, a tarefa mais arriscada (por isso cedo) | Nos dois tamanhos e nos dois modos, com os estados do G4; uma **retrospectiva** do método, que ajusta a §2.2 se for preciso | 🧑; 🤖 revisa |
| | **Conferência:** o método provado | | 🧑 |
| 6 | T-05 Nova NC, com a casca (a doca e a barra do celular; achado 4) | O mesmo, sem a retrospectiva | 🧑; 🤖 revisa |
| 7 | T-06 Detalhe da NC: o feed, a seção de filhos, o checklist e as atribuições | O mesmo | 🧑; 🤖 revisa |
| 8 | T-04 Lista de NCs | O mesmo | 🧑; 🤖 revisa |
| 9 | T-07 I: Classificação, Contenção e Verificação, com o diálogo do efeito | O mesmo | 🧑; 🤖 revisa |
| 10 | T-07 II: Ação Corretiva e as duas visões da Investigação | O mesmo | 🧑; 🤖 revisa |
| 11 | T-03 Minhas pendências e T-13 Eu | O mesmo | 🧑; 🤖 revisa |
| 12 | T-09 a T-12 e o convite gerado | O mesmo | 🧑; 🤖 revisa |
| 13 | T-08 Relatórios (com a skill `dataviz`) | O mesmo | 🧑; 🤖 revisa |
| 14 | O `DESIGN.md` (os tokens, o histórico e a tabela componente do Figma → arquivo React), o G2 e o G4 conferidos; o `/abrir-pr` | Os dois portões fechados | 🤖; 🧑 revisa |

**Riscos:** o método ainda não foi provado (a retrospectiva do item 5); o
limite do conector no plano de estudante (as mudanças no Figma de uma vez,
no fim de cada seção); o cansaço, porque os componentes são de Matthew (um
átomo por sessão; os itens 3 e 4 podem virar duas sessões cada); e a
`/desenhar` puxar escopo novo (o que a API não tem vira "escopo novo", com a
fase anotada, não trabalho agora).

**Em aberto:** a sessão do SaaS antes da C0 (linha da C0), que pode mudar o uso do `marca/toque`; onde o script de valor solto mora no repositório (proposta:
`docs/identidade/figma/`, versionado para os dois PCs); se a B4 começa
antes do fim da B3 (o teste com colegas só precisa das telas até o item
10); e a parada 2 do passeio da A7, condição para a C0, numa sessão
descansada antes dela.

O que o teste com colegas revelar volta para os documentos **antes** do
C0.

---

## 5. Bloco C — Frontend em fatias verticais

Cada fase entrega **backend + tela** da mesma funcionalidade, testados.
A primeira tela de cada tipo é escrita por Matthew; as seguintes que
repetem o padrão, geradas.

| Fase | Telas | Backend junto | Tamanho |
|---|---|---|---|
| **C0 · Base do front** | **Antes de começar, uma sessão de `idea-refine` sobre o SaaS** (2026-10-23, Matthew avalia oferecer o Andon a outras empresas): o *multi-tenant* (várias empresas no mesmo sistema, os dados de uma nunca visíveis para outra; mexe no banco, nas permissões e na hospedagem, TRD §10.6, hoje *on-premise*) e o branding de cada empresa, onde ela fala (a ideia de partida no `handoff.md` §5). Decidir antes da C0 porque a empresa como dado (logo, nome, prefixo dos códigos, glossário) já molda o front. **E decidir se os filhos ganham título** (hoje só a NC tem; B2, 2026-10-21, `ui-ux.md` §10.3): sem título, o rótulo é o código + o começo do texto principal; com título, ele entra na C2 como campo **opcional**, antes da produção (obrigatório mexeria em todos os testes que publicam filhos, e depois da produção os itens antigos ficariam sem ele). Nos dois casos, o rótulo dos filhos sai de **uma função só**. Projeto Vite + Tailwind + shadcn/ui + Router + TanStack Query; cliente gerado pelo **Orval** (antes, um `operationId` em cada rota: sem ele, o Orval inventa os nomes das funções a partir do caminho; o Redocly avisa nas 82 operações, revisão do portão de 2026-10-09); antes de tudo, um `refactor:` com o código morto da auditoria do Ponytail de 2026-10-13 (o `compartilhado/acoes/acoes.ts`, catálogo antigo sem uso, e os tipos `*Input` que ninguém importa nos `*.schema.ts`); as variáveis do CSS a partir do `DESIGN.md` e a prova do Code Connect (`ui-ux.md` §2.2, item 4); layout (a doca do computador e a barra flutuante do celular, `ui-ux.md` §6.1, com o logotipo provisório e a assinatura da empresa: decidir antes onde mora o arquivo do logo dela, fora do repositório público; `docs/marca.md`); login e definir senha (T-01, T-02); tela inicial por papel; estados de tela padrão (`fluxo-app.md` §8); mapa tipado de estados; a **lista de teste manual** (`docs/teste-manual.md`): a jornada crítica, **duas contas** (uma não vê o que é da outra), **celular de verdade**, os **bloqueios de lançamento** e o formato do relato de falha (esperado, acontecido, passos, aparelho), que cada fase C usa no "pronto quando" e a C8 e a D2 usam inteira (guia "Project Docs for Vibe Coding", 2026-10-13) | — (já pronto no A4/A5) | G |
| **C1 · NCs** | Lista (T-04), Nova NC (T-05), Detalhe da NC (T-06) com checklist | Etapa calculada (função pura, testada sem banco); filtros novos (com a busca por código ou título do T-04: hoje a listagem não busca texto, `nc.schema.ts`); **a classificação vigente e o resumo dos filhos no `GET /nc/:id`** (o que a decisão (g) da B2 mostra na T-06); **o total e as contagens da lista** (L10 do `fluxo-app.md`, achada na decisão (f) da B2: a frase de estado, o "Mostrando N de M" e a contagem por etapa) e o **agrupar por etapa**, opcional no computador (`ui-ux.md` §7.2); NC criada com colaboradores; `GET /registros/:id/atribuicoes`; **o que a T-06 pedir no `GET /nc/:id`** (etapa, resumo dos filhos, aprovador, colaboradores; decidir aqui entre uma chamada só ou várias), acrescentado ao `ncSchema` da A5 sem tirar nada (decisão D5 da A5) | G |
| **C2 · Itens filhos** | T-07 para os cinco tipos, barra de ações, `BotaoBloqueado`, `DialogoMotivo`, `DialogoEfeito`, Investigação A3 com índice e as **contramedidas** (ações vinculadas, com o selo do plano) | **Hipóteses** (L1), com o `comoVerificar` (M6 do `esquema-backend.md`, L13) e o envio da investigação exigindo o campo em toda hipótese e ao menos uma hipótese de causa direta (PRD Q26); a **Verificação nasce só com o colaborador** (a Q22: hoje ela recebe o aprovador da ação também como aprovador, `acao-corretiva.service.ts:82-83`); a **Investigação no celular**, uma etapa por tela, e a leitura corrida do aprovador (`ui-ux.md` §7.5); investigação com ações vinculadas; **rota de leitura da lista do envio** (a tela precisa dela antes do clique; hoje só a NC tem checklist): decidir entre uma rota por tipo ou uma genérica, `GET /<tipo>/:id/checklist-submissao` (TRD §5). Junto, o **aprovador entra na lista** dos seis tipos: a checagem genérica do `cicloVidaService.submeter` deixa de barrar antes da guarda (hoje, sem aprovador, o 409 vem sem a lista — esquema §4.3). Junto da Q22, a **Q23** (PRD): o colaborador (`EDITOR`) define o aprovador dos itens em que é colaborador — a regra de permissão do `definirAprovador` passa a combinar papel e atribuição (`podeExecutar`) | G |
| **C3 · Pendências** | Minhas pendências (T-03), contador no menu, preferência de tela inicial | `GET /pendencias` (esquema §4.4) | M |
| **C4 · Feed** | Feed **só na NC**, com os eventos de todos os filhos e o filtro por item (PRD Q25, decisão (h) da B2; o filho tem só o atalho), editor com `@`/`#` (Tiptap), pendência "mencionado"; **a resposta em fio** (o comentário com o pai) e o filtro Tudo · Comentários · Histórico do painel Atividade (L12 do `fluxo-app.md`, decisão (g) da B2). **Texto formatado guardado como o JSON do Tiptap, validado por schema no backend (só os nós permitidos), nunca como HTML** (XSS); o teto do campo é revisto junto (Matthew, 2026-10-07) | Migration **M4**; comentários (da NC), menções, `GET /nc/:id/feed?item=`, `POST /nc/:id/comentarios`, `GET /registros/busca` (a mesma rota atende a busca da doca, Ctrl K: código e texto, decisão (e) da B2) | G |
| **C5 · Anexos** | Anexos em todo item, câmera no celular | Migration **M3**; armazenamento (disco ou objetos, **conforme D0**); validação pelo conteúdo; limpeza de órfãos | M |
| **C6 · Administração** | Usuários, detalhe, novo, setores (T-09 a T-12). **Decidir junto com a tela do convite:** a validade do link de redefinir senha. Hoje é o mesmo convite do primeiro acesso, de 72 h; o checklist da `security-and-hardening` recomenda até 1 h para redefinição. Risco baixo (uso único, um novo revoga o anterior, derruba as sessões, 5 tentativas por minuto), mas um link vazado vale três dias. Opção: 72 h no primeiro acesso e ~24 h na redefinição (revisão de segurança de 2026-10-09) | — (já pronto no A6; a validade separada, se decidida, é no `emitirConvite`) | M |
| **C7 · Relatórios** | Relatórios (T-08), números levando à lista filtrada; o logo da empresa em **vetor** no cabeçalho do PDF (só há PNG: pedir à empresa ou vetorizar; `docs/marca.md`, "Arquitetura") | 4 rotas de relatório | M |
| **C8 · Revisão final (G5)** | Jornadas do teste com colegas feitas **só com teclado**; foco visível; rótulos; celular nas telas que precisam; **os atalhos de teclado** do conjunto curto (`ui-ux.md` §6.1: Ctrl K, ?, J/K, Enter, Esc, G+P/N; nada dentro de campo de texto; os de uma tecla desligáveis no menu da pessoa, guardado no navegador) | Ajustes | M |

**Testes no frontend:** Vitest nas peças com lógica (mapa de estados,
`BotaoBloqueado`, formatação de prazo). Os fluxos completos continuam
garantidos pelos testes de API do backend.

---

## 6. Bloco D — Produção e adoção

| Fase | Entrega | Quem |
|---|---|---|
| **D0 · Decidir hospedagem** | Escolha entre as opções de `trd.md` §10.6, depois de perguntar à empresa se os dados podem ficar fora e qual o orçamento. Atualiza o TRD e o ADR-30. **Junto:** para onde vai o log da aplicação e por quanto tempo fica guardado. As tentativas de login com falha (e o 429) só estão no log (esquema, E1); se a retenção for curta, ou se a analista disser que o auditor ISO pede essa evidência, elas passam a ir também para a auditoria quando há usuário identificado (senha errada, inativo), sem mudar o banco (decidido em 2026-10-05). **Também: LGPD** (revisão de segurança de 2026-10-09). Ninguém é apagado (só inativado), e a auditoria guarda nomes e e-mails para sempre: é evidência para a ISO, mas falta a decisão escrita de retenção e de base legal (cumprimento de obrigação, legítimo interesse) e o que responder a um pedido de exclusão. Com a analista e, se a empresa tiver, o jurídico ou o encarregado de dados | 🧑 decide e propõe; 🤖 ajuda a comparar |
| **D1 · Ambiente de produção** | Dockerfile do backend; Compose de produção (nginx, app, postgres, backup); HTTPS; backup diário **fora da máquina**; **primeiro teste de restauração**; monitor externo; manual de operação no `SETUP.md`; ambiente de homologação; o `GET /api/saude` passa a testar o banco (`SELECT 1`), para o Docker e o nginx saberem se o app está de pé de verdade; `trustProxy` no Fastify atrás do nginx (sem ele, o `request.ip` é o do nginx e o limite do login vira só por e-mail: qualquer um bloqueia o login de outro por 1 minuto) e o limite de tentativas, que fica em memória, conferido para um servidor só (revisão de segurança da A4, S2); o `dotenv` é dependência de desenvolvimento, mas o `prisma/cliente.ts` o importa em tempo de execução (uma instalação sem as de desenvolvimento quebraria na subida): trocar pelo `process.loadEnvFile()` do Node, só se o `.env` existir, e tirar o pacote (auditoria do Ponytail, 2026-10-13); **Fetch Metadata**: um hook que recusa `POST`/`PATCH`/`DELETE` com `Sec-Fetch-Site` diferente de `same-origin` (ou `none`), porque POST **sem** corpo não tem `content-type`, passa pela regra "só JSON" do B20 e só tem o `SameSite=Strict`, que não barra um subdomínio irmão (18 rotas, como `sair-de-todos` e o `publicar`/`submeter`/`retirar` dos seis tipos; revisão de segurança da A4, S5) | 🧑 com orientação passo a passo (é conhecimento que Matthew vai precisar para operar sozinho); 🤖 gera os arquivos de configuração |
| **D1a · Guias de uso** | Pedido de Matthew (2026-10-26): um guia curto **por jornada**, não um manual inteiro (registrar uma NC pelo celular, aprovar, preencher a Investigação A3, executar e verificar uma ação; para o ADMIN, convidar uma pessoa), com a captura de cada passo. **O formato fica para decidir aqui**, entre: uma página **Ajuda** dentro do Andon (no menu da pessoa e na tela Eu; muda junto com as telas), **PDF** (rápido de fazer, mas envelhece sem ninguém ver) e **vídeos curtos** de 1 minuto para quem usa só o celular. Sem tour de balões por cima da tela (quebra a cada mudança e quase todo mundo pula). Feito **depois das telas prontas** (fim da C) e **antes do piloto**, com a analista, que sabe onde as pessoas travam; serve também de evidência de competência e conscientização (ISO 9001, 7.2 e 7.3) | 🧑 + analista; 🤖 rascunha os textos |
| **D2 · Piloto** | NCs reais registradas no sistema **em paralelo** com a planilha, por um período combinado com a analista | 🧑 + analista |
| **D3 · Planilha aposentada** | Data de corte; NC **nova** só no sistema (métrica de sucesso 1 do PRD). **Nenhuma NC da planilha é migrada** (P1): as que estiverem abertas na data de corte terminam na planilha, que fica guardada como arquivo histórico | 🧑 + analista |

---

## 7. Decisões externas que o plano espera

| Decisão | Quem decide | Precisa estar pronta antes de |
|---|---|---|
| Hospedagem (dados fora da empresa? orçamento?) | Matthew, com a empresa | **C5** (anexos) e **D1** |
| ~~Identidade visual~~ — decidido: **própria da plataforma Andon** (nome de 2026-10-15; antes, Dusk & Dawn), com a assinatura da empresa (2026-10-13); vira a fase B1 | — | — |
| 3 colegas disponíveis para o teste | Matthew | **B4** |
| Período do piloto e data de corte | Matthew + analista | **D2**, **D3** |
| ~~NCs da planilha: migrar ou não~~ — decidido: **nenhuma** (P1) | — | — |

---

## 8. Rastreabilidade

Onde cada item dos documentos anteriores é feito:

| Item | Fase |
|---|---|
| B1–B6, B8–B18 · RN-06, RN-46, RN-47, RN-48 · RN-21 e RN-24 revistas, RN-49, RN-50 (PRD Q17, Q18) | A3 |
| Primeiro `ADMIN` e primeiro setor em produção | A6 (script), D1 (uso) |
| B7 (papéis no JWT) · B19 (transições sem trava) · B20 (corpo `text/plain`) · B21 (4xx do Fastify vira 500) · RNF-09, RNF-10 | A4 |
| Pendência 1 (ações de auditoria) · pendência 5 (`ignoreTrailingSlash`) | A5 · A0 |
| Pendência 4 (login auditado) | A4 |
| Pendência OpenAPI · RNF-04 (schema de resposta) · L7 (último motivo de reprovação) · B22 (dia de calendário na resposta) · B23 (`id` de outro tipo) · B24 (`atualizadoEm` na edição) · B25 (`finalizar-execucao` sem tipo) · B26 (e-mail sem teto) | A5 |
| B27 (login em voo sobrevive à derrubada das sessões) · B28 (pessoa inativa recebe atribuição) | A6 |
| B29–B36 (filho fora da NC aberta; as conferências entre linhas sem trava) · B37 (`$ref` sem destino no OpenAPI) · RN-51 | A7 |
| RF-15 (usuários) · RF-20 (setores) · RN-43 · RN-44 | A6 (backend), C6 (telas) |
| RF-01 (NC com colaboradores) · RF-16 (etapa) · L2, L5, L6 · R7 (código de erro para máquina) e R8 (`DELETE` com corpo), da revisão de design da A5 | C1 |
| L1 (hipóteses) · L3 (plano aprovado) | C2 · A3 |
| PRD Q19–Q22 (classificação vigente, exigências por classificação, abrangência, colaborador e aprovador excludentes) | C2 (proposta) |
| RF-17 (pendências) · L4 · L9 (tela inicial) | C3 · A4 |
| RF-11 (Feed) · M4 | C4 |
| RF-18 (anexos) · M3 · RN-45 · ADR-34 | C5 |
| RF-19 (relatórios) | C7 |
| RNF-05, RNF-13 (backup, HTTPS) · ADR-30 | D1 · D0 |
| Métricas de sucesso do PRD | D3 e depois |

---

## 9. Decisões tomadas

Com Matthew, em 2026-09-24.

| # | Pergunta | Decisão |
|---|---|---|
| — | Fundação antes do front? | **Só a fundação** (Bloco A); funcionalidades novas em fatias verticais com a tela (Bloco C) |
| — | Quem escreve | **Matthew o núcleo, Claude o repetitivo**, Claude revisa |
| — | Git | **Branch + Pull Request por fase**, CI obrigatório |
| — | Arquivos `.http` | **Aposentados** quando cobertos por teste |
| **P1** | As 54 NCs da planilha entram no sistema? | **Nenhuma.** O sistema começa do zero na data de corte; as NCs abertas nessa data terminam na planilha, que fica como arquivo histórico. Sem script de importação |

**Consequência da P1 para o piloto (D2):** como nada é migrado, o
período em paralelo serve também para as NCs antigas irem fechando na
planilha. Vale escolher a data de corte quando houver poucas abertas.

---

## Histórico

| Data | Mudança |
|---|---|
| 2026-09-24 | v1 — blocos A–D, decisões de trabalho e P1 |
| 2026-09-24 | v1.1 — revisão cruzada: B9–B13 na A3 (B9 primeiro), pré-requisito do Docker no WSL, `prisma generate` no CI, helper único de autenticação nos testes, script do primeiro ADMIN |
| 2026-10-01 | v1.2 — ordem 8 da A3 dividida em 8a–8f pela regra revista (PRD Q17, Q18); C2 com as contramedidas e a rota de leitura da lista do envio |
| 2026-10-02 | v1.3 — achados da auditoria de segurança alocados: B19, L1 e R3 na A4 (C1 e R2 já eram dela), L3, L4 e L5 na A5, L6 na A6. L2, L7 e L8 aplicados na branch `chore/analise-repositorio` |
| 2026-09-24 | **A0 concluída** (branch `fase/a0-preparacao`): código sem uso removido, aviso do Fastify corrigido, Biome configurado, código formatado e lint limpo. `test` e `build` adiados para A1 e D1; `gh` na A1 |
| 2026-09-28 | **A1 concluída** (branch `fase/a1-testes`, PR #2): Vitest + Testcontainers, fábricas e `loginComo` (7 perfis), testes do login, do `temPapel` e da criação de rascunho de NC (o "pronto quando", escrito por Matthew), CI com check obrigatório na `main`. Divisão de trabalho revista (§1) |
| 2026-09-28 | B14 entra na A3 (ordem 3, depois do B11), achado pelos testes da A2 |
| 2026-09-30 | B15 entra na A3 (ordem 15), achado pelo teste de concorrência da A2 |
| 2026-09-30 | B16, B17 e RN-48 entram na A3 (ordens 16–18), dos testes de atribuição da A2 |
| 2026-09-30 | B18 entra na A3 (ordem 19), dos testes que aposentaram os `.http` |
| 2026-09-30 | **A2 concluída** (branch `fase/a2-rede-protecao`, PR #3): fluxo completo, máquina de estados e permissões nos seis tipos, concorrência do código sequencial (escrito por Matthew), atribuições, e os `.http` aposentados. Achados B15–B18 e regras RN-47/RN-48, todos na A3. CI verde e merge na `main` |
| 2026-10-02 | **A3 concluída** (branch `fase/a3-correcoes`, PR #4): B1–B6 e B8–B18, regra revista dos planos de ação (RN-21 e RN-24 revistas, RN-49, RN-50, PRD Q17/Q18), checklist de fechamento, RN-46 a RN-48. 250 testes. O B7 fica na A4 |
| 2026-10-02 | v1.5 — coerência documental: o CORS sai da linha do R3 na A4 (TRD §2.1, mesma origem) |
| 2026-10-02 | v1.4 — análise do repositório (branch `chore/analise-repositorio`, PR #5): na A4, a simplificação do `ciclo-vida` antes do B19, a do `finalizarExecucao` depois dele e a instalação das ferramentas do `CONSTRAINTS.md`; na A5, avaliar a duplicação dos services de entidade |
| 2026-10-06 | v1.6 — B21 e B20 entram na A4 (nessa ordem), da revisão de segurança de 2026-10-05 |
| 2026-10-06 | v1.7 — D1: `trustProxy` e o limite de tentativas em memória (revisão de segurança da A4, S2) |
| 2026-10-06 | v1.8 — D1: *Fetch Metadata* para o POST sem corpo (revisão de segurança da A4, S5) |
| 2026-10-06 | **A4 concluída** (branch `fase/a4-sessao`, PR #6): sessão por cookie com papéis conferidos no banco a cada requisição (B7), trava de concorrência nas transições (B19), login endurecido, `helmet`, B20 e B21, e o contrato de qualidade bloqueando no CI (cobertura, arquitetura, gitleaks, Semgrep, osv-scanner). 304 testes. S2 e S5 ficam para a D1 |
| 2026-10-06 | v1.9 — A5: a L3 sai (feita na A4 como B21); o teste do 413 vai para a entrega da L4 |
| 2026-10-06 | v1.10 — C1: o que a T-06 pedir no `GET /nc/:id` entra lá, só acrescentando ao contrato da A5 (D5) |
| 2026-10-06 | v1.11 — B22 entra na A5, no item do schema de resposta |
| 2026-10-07 | v1.12 — B23 entra na A5, antes do schema de resposta da Contenção |
| 2026-10-07 | v1.13 — PRD Q19–Q21 (classificação e reincidência) na C2, como proposta; a confirmação da analista sobre a 3ª ocorrência, no §7 |
| 2026-10-07 | v1.14 — a analista respondeu (3ª ocorrência com justificativa): sai do §7; PRD Q22 entra na C2 |
| 2026-10-07 | v1.15 — B24 entra na A5, depois do B23 |
| 2026-10-07 | v1.16 — D1: o `GET /api/saude` testa o banco (na A5, ele só diz que o servidor está de pé) |
| 2026-10-07 | v1.17 — C1: R7 e R8, da revisão de design das APIs na A5; C4: texto formatado como JSON validado |
| 2026-10-08 | v1.18 — B25 entra na A5, achado pela trava do B23 no lote 5 |
| 2026-10-08 | v1.19 — A5, lote 5: as funções repetidas dos services ficam, com a trava do B23 |
| 2026-10-08 | v1.20 — B26 entra na A5 (revisão de segurança da fase); A6: o `setorId` sem coerce, junto da L6 |
| 2026-10-08 | **A5 concluída** (branch `fase/a5-contrato-api`, PR #8): prefixo `/api`, schema de resposta em todas as rotas (D1–D5), OpenAPI 3.1 só em desenvolvimento, `GET /api/saude`, catálogo de auditoria, L4, L5, L7, B22–B26 e cinco travas sobre o OpenAPI no `app.test.ts`; as funções repetidas dos services ficam (lote 5). 374 testes. R7 e R8 ficam para a C1 |
| 2026-10-08 | v1.21 — A6: a ordem das entregas (a trava da RN-43 junto das rotas de revogar e inativar) e as travas da A5 nas rotas novas |
| 2026-10-08 | v1.22 — A6: a RN-43 detalhada e o último `ADMIN`; C2: a Q23 (o colaborador escolhe o aprovador) |
| 2026-10-08 | v1.23 — B27 entra na A6, junto da F5 |
| 2026-10-08 | v1.24 — A6: a F6 em duas fatias (F6a ler, criar e renomear; F6b desativar e reativar, com a RN-44 detalhada) |
| 2026-10-09 | v1.25 — B28 entra na A6 (revisão da fase) |
| 2026-10-09 | v1.26 — fase A7 (travas entre linhas): B29–B36, da revisão de concorrência da A6; o portão passa a exigir A0–A7 |
| 2026-10-09 | **A6 concluída** (branch `fase/a6-usuarios-e-setores`, PR #9): usuários, setores e `GET /pessoas` (F1–F7), as travas da RN-43 e do último `ADMIN`, a RN-44 detalhada, o script do primeiro acesso, B27 e B28; a revisão de concorrência levou B29–B36 para a A7. 475 testes. O "pronto quando" de Matthew explicar a fase fica para o passeio guiado |
| 2026-10-09 | v1.27 — revisão de segurança do repositório inteiro (`security-and-hardening`), sem conserto a fazer: a validade do link de redefinir senha vai para a C6 e a LGPD (retenção, base legal, pedido de exclusão) para a D0 |
| 2026-10-09 | v1.28 — B37 na A7 (o OpenAPI conferido para o portão); C0: o `operationId` antes do Orval |
| 2026-10-09 | **A7 concluída** (branch `fase/a7-travas-entre-linhas`, PR #10): travar antes de ler nas regras que conferem outras linhas (B29–B36, com a RN-51), o OpenAPI conferido (B37) e a revisão de segurança do repositório; o `pausarNoMeio` para os testes de corrida. 489 testes. Do portão "fundação pronta" falta o passeio guiado (Matthew explicar a A4, a A6 e a A7), na branch `docs/fechamento-bloco-a` |
| 2026-10-13 | **Bloco A concluído** (branch `docs/fechamento-bloco-a`): o portão "fundação pronta" cumprido, com o passeio guiado (Matthew explicar a A4, a A6 e a A7) em três sessões curtas durante o Bloco B, como condição para o C0; as skills revistas no fim do bloco |
| 2026-10-13 | v1.29 — B1 deixa de ser decisão externa: a plataforma ganha nome e identidade próprios, **Dusk & Dawn**, com as faces Dawn (colaborador) e Dusk (gestão) e a assinatura da empresa (logo monocromático em quatro lugares); limite de 4 sessões. Branch `fase/b1-identidade-visual` |
| 2026-10-15 | v1.30 — B1: a marca recomeçou pela ideia (as 52 NCs à mão; "o processo sai da mão de uma pessoa e fica claro para todos"), com o território **Palpável**; o nome passa a ser **Andon**; o Dusk & Dawn (faces e luz da paleta) fica suspenso; cai o limite de 4 sessões (`docs/marca.md`) |
| 2026-10-20 | v1.31 — B1: o **símbolo sai da fase** (decisão de Matthew: travado no logo, quer avançar para o front) e vira pendência à parte, sem prazo; a B1 fecha com o logotipo provisório ("Andon" em Figtree). A cor de destaque deixa de esperar o símbolo: sai da Palpável, e o símbolo se adapta a ela |
| 2026-10-20 | v1.32 — B1: o nome **Andon** passa a ser **provisório** (Matthew ainda não quer fechar a marca); o nome e o símbolo viram uma pendência só, sem prazo. A B1 fecha com a fundação visual: o Grafite, a Figtree, a regra do logotipo e a assinatura da empresa |
| 2026-10-20 | **B1 concluída** (branch `fase/b1-identidade-visual`, PR #12): a fundação visual da plataforma, com o Grafite sem cor de destaque, a Figtree, o logotipo provisório e a assinatura da empresa; o nome Andon e o símbolo ficam como uma pendência só, sem prazo. Só documentação; 489 testes |
| 2026-10-21 | v1.33 — B2: a ordem em 8 itens (os dois primeiros sem o Figma), com uma pausa para Matthew ajustar depois do lote B; a linha da B1 em dia com o que ela fechou (sem as faces, o Grafite, o logotipo em minúsculas) |
| 2026-10-21 | v1.34 — C0: decidir antes se os filhos ganham título (hoje só a NC tem), e o rótulo dos filhos numa função só |
| 2026-10-21 | v1.35 — B2: os lotes A a D feitos de uma vez (pedido de Matthew), revistos pela skill `design-taste-frontend` (regras de tela de app); a pausa do lote B virou o refinamento item por item |
| 2026-10-22 | v1.36 — B2: os itens 7a (decisão (a), a navegação do celular) e 7b (decisão (b), o Detalhe da NC no celular em quatro abas), da revisão dos wireframes |
| 2026-10-22 | v1.37 — B2: o item 7c (decisão (c), a Investigação de quem preenche) e as telas decididas no lugar das antigas no Figma |
| 2026-10-22 | v1.38 — B2: o item 7d (decisão (e), a doca do computador); a busca por texto na C1 (lista) e na C4 (`GET /registros/busca`, também para o Ctrl K) |
| 2026-10-22 | v1.39 — B2: as cinco decisões da revisão fechadas, com a (d), a borda dos campos (a borda inteira em `borda/controle`); falta a revisão tela por tela e o item 8 |
| 2026-10-23 | v1.40 — B3 pelo método do `ui-ux.md` §2.2 (duas camadas de tokens, a base comum e as telas na ordem das fatias C, a governança); a skill `/desenhar`; na C0, o CSS a partir do `DESIGN.md`, a prova do Code Connect e o layout com a doca e a barra flutuante (o menu lateral tinha ficado no texto) |
| 2026-10-23 | v1.41 — B2 replanejada: o item 8 vira os itens 8 a 14 (a revisão só na estrutura, junto com o G1, e a tabela do G1); a ordem da B3 em 14 itens, com as conferências, os riscos e o que está em aberto (`planning-and-task-breakdown`) |
| 2026-10-23 | v1.42 — B2: o item 8 feito (a barra do celular como componente, com o contador; a T-04 com a barra nova); os filtros da T-04 no celular para a `/desenhar` no item 10; na B3, os 72 chevrons de texto no aceite do item 4 |
| 2026-10-23 | v1.43 — Antes da C0, uma sessão de `idea-refine` sobre o SaaS (o *multi-tenant* e o branding de cada empresa); na B3, o token `marca/toque` reservado (item 1) |
| 2026-10-23 | v1.44 — Os gestos da casa (`ui-ux.md` §6.2) na revisão da B2 (itens 9 a 13: os gestos 1 a 4) e na B3 (o gesto 5); o 7b conferido: a T-07 no celular não segue o padrão da NC |
| 2026-10-23 | v1.45 — B2: o item 9 feito (o Acesso revisto, as tabelas do G1, o `Campo/Senha`); na B3, o ícone do olho para reavaliar no item 4 |
| 2026-10-23 | v1.46 — B2: o item 10 feito (a decisão (f), a T-04; o filtro por tipo na T-03 celular); na C1, o total e as contagens da lista (L10) e o agrupar por etapa |
| 2026-10-23 | v1.47 — B2: o item 11 feito (a T-05 e a T-06, a decisão (g)); na C1, a classificação vigente e o resumo dos filhos no `GET /nc/:id`; na C4, a resposta em fio e o filtro do painel; na B3, o `Item/Estado` já em conjunto |
| 2026-10-26 | v1.48 — B2, item 12 em andamento: a decisão (h) (a T-07 no celular) e a Classificação revista; na C4, o feed só na NC (PRD Q25), com as rotas `GET /nc/:id/feed` e `POST /nc/:id/comentarios` |
| 2026-10-26 | v1.49 — B2: o item 12 feito (a T-07 dos cinco, as decisões (h) e (i)); o item 14 com o `DialogoMotivo`, os estados que faltam e a página Wireframes reorganizada; na C2, o `comoVerificar` das hipóteses, a regra da causa direta, a Verificação só com o colaborador (Q22) e a Investigação no celular |
| 2026-10-26 | v1.50 — B2, item 13: a T-03 Minhas pendências volta para a revisão, para ficar mais convidativa (pedido de Matthew) |
| 2026-10-26 | v1.51 — B2, item 13: a T-03 feita (decisão (j), a C2: o cartão do mais urgente e as gavetinhas, o colaborador ao lado); faltam T-08 a T-12 e o convite; no item 14, a busca (a janela do Ctrl K com a doca e a busca no celular) |
| 2026-10-26 | v1.52 — Os atalhos de teclado, um conjunto curto (pedido de Matthew): a janela do ? no item 14 da B2 e o código na C8 (que vai de P para M) |
| 2026-10-26 | v1.53 — D1a, os guias de uso (pedido de Matthew): um por jornada, depois da C e antes do piloto, com a analista; o formato (página Ajuda, PDF ou vídeo) decidido lá |
