# Handoff — estado da sessão

> Lido no **início de toda sessão** (regra no `CLAUDE.md`) e atualizado
> no **fim de toda sessão** ou quando Matthew disser "vou trocar de
> computador". Aqui fica só o que muda de sessão para sessão; o que é
> estável mora nos documentos apontados.

**Última atualização:** 2026-09-29.

## 1. Objetivo

Fase **A2 — rede de proteção** (`docs/plano-implementacao.md`, seção
A2): cobrir por teste tudo o que **já funciona**, antes de qualquer
correção de regra. Os bugs (B1–B14) ficam para a A3.

## 2. Estado atual

- **A1 concluída e mesclada** (PR #2).
- Branch **`fase/a2-rede-protecao`**, PR **#3 em rascunho**
  (https://github.com/fellipemnds/qualityhub/pull/3).
- **Três itens da A2 feitos** (88 testes verdes, suíte ~126 s):
  - **Fluxo completo** (sessão de 28/09): `src/modulos/nc/fluxo-completo.test.ts`,
    testes curtos ao lado das rotas e a escada de cenários em
    `src/testes/cenarios.ts`.
  - **Máquina de estados**: `src/compartilhado/registro/maquina-estados.<tipo>.test.ts`,
    um por tipo. Matthew escreveu a Contenção; Claude repetiu nos outros
    5. Cada tipo tem um `levarXAte(estado)` em `src/testes/levar-ate/`
    (sobe a escada pela API, conferindo o estado em cada degrau), um
    dicionário de ações, a tabela de proibidas por estado e um
    `it.each`. Espera **409**.
  - **Permissões**: `src/compartilhado/permissoes/permissoes.<tipo>.test.ts`,
    o espelho da máquina de estados — estado certo, pessoa errada,
    espera **403**. Cobre papel, atribuição, "tem o papel mas não é o
    aprovador designado", RN-20 e o gerente cancelando sem ser designado.
    `perfisDeFora()` (em `cenarios.ts`) cria admin, visualizador e sem
    papel.
  - **Casos de fora, comentados nas tabelas:** cancelar rascunho (B12),
    finalizar a ação corretiva sem plano aprovado (B1), `DELETE
    /verificacoes/:id` (B8), submeter NC em rascunho (a guarda RN-21 roda
    antes da de estado) e o `qa` publicando classificação (pendência do
    `podeExecutar`, abaixo).
  - **Prova de quebra** feita nas duas famílias: com uma ação permitida
    posta na tabela, todos os arquivos falharam.
- `testTimeout: 15_000` no `vitest.config.ts` (o padrão de 5 s estourava
  com a máquina ocupada — ver §5).
- O que Matthew aprendeu hoje: retorno antecipado (`levarAte` para no
  andar pedido); estado **pedido** (o `if`) × estado **atual** (o
  `expect`); `toMatchObject` confere só os campos listados; transição ×
  edição (o `submeter` age sobre o que o `PATCH` gravou); enum é lista
  fechada; `it.each` com `Object.values` do enum e com objetos (`$campo`
  no título); `Awaited<ReturnType<typeof f>>`; dicionário de funções e
  acesso com colchetes (`acoes[acao](contexto)`); `keyof typeof`;
  `for...of` com `await` (não `forEach`); `it.each` + `for` =
  repetição encadeada; os códigos 400/403/404/409; teste que nunca falhou
  pode não testar nada.

## 3. Arquivos no meio de uma mudança

Nenhum.

## 4. O que foi alterado nesta sessão

`git log a8cb004..fase/a2-rede-protecao`. As decisões da A2 entram no
`docs/changelog-arquitetura.md` quando a fase fechar — anotar lá: um
arquivo por tipo; `levarXAte` em `src/testes/levar-ate/`; o limite de
15 s.

**Push pendente:** `90bd21f`, `260d363`, `8f7a718` e o commit deste
handoff.

## 5. Falhas (e o porquê)

| O que falhou | Por quê | Situação |
|---|---|---|
| `npm audit`: 4 vulnerabilidades altas | Herdadas do Prisma 7 | **Aberto**, risco baixo — `docs/trd.md` §13. Nunca `npm audit fix --force` |
| Aviso "Update available 7.10.0 → 8.0.0-rc" do Prisma | É release candidate e versão major | **Não atualizar** |
| Aviso no CI: `ubuntu-latest` vira Ubuntu 26 em 19/10/2026 | Migração do GitHub | Nada a fazer; se o CI quebrar depois dessa data, começar por aqui |
| Guardas do plano e da execução não recusam `prazo`/`executadoEm` vazios | Bug B14 | Registrado; conserto na A3 |
| Falha intermitente na verificação FECHADO (6,4 s) | Limite padrão do Vitest (5 s) com a máquina ocupada; o teste leva ~2,7 s livre | **Resolvido** com `testTimeout: 15_000`. Reproduzido com `--testTimeout=2000` |
| `npx biome` rodou um pacote errado (`biome@0.3.3`) pelo Node do Windows | O shell do Claude não carrega o nvm, e o pacote certo é `@biomejs/biome` | Inofensivo (lido e apagado). Claude: `source ~/.nvm/nvm.sh` antes de npm/npx, e `npx --no-install` |

**Pendências anotadas:**
- Na D1: excluir `**/*.test.ts` e `src/testes/` do build.
- **Suíte em ~126 s** (era ~44 s no início da A2). Quase tudo vem dos
  cenários longos (`ncProntaParaFechar`, ~20 requisições). Medir antes
  de otimizar. Opções conversadas: um banco por worker (maior ganho no
  total, é mudança de infraestrutura) — **não** montar cenário direto no
  banco (fica fora da realidade da API).
- Atualizar a lista de progresso na descrição do PR #3 depois do push.
- **Rever o `podeExecutar`** (`compartilhado/permissoes/pode-executar.ts`).
  Foi pensado para generalizar, mas só é usado em 3 lugares (publicar,
  excluir e submeter no `ciclo-vida.service.ts`) — todas as outras ações
  checam à mão, com `temPapel` e a atribuição de cada uma, então a
  generalização não se paga. Achado nos testes de permissão da A2: ele
  aceita **colaborador ou aprovador designado**, e o PRD §8 exige
  **colaborador** para publicar, submeter e excluir — um aprovador
  designado com papel EDITOR (ex.: o `qa`) consegue fazer isso sem estar
  no item. Esse caso ficou fora dos testes (comentário na tabela de
  `permissoes.classificacao.test.ts`). Decidir com a analista se vira bug
  (B15) antes de mexer.

## 6. Próximo passo

1. `git push` (os commits da §4).
2. **Item "concorrência" da A2 — Matthew escreve**, com orientação
   (plano: "o teste mais interessante do projeto"). Várias publicações
   simultâneas, nenhum código repetido nem pulado. **Antes de começar,
   Claude explica condição de corrida** (o que é, por que o código
   sequencial está sujeito a ela, como um teste provoca uma de propósito).
3. Depois (Claude, anunciando antes): **Atribuições** (um aprovador por
   item, sem duplicata, RN-12, RN-18) → **aposentar os `.http`** (o
   `requests-fluxo-completo.http` sai quando os 19 modos de falha
   estiverem cobertos — conferir quais ainda faltam).
