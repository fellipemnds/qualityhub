# QualityHub — contexto para o Claude Code

Sistema de gestão de Não Conformidades (ISO 9001:2015, cláusula 10.2),
construído do zero por Matthew, aprendendo backend full-stack no processo.
Este arquivo é o ponto de entrada rápido — a fonte de verdade detalhada é
`docs/changelog-arquitetura.md`, que registra toda decisão de arquitetura,
com o porquê e as divergências em relação ao documento de design original.

**Leia `docs/changelog-arquitetura.md` antes de propor qualquer mudança
estrutural** — ele existe justamente para não repetir discussões já
resolvidas.

## Como este projeto foi construído (workflow com Claude)

Matthew é iniciante em desenvolvimento full-stack, aprendendo no processo.
O padrão de trabalho até agora foi: Claude explica o conceito, Matthew
escreve o código, Claude revisa. **Ao propor mudanças, prefira explicar o
raciocínio e perguntar antes de reescrever grandes blocos** — mas para
tarefas repetitivas/mecânicas (gerar o 5º arquivo seguindo um padrão já
validado 4 vezes), pode gerar direto.

## Stack

Node.js 24, TypeScript 7, Fastify 5 (com `fastify-type-provider-zod`),
Prisma 7, PostgreSQL 17, Zod 4. Ambiente: WSL2/Ubuntu, Docker Compose para
o banco.

## Arquitetura em uma página

- **Supertipo `Registro`**: todas as seis entidades de negócio
  (`NaoConformidade`, `Contencao`, `Classificacao`, `Investigacao`,
  `AcaoCorretiva`, `Verificacao`) compartilham a mesma linha via chave
  primária compartilhada (`id` = FK para `Registro.id`, sem `@default`).
  `Registro` carrega `tipo`, `estado`, `codigo`, `portaoAtual`.
- **Ciclo de vida genérico** (`compartilhado/registro/ciclo-vida.service.ts`):
  `criarRascunho`, `publicar`, `submeter`, `decidir`, `reabrir`, `cancelar`,
  `excluirRascunho`, `concluir` — reaproveitado por todas as entidades.
  `decidir` aceita um parâmetro `fecharAoAprovarUltimoPortao` (default
  `true`) para os casos onde aprovar o último portão não deve fechar o
  item (ver `AcaoCorretiva` abaixo). `publicar`/`submeter`/
  `excluirRascunho` aceitam a `Acao` de permissão como parâmetro
  (default a ação genérica), porque `Classificacao` exige `CLASSIFICAR`
  em vez de `PUBLICAR`/`SUBMETER`/`GERENCIAR_RASCUNHO`.
- **Permissões em três camadas**: papel (`temPapel`) → estado do registro
  → atribuição (`Atribuicao`, com `funcao: COLABORADOR | APROVADOR`).
  `podeExecutar` combina as três; algumas transições usam checagem
  estrita manual (`decidir` exige ser especificamente o aprovador
  designado, não qualquer `APROVADOR`).
- **Edição permitida em `RASCUNHO` e `ABERTO`**, bloqueada a partir de
  `EM_APROVACAO` (`compartilhado/registro/estados-editaveis.ts`,
  `ESTADOS_EDITAVEIS`) — publicar não trava o conteúdo, só formaliza
  que o item existe.
- **Enums sempre desacoplados do Prisma**: todo enum usado em Zod/services
  tem uma versão própria em `compartilhado/entidades/` (padrão `as const`
  - tipo derivado), nunca importa direto do client do Prisma fora dos
    repositories.
- **Todo módulo de entidade segue**: `<entidade>.schema.ts` (base/
  rascunho/publicação/fechamento, conforme necessário) →
  `<entidade>.repository.ts` → `<entidade>.service.ts` →
  `<entidade>.controller.ts` → `<entidade>.routes.ts`, todos dentro de
  `modulos/nc/` (entidades filhas pertencem à NC, não têm módulo
  próprio). Pendente: reorganizar em subpastas por entidade quando
  houver tempo — está tudo solto e prefixado por enquanto.

## Particularidades por entidade (as pegadinhas reais)

- **`Classificacao`**: só `APROVADOR`/`GERENTE` cria/edita/publica/
  submete/exclui (RN-20) — usa a ação `CLASSIFICAR`, não as genéricas.
- **`Investigacao`**: `causaRaiz` e `causaDireta` são campos de texto
  simples (não tabelas) — decisão tomada depois de mapear o processo
  real com a analista de qualidade. `Hipotese` é tabela de apoio, sem
  ciclo de vida próprio, gerida dentro do fluxo de Investigação.
  `MetodoInvestigacao` tem só `A3_SPS` (não os métodos do documento
  original) — decisão de produto da analista.
- **`AcaoCorretiva`**: só **um** portão (`PLANO`) — decisão de rollback
  em relação ao documento original, que tinha dois (`PLANO`+`EXECUCAO`).
  Aprovar o plano volta para `ABERTO` (não fecha, via
  `fecharAoAprovarUltimoPortao: false`). A execução nunca é submetida
  para aprovação — `finalizarExecucaoAcaoCorretiva` fecha direto, sem
  aprovação, e **gera automaticamente uma `Verificacao`** já em
  `ABERTO` (pula rascunho), com prazo calculado a partir de dias
  informados pelo colaborador.
- **`Verificacao`**: nunca criada diretamente pelo usuário — só nasce
  via `finalizarExecucaoAcaoCorretiva`. Sem portão, conclui direto
  (`concluir()`). O `resultado` da conclusão dispara lógica automática:
  `PARCIALMENTE_EFICAZ` cria nova `AcaoCorretiva` (mesma investigação);
  `NAO_EFICAZ` reabre a `Investigacao` e a `NaoConformidade`
  automaticamente.
- **Guarda de fechamento da NC** (`submeterNC`, reconciliado com RN-21):
  exige ≥1 `Classificacao` FECHADA, ≥1 `Investigacao` FECHADA, nenhuma
  `Contencao` pendente. **Não** espera `AcaoCorretiva`/`Verificacao` —
  essas continuam depois do fechamento, e podem reabrir a NC via o
  mecanismo acima.

## Testes

Sem suite automatizada ainda — testes manuais em `testes/*.http` (REST
Client do VS Code) e `testes/setup-usuarios-teste.sql` (popula 8
usuários cobrindo cada combinação de papel). Ao mexer numa entidade,
vale rodar o `.http` correspondente antes de considerar a mudança
pronta.

## O que falta (backend)

- Auditoria em `atualizarNC`/`criarUsuario` — pendência registrada, não
  bloqueante.
- Filtros de listagem além de `estado`/`naoConformidadeId` (contrato de
  API original previa `classificacao`, `origem`, `de`/`ate`, `minhas`,
  `cursor`) — não implementados ainda.
- Módulo Feed (comentários, menções) — não iniciado.
- Documentação OpenAPI — não iniciada.
- Reorganização de `modulos/nc/` em subpastas — adiada.
- Fase 3 (frontend) e Fase 4 (testes automatizados, deploy) — não
  iniciadas.

Lista completa e detalhada de pendências: seção final de
`docs/changelog-arquitetura.md`.
