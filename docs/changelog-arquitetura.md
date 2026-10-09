# Changelog de Arquitetura — QualityHub

Este documento registra todas as decisões tomadas durante a implementação que
divergem do "Chat de arquitetura" original, ou que preenchem lacunas que ele
deixou em aberto. Serve como fonte para a próxima revisão consolidada do
documento de arquitetura.

---

## Decisões já aplicadas

### Fase A7 — travas entre linhas (branch `fase/a7-travas-entre-linhas`, em andamento)

- **Travar antes de ler (2026-10-09, B29–B36).** A trava do B19 (o
  `UPDATE` condicionado ao estado lido) protege a linha do próprio item,
  mas age só na gravação, depois da conferência. As regras que leem
  **outras linhas** ganharam uma trava pega **antes** da leitura, na
  mesma linha pelos dois lados da corrida: o pai (`registroRepository
  .travar`: a NC para os filhos e o envio, a investigação para as ações,
  o envio e o cancelar), o item (as atribuições), a pessoa
  (`usuarioRepository.travar` para quem a muda × `travarParaEscolha`,
  compartilhada, para quem a escolhe) e o setor (o mesmo par). O último
  `ADMIN` usa uma trava só (`pg_advisory_xact_lock`), porque cada lado
  mexe numa pessoa diferente. **`FOR NO KEY UPDATE`, nunca `FOR
  UPDATE`:** o primeiro teste do B32 deu *deadlock*. O `FOR UPDATE`
  bloqueia também quem só aponta para a linha (a chave estrangeira da
  auditoria, que pega `FOR KEY SHARE`), e dois ADMINs agindo um no outro
  se esperavam. O `FOR NO KEY UPDATE` é a trava que um `UPDATE` comum já
  pega, e era o aviso do comentário do `travarAtivo` (A6). **Alternativa
  descartada:** transações `SERIALIZABLE`, que acham a corrida sozinhas,
  mas devolvem erro de serialização a ser repetido em toda rota.
- **Filho novo com a NC em rascunho ou aberta (RN-51, B29).** Matthew
  decidiu "só em `ABERTO`" respondendo à proposta que falava de em
  aprovação e fechada; na implementação, o rascunho foi mantido, porque a
  A3 decidiu e testou a NC em rascunho com filhos (a contenção começa
  antes de a NC ser formalizada; excluir o rascunho leva os filhos), e o
  rascunho não abre brecha (publicar não confere os filhos). Matthew
  confere na revisão.
- **Teste de corrida sem sorte: o `pausarNoMeio`** (`testes/cenarios.ts`).
  Com o `Promise.all`, a corrida do envio da NC aconteceu em 1 de 4
  rodadas, e o teste passaria sem a trava. A pausa espiona o método que
  vem entre a conferência e a gravação (`vi.spyOn`), dispara a outra
  requisição ali e espera 300 ms: sem a trava, a outra grava por baixo
  (vermelho sempre); com ela, espera e é recusada (verde sempre).

### Fase A6 — usuários, setores e pessoas (branch `fase/a6-usuarios-e-setores`, em andamento)

- **Conferência do setor num lugar só** (2026-10-08, L6): o
  `conferirSetor` (`modulos/setor/conferir-setor.ts`) responde 404 para
  setor inexistente. A NC e o `POST /usuarios` usam; toda rota que
  recebe setor também vai usar. Quando a RN-44 (setor desativado) entrar,
  entra ali.
- **Leitura de usuários (F1, 2026-10-08):** `GET /usuarios` e
  `GET /usuarios/:id`, só do `ADMIN`, com a permissão antes de qualquer
  busca (`exigirGerenciarUsuarios`, também no criar). A resposta é a lista
  do que pode sair (`usuarioRespostaSchema`: sem senha nem datas da
  sessão), a mesma na lista e no detalhe (D1). A situação é um enum
  (`ATIVO`/`INATIVO`), não um booleano: na URL, `"false"` viraria `true`
  num `z.coerce.boolean()`. A busca vazia acha todos, em vez de 400 (o
  campo da tela pode ir em branco).
- **Editar usuário (F2, 2026-10-08):** `PATCH /usuarios/:id` só com
  nome e setor; o e-mail fica de fora (é o login da pessoa). Vale também
  para o usuário inativo (Matthew: corrigir o cadastro de quem saiu não
  traz risco). A auditoria grava só o que a edição muda (`nome`,
  `setorId`): o usuário inteiro levaria o hash da senha para a trilha.
- **Papéis (F3, 2026-10-08):** `POST /usuarios/:id/papeis` concede e
  `DELETE /usuarios/:id/papeis/:papel` revoga, só do `ADMIN`. Conceder o
  que a pessoa já tem, ou revogar o que ela não tem, responde 200 como
  ela está, sem nada na auditoria (como os colaboradores, que respondem
  `jaEramColaboradores`): a tela não trata um erro que não é erro. As
  ações `CONCEDER_PAPEL` e `REVOGAR_PAPEL` gravam a lista de papéis de
  antes e de depois. O papel muda na próxima requisição da pessoa (B7).
  **A trava da RN-43** (escrita por Matthew, 2026-10-08): revogar o
  `APROVADOR` de quem é aprovador de item em `RASCUNHO`, `ABERTO` ou
  `EM_APROVACAO` responde 409 com a lista dos itens (`id`, `codigo`,
  `tipo`, `estado`), pela consulta `listarItensAbertosDoAprovador`
  (`atribuicao.repository.ts`), que atravessa a relação até o `Registro`.
  **O último `ADMIN`:** revogar o `ADMIN` quando não sobra **outro**
  `ADMIN` ativo responde 409 (`contarOutrosAdminsAtivos`): contar os
  outros, e não o total, deixa revogar o `ADMIN` de um admin já inativo.
  As duas conferências voltam no inativar (F4), que é a hora de tirá-las
  para uma função só.
- **Inativar e reativar (F4, 2026-10-08):** `POST /usuarios/:id/inativar`
  preenche o `desativadoEm` e o `sessaoValidaDesde` (a pessoa cai na
  próxima requisição); `/reativar` limpa o `desativadoEm` (E2), e as
  sessões de antes continuam derrubadas. Repetir não é erro nem duplica a
  auditoria (`INATIVAR_USUARIO`, `REATIVAR_USUARIO`). As travas da RN-43
  foram extraídas por Matthew para o `conferirSaida`, que recebe **os
  papéis que saem**: o revogar passa `[papel]`, e o inativar, todos os da
  pessoa; a regra de quais papéis travam fica num lugar só. As rotas ficam
  declaradas por extenso, como as outras (um laço montava a URL e
  escondia o texto da busca).
- **Pessoas (F7, 2026-10-08):** `GET /pessoas`, para o painel de
  atribuições e o `@` do feed, aberta aos papéis de negócio
  (`VISUALIZAR`) e não ao `ADMIN`. Só usuários ativos, só id, nome e
  setor (E3), filtro `?papel=`. A busca é **só no nome**: no e-mail, quem
  não é `ADMIN` descobriria o e-mail dos outros tentando letra por letra.
  Fica no módulo de usuário (pessoas são usuários vistos de outro jeito).
  Feita antes da F4–F6, enquanto a trava da RN-43 esperava Matthew.
- **Convite e sessão sem depender do relógio (F5, 2026-10-08;
  `security-and-hardening` e dois ciclos de `doubt-driven-development`,
  um deles com o Gemini).** Decisões, todas aprovadas por Matthew:
  - **Versão da sessão no lugar da data (B27).** O `Usuario` ganha
    `versaoSessao` (inteiro) e perde o `sessaoValidaDesde`. O login lê a
    senha e a versão **na mesma leitura** e grava a versão no JWT (`sv`); o
    `autenticar` exige a **mesma** versão. Derrubar as sessões (sair de
    todos, inativar, definir senha, gerar convite) soma 1. Com a data, um
    login em voo durante a derrubada sobrevivia, todo token do mesmo
    segundo passava, e um relógio que volta (NTP, WSL2) reabria sessões.
  - **Revogar convite sem relógio.** O `TokenAcesso` ganha `revogadoEm`
    (e um índice em `usuarioId`). Revogar marcando `expiraEm = agora`
    dependia de o relógio de quem revoga estar antes do de quem usa: um
    link revogado ainda definia a senha (a intercalação veio dos dois
    revisores). O `usadoEm` continua querendo dizer "aceito".
  - **Um lugar só para emitir convite** (`emitirConvite`): revoga os
    pendentes e cria o novo; criar usuário, gerar convite e o script do
    primeiro acesso passam por ele.
  - **Travas sempre pelo `UPDATE` condicional, pelo `tx` e com o usuário
    primeiro** (no gerar convite, no inativar e no definir senha): sem
    `SELECT ... FOR UPDATE` (deadlock entre dois admins) e na mesma ordem
    (deadlock entre convite e senha). O bcrypt do definir senha roda
    **fora** da transação (não prende conexão).
  - **Definir senha:** limite de tentativas, só token do tipo
    `CONVITE`, uma mensagem única para todo link que não vale (inexistente,
    aceito, revogado, expirado, usuário inativo). O limite ficou **por
    link** (5 por minuto, a chave é o hash do token), e não por IP (o
    desenho): o que pesa é o bcrypt de um link válido; por IP, juntaria
    pessoas atrás da mesma rede e travaria a suíte, que chama tudo do mesmo
    IP (ajuste na F5c, 2026-10-08).
  - **Aceitos como concessão:** o tempo da resposta ainda distingue "link
    válido, usuário inativo" (recusa depois do bcrypt); dois `ADMIN`s
    inativando um ao outro ao mesmo tempo (write skew). **Para depois:** o
    token na URL do frontend vai no `#fragmento` (C0), e o corpo das
    respostas fora do APM (D).
  - **Ruído descartado** (o código já tratava): login de quem não tem
    senha, JWT sem expiração, senha acima de 72 bytes.
  - **F5b feita** (2026-10-08): `revogadoEm` e o índice em `usuarioId`
    (migration `convite_revogavel`); `emitirConvite`
    (`modulos/auth/emitir-convite.ts`), usado pelo criar usuário e pelo
    `POST /usuarios/:id/convite`, que trava o usuário (`travarAtivo`),
    derruba as sessões e responde `{ tokenConvite, expiraEm }` com
    `no-store` (o criar usuário também). `GERAR_CONVITE` grava o id do
    convite, nunca o token. O inativar ficou condicional (dois ao mesmo
    tempo gravam uma vez) e revoga os convites pendentes. Prova de quebra
    do teste de concorrência: sem a trava, três rodadas vermelhas.
  - **F5c feita** (2026-10-08): o `definirSenha` valida o convite numa
    leitura, calcula o bcrypt fora da transação e grava numa transação
    curta (o usuário ativo primeiro, somando 1 à versão; depois o convite
    ainda valendo, tudo no `WHERE`). A auditoria `DEFINIR_SENHA` grava o
    `conviteId`, o mesmo do `GERAR_CONVITE`.
- **Setores, F6a (2026-10-08):** módulo `setor/` com `GET /setores`
  (logado: os ativos, em ordem de nome; o `ADMIN` pede `?situacao=INATIVO`
  ou `TODOS`), `POST /setores` e `PATCH /setores/:id` (renomear), só do
  `ADMIN` (ação `GERENCIAR_SETORES`). O `GET` **não pagina**: lista curta e
  inteira para o seletor da tela, exceção explícita na trava da paginação,
  como o checklist. O nome é único **sem diferenciar maiúscula**
  ("qualidade" e "Qualidade" seriam o mesmo setor para quem escolhe numa
  lista); com o nome de um setor desativado, a recusa sugere reativá-lo. A
  trava do `{id}` aprendeu o `id` numérico do setor (um número que não
  existe) na função `idDeOutroTipo`. A RN-44 foi detalhada (PRD v1.8):
  desativar exige o setor sem pessoas ativas — vem na F6b.
- **Setores, F6b (2026-10-08):** `POST /setores/:id/desativar` recusa
  (409, com a lista de id e nome) enquanto houver pessoa **ativa** no setor
  (as inativas são histórico); `/reativar` devolve o setor às opções. Os
  dois pelo `UPDATE` condicional: repetir não grava de novo. O
  `conferirSetor` ganhou o setor atual: setor desativado não entra em
  **escolha nova** (criar ou mudar o setor de NC ou de pessoa), mas mandar
  o setor que o item já tem passa. Reativar uma pessoa de setor
  desativado é recusado até mudar o setor dela. **Concessão:** desativar
  o setor no mesmo instante em que se cria uma pessoa nele (cada lado
  trava uma linha diferente; com um `ADMIN`, não acontece).
- **A trava do `{id}` escolhe quem chama** (F1): as rotas de usuário são
  chamadas pelo `ADMIN`, e as dos itens, pelo gerente. Com o gerente, o
  `GET /usuarios/:id` respondia 403 (a permissão vem antes da busca), e a
  trava não testava o 404.
- **Script do primeiro acesso** (`npm run criar-admin`; direção do
  `idea-refine` de 2026-10-08, aprovada por Matthew em 2026-10-09). Sem
  ele, produção não começa: criar usuário exige um `ADMIN`, e todo
  usuário exige um setor. Quem roda: Matthew e a TI, por um manual.
  Serve também de **recuperação** (o único `ADMIN` perdeu a senha ou
  saiu). Um caminho só, por perguntas no terminal: nome, e-mail e setor →
  resumo → "confirma? (s/N)" → **garante que o e-mail seja um `ADMIN`
  ativo** (rodar de novo não estraga nada). Pessoa nova é criada, e o
  setor também, se o nome não existir; pessoa que já existe é reativada,
  ganha o `ADMIN` e muda de setor se o informado for outro. Nos dois
  casos, convite novo (`emitirConvite`, revoga os anteriores) e as
  sessões derrubadas. Setor desativado é recusado (RN-44). Na auditoria,
  a pessoa é autora de si mesma (também no `concedidoPorId` do papel),
  com `origem: "criar-admin"`. O link sai uma vez só, com a
  `URL_DO_SISTEMA` (opcional no `.env`), no formato
  `/definir-senha#token=...` (o fragmento não vai para o servidor nem para
  o log). **Estrutura:** o miolo `garantirAdmin(tx, dados)` testado com o
  banco, como os services, e uma casca fina (perguntas, confirmação,
  link) que recebe a entrada e a saída do terminal, para o teste
  "digitar" as respostas (o `diff-cover` cobra as linhas novas). Fica em
  `src/`, ao lado do `server.ts`: em produção roda o JavaScript
  compilado. **Fora:** argumentos na linha de comando, e-mail, senha
  digitada no script, menu de modos, como rodar em produção (D1).
  **Feito (2026-10-09):** o miolo (`modulos/usuario/garantir-admin.ts`,
  7 cenários) e a casca (`criar-admin-terminal.ts`, 4 cenários, com
  entrada e saída falsas). O que mudou no caminho: o miolo **trava a
  linha da pessoa antes de ler** (`encerrarSessoesPorEmail`, um `UPDATE`
  pelo e-mail que derruba as sessões e trava) — lendo antes, duas rodadas
  ao mesmo tempo deixavam dois convites valendo (o contrato do
  `emitirConvite`), e uma inativação no meio passava despercebida; a
  casca lê as linhas em fila (iterador do `readline`), porque o
  `question()` perde as que chegam antes da pergunta; os dados digitados
  passam pelo Zod com os tetos da rota; erro de regra (`AppError`) vira
  mensagem e código 1, e o resto estoura. O ponto de entrada
  (`src/criar-admin.ts`) só liga a casca ao teclado e à tela e fica fora
  do `diff-cover` (exceção X5, `CONSTRAINTS.md` §5); conferido rodando o
  script (pessoa nova, recuperação, desistência).
- **Pessoa inativa não recebe atribuição nova (B28, 2026-10-09).**
  Achado na revisão da fase (`/abrir-pr`): inativar não tira os papéis,
  e as rotas de atribuição não olhavam o `desativadoEm`; a trava da
  RN-43 se contornava em dois passos (inativar quem não aprova nada,
  depois designá-lo aprovador). Definir o aprovador e adicionar
  colaboradores recusam a pessoa inativa com **409**, como as outras
  recusas por "pessoa inativa" da fase (gerar convite); a lista de
  colaboradores continua tudo ou nada (B16). A cópia automática dos
  colaboradores no `PARCIALMENTE_EFICAZ` (B6) **pula** os inativos, em
  vez de recusar: ela não tem quem escolha outro, e a ação nova nasce do
  mesmo jeito (sem nenhum colaborador, se todos saíram; qualquer `EDITOR`
  se adiciona, RN-18). **Fora:** a herança do aprovador da NC
  (`herdarAprovadorDaNC`). Com a NC aberta, a RN-43 já impede inativar o
  aprovador dela; só escapa com a NC fechada e a verificação com outro
  aprovador, e o aprovador se troca pela rota. Primeiro uso da sessão na
  nuvem com a suíte inteira (`SETUP.md` §13).
- **Revisão de concorrência da fase (2026-10-09), pedida por Matthew
  depois do B28.** Varredura de toda conferência "confere e depois
  grava" do repositório, com a `doubt-driven-development` e a
  `security-and-hardening` do agent-skills (lidas do repositório público,
  porque o plugin não vem na nuvem). A trava do B19 protege a linha do
  próprio item; as regras que leem **outras linhas** não tinham trava.
  Uma sonda de testes (descartada depois) confirmou cada caso, 5 de 5
  rodadas: **B29–B36**. Decisões de Matthew: a A6 fecha com o B28, e os
  oito vão para uma **fase nova, A7**, antes do portão; e o filho novo
  **não nasce com a NC em aprovação, fechada ou cancelada** (RN-51, PRD
  Q24; o rascunho continua recebendo filhos, como desde a A3). O mecanismo
  planejado, um só: travar antes de ler (plano, A7).

### Fase A5 — contrato da API (branch `fase/a5-contrato-api`, PR #8)

- **Prefixo `/api` num plugin só** (2026-10-06): as nove chamadas de
  rotas foram para dentro de um `app.register(..., { prefix: "/api" })`
  no `app.ts`; os `*.routes.ts` continuam declarando o caminho sem o
  prefixo, e rota nova registrada ali ganha o `/api` sozinha. O cookie
  `qh_sessao` passa a `Path=/api` (fim da divergência da A4). Nos testes,
  as URLs ficam **por extenso, com `/api`** (trocadas por script): o
  `chamar` não acrescenta o prefixo, para o teste mostrar a URL real.
- **Contrato de resposta das rotas de NC** (Matthew, 2026-10-06; levantamento
  das respostas reais com o `api-and-interface-design`): **D1** um formato
  só, o `ncRespostaSchema` (os campos do `Registro` e da NC lado a lado), em
  criar, detalhe, itens da lista e todas as transições; o `PATCH`, que
  devolvia só os campos da NC, passa a devolver o formato completo.
  **D2** o `portaoAtual` não sai (detalhe interno do ciclo de vida; o que
  é exposto vira compromisso). **D3** a lista mantém o envelope
  `{ itensDaPagina, proximoCursor }`. **D4** erros declarados com
  `"4xx": erroSchema` (`{ mensagem, error? }`, compartilhado). **D5** o
  detalhe não ganha filhos, aprovador, colaboradores nem etapa na A5: o
  formato certo depende da T-06, e acrescentar campo depois não quebra
  quem usa (anotado na C1); a exceção é o último motivo de reprovação
  (L7), que o plano põe nesta fase.
- **Como o schema de resposta foi montado** (rotas de NC, Matthew,
  2026-10-06): schema **próprio de resposta**, não o de entrada (o de
  entrada tem regras, como mínimo de caracteres, e um rascunho
  incompleto guardado viraria 500); `.nullable()` em tudo o que o banco
  permite nulo. O `diaDeCalendario()` virou **codec** do Zod (`decode`
  na entrada, `encode` na saída, os dois em `"AAAA-MM-DD"`), o que
  conserta o B22 pela resposta. Os erros usam um `erroSchema`
  compartilhado (`compartilhado/errors/erro.schema.ts`), com `error`
  `unknown` e opcional; as listas, o `paginaSchema(itemSchema)` genérico,
  ao lado do `paginar()`. O 204 sem corpo declara `z.null()`, que o
  Fastify não serializa: é só documentação para o OpenAPI. Testes que
  esperavam o formato antigo (data com hora) mudam junto, sem mudar o
  objetivo deles.

- **Busca com tipo (B23)** (2026-10-07, Matthew escreveu a busca e o
  `decidir`; Claude repetiu): toda transição do `cicloVidaService` passa
  a receber o `tipo` esperado, **obrigatório**, logo depois do
  `registroId` (`decidir(tx, id, "CONTENCAO", ator, dados)`); os `GET` e
  `PATCH` dos services usam a mesma `buscarRegistroDoTipoOuFalhar`, em
  arquivo próprio. Obrigatório pelo mesmo motivo da trava do B19: o
  compilador aponta a chamada que esquecer. Feito em "expandir e
  contrair": a busca nova ao lado da antiga, as transições migradas uma
  por fatia, e a antiga apagada quando ninguém mais a usava. Item de
  outro tipo responde como inexistente (404, mesma mensagem), sem
  revelar que o `id` existe.

- **Schema de resposta nos cinco filhos** (2026-10-07, Claude, no padrão
  das rotas de NC): contenção, classificação, investigação, ação
  corretiva e verificação seguem o D1–D5. As listas dos filhos continuam
  um array simples (a paginação deles é a L4). O `PATCH` de cada um
  devolve o formato completo, com o `Registro` que o B24 já toca. O
  `planoAprovado` sai em **todas** as rotas da ação corretiva, não só no
  detalhe (Matthew, 2026-10-07): depois de aprovar, a resposta já libera
  a execução, sem outro `GET`; na lista, ele vem na mesma consulta (as
  aprovações do `Registro` no `include`). O `finalizar-execucao` devolve
  a ação com a `verificacaoGerada` no formato da Verificação, por isso a
  Verificação veio antes da ação corretiva.

- **Schema de resposta na sessão, nos usuários e nas atribuições**
  (2026-10-07, Claude; planejado antes com Matthew, por tocar o login):
  só a declaração do que sai, sem mudar o login, o cookie, o JWT nem o
  limite de tentativas. No `/auth/eu` e no `POST /usuarios`, o schema é
  a **lista do que pode sair**, a segunda trava depois do `select`: a
  prova de quebra pôs `senhaHash` na consulta e no controller, e sem o
  schema o hash saía na resposta. O convite (`tokenConvite`) é uma
  credencial e sai só na criação, para o `ADMIN`. As atribuições
  devolvem o registro gravado, como já faziam (o resto, na C1, pelo D5).

- **OpenAPI** (2026-10-07, A5 item 3; planejado com Matthew, com as
  fontes): o `@fastify/swagger` (o 9.8.1 que já vinha com o provider,
  agora declarado) monta o documento com o `jsonSchemaTransform`, antes
  das rotas. **OpenAPI 3.1**, e não 3.0: sem o tipo `null`, o 204 saía
  com corpo (o Orval converte tudo para 3.1 ao ler). O
  `diaDeCalendario()` ganhou `.meta({ type: "string", format: "date" })`:
  nas respostas, o provider documenta o lado de saída do codec (o
  `Date`) como `date-time`, e o cliente gerado recusaria o
  `"AAAA-MM-DD"`. A interface (`@fastify/swagger-ui`, dependência de
  desenvolvimento, carregada com `import()`) publica `/api/docs` e
  `/api/docs/json` **só com `NODE_ENV=development`** (Matthew): produção
  não publica o mapa da API. O CSP do `helmet` não bloqueou a página.
  Uma trava nova no `app.test.ts`: toda rota da API declara a resposta
  de sucesso.
- **`GET /api/saude`** (2026-10-07, A5 item 5) no lugar do `GET /`,
  sem login, com schema de resposta; testar o banco fica para a D1.

- **Lote de auditoria e permissões** (2026-10-07, planejado com Matthew):
  **L5**, o `definirAprovador` confere permissão, item e estado antes
  de buscar o usuário escolhido (quem não podia agir sabia, pela
  resposta, se o usuário existia e se era aprovador). **Catálogo
  `AcaoAuditada`**, ao lado do `EntidadeAuditada` em
  `compartilhado/auditoria/` (o TRD dizia `compartilhado/entidades/`;
  ficou junto do irmão, e o TRD foi corrigido): o `registrar` e o
  `aplicarTransicao` só aceitam o que está nele. Renomeadas antes de
  existir produção: `SALVAR_RASCUNHO` → `EDITAR` e `REMOVER_COLABORADOR`
  → `REMOVER_COLABORADORES`; registros antigos com os nomes velhos só
  existem nos bancos de desenvolvimento. **L7**, o
  `ultimoMotivoReprovacao` no detalhe dos cinco tipos com portão (a
  última decisão vale; aprovada depois, `null`).

- **Tetos de entrada e listas paginadas** (2026-10-07, lote 4, L4;
  planejado com Matthew, com a revisão de design das APIs): os tetos
  `TEXTO_CURTO` (200) e `TEXTO_LONGO` (5.000) em
  `compartilhado/validacao/tetos.ts`; a senha até **72 bytes** (o bcrypt
  só usa os primeiros 72; em bytes, porque acento ocupa 2); até 50
  colaboradores por requisição. Os **schemas de corpo** ficam estritos
  (`.strict()`): campo desconhecido responde 400. Os schemas base não,
  porque também conferem linhas do banco, e os de resposta também não,
  porque descartar o que sobra é a trava do que pode sair. As cinco
  listas dos filhos passam ao envelope paginado da lista de NCs, com o
  filtro exigindo UUID; nos repositórios, **sem `limit` vêm todas**,
  porque a guarda de fechamento da NC usa as mesmas funções. Três
  travas novas no OpenAPI (teto, corpo estrito, lista paginada), como a
  de "toda rota declara a resposta". Anotados para a C1 (revisão de
  design): R7, o erro sem código para máquina, e R8, o `DELETE` com
  corpo.
- **Funções repetidas dos services: ficam, com uma trava** (Matthew,
  2026-10-08, lote 5; com o `idea-refine`). As dores levantadas foram
  esquecer um tipo, o trabalho repetido e a leitura; a prioridade
  escolhida foi **ler um arquivo e ver o fluxo inteiro do tipo**. O
  padrão de módulo **não muda**: cada service continua com as suas
  funções. A lógica pesada já mora no `cicloVidaService`; o que se
  repete nos services é a cola entre ele e o repositório do tipo, e as
  diferenças (`CLASSIFICAR`, `planoAprovado`, a RN-50, o filtro
  "minhas" da NC) cresceriam na C1 e na C2. O medo de esquecer um tipo
  ganhou uma **trava** no `app.test.ts`: ela percorre o OpenAPI e chama
  **toda rota com `{id}`** com o id de um item de outro tipo, esperando
  404 (rota nova entra sozinha; as de `/registros` ficam de fora, porque
  valem para qualquer tipo). Ela achou o **B25** na primeira rodada.
  Descartados: uma fábrica por tipo (dividiria o fluxo em dois lugares,
  com uma opção para cada diferença), embrulhar `retirar`/`decidir`/
  `cancelar` (já são uma chamada e uma busca), uma rota única
  `/registros/:id/<ação>` (quebraria o D1) e um `listarPaginado` (o
  `listarX` não é igual nos seis: a NC passa o `ator.id`, e a ação
  corretiva calcula o `planoAprovado`). Reavaliar na C2, quando os seis
  `submeter` mudarem juntos (o aprovador na lista do envio), com um caso
  real.

### Fase A4 — sessão nova (branch `fase/a4-sessao`, PR #6)

- **Trava de concorrência no repositório (B19):** o
  `registroRepository.atualizar`/`excluir` exigem o estado em que o item
  foi lido e **lançam o 409** se ele mudou. É a primeira vez que um
  repositório lança erro de regra; escolhido (Matthew, 2026-10-05) porque
  o erro é sempre o mesmo e assim nenhum chamador esquece a checagem. O
  convite segue o mesmo desenho (`marcarComoUsado`, 400).
- **Login com cookie:** responde **204** sem corpo (o token não vai mais
  no JSON, senão o `HttpOnly` não protegeria nada) e grava `qh_sessao`
  (`HttpOnly`, `Secure`, `SameSite=Strict`). `manterConectado` tem
  default `false`: sem pedir, a sessão é a curta (cookie de sessão, JWT
  de 12 h); pedindo, 30 dias. **Divergência temporária do TRD §4.1:**
  `Path=/` em vez de `/api`, porque as rotas só ganham o prefixo na A5
  (com `/api`, o navegador nunca mandaria o cookie). Trocado na A5.
- **`@fastify/cookie`** (dependência nova, plugin oficial do Fastify),
  registrado antes do `@fastify/jwt`, que passa a ler o token do cookie.
- **Middleware `autenticar` pergunta ao banco (B7):** o JWT carrega só o
  `id` (o `payload` tipado no `fastify-jwt.d.ts` recusa outra coisa no
  `jwtSign`); a cada requisição, o `usuarioRepository.buscarPorId`
  (o que já existia, com os papéis) diz se o usuário existe, está ativo
  e se o token não é anterior ao `sessaoValidaDesde`, e os papéis do
  `request.user` são os de agora. **Só o cookie** vale
  (`verify: { onlyCookie: true }` no registro do plugin): o cabeçalho
  `Authorization` é ignorado. A comparação com o `sessaoValidaDesde` é em
  segundos (o grão do `iat`); o preço é um token emitido no mesmo segundo
  de um "sair de todos" sobreviver.
- **Login endurecido** (TRD §4.3): `@fastify/rate-limit` (dependência
  nova, plugin oficial) só no login, com chave IP + e-mail em minúsculas
  e o 429 como `MuitasTentativasError` (um `AppError`, para a resposta
  sair no formato de sempre). Nos testes, o `loginComo` usa um IP por
  login: o limite fica ligado de verdade, e o teste do 429 usa um IP
  próprio. O L1 compara com um hash falso de custo 12, fixo no código.
- **`@fastify/helmet`** (dependência nova, plugin oficial; auditoria R3):
  cabeçalhos de segurança em toda resposta, com o padrão do plugin
  (`nosniff`, `frame-ancestors 'self'`, HSTS, CSP). Sem `@fastify/cors`:
  front e back na mesma origem (TRD §2.1).
- **Regras de arquitetura no Biome, não no dependency-cruiser** (Matthew,
  2026-10-05): o dependency-cruiser só lê TypeScript até a versão 6; no
  7 ele analisava 0 arquivos e passaria sempre verde. O Biome, já
  instalado, faz as quatro regras do `CONSTRAINTS.md` §2.1
  (`noRestrictedImports` em `overrides` por grupo de arquivo, sem
  sobreposição, e `noImportCycles`) dentro do `npm run lint`: confere a
  cada edição, no editor e no CI, sem dependência nem passo novo.
- **Cobertura de testes** (Matthew, 2026-10-05): `@vitest/coverage-v8`
  (com o Vitest junto, 5.0.2 → 5.0.3, porque as versões andam casadas).
  Script próprio, `npm run test:cobertura`, porque a trava não faz
  sentido rodando um arquivo só; é o que o CI roda. Projeto: 95,16% das
  linhas, trava em 94,66% (`thresholds.lines`). Linhas novas do PR: o
  `diff-cover` (Python, só no CI, pelo `pipx`, versão fixa) lê o
  relatório no formato Cobertura e falha abaixo de **100%**, o valor que
  a A4 atingiu (141 linhas, nenhuma sem teste).
- **Checks de segurança no CI** (Matthew, 2026-10-05): gitleaks, Semgrep
  e osv-scanner, cada um num job próprio (rodam em paralelo e aparecem
  separados no PR), com versão fixa, e já **bloqueando**: o código
  estava limpo no fim da A4, então o período de aviso não foi preciso.
  Na instalação acharam: dois tokens de desenvolvimento no histórico e o
  segredo dos testes (X2, X3), os hashes do seed de desenvolvimento (X4)
  e a X1 de sempre; e dois problemas consertados no código, a injeção
  pelo `${{ }}` dentro de um `run:` do CI (passou para `env:`) e o hash
  falso do login escrito no código (passou a ser gerado na hora).
- **Tela inicial calculada no backend** (Matthew, 2026-10-05): a regra do
  `fluxo-app.md` §2.1 e §3 (que telas cada papel permite, qual é o
  padrão, e a volta ao padrão de quem perdeu o papel da tela escolhida)
  é uma função pura, `telaInicial` (`modulos/auth/tela-inicial.ts`).
  O `GET /auth/eu` devolve a tela efetiva e a lista das permitidas; o
  `PATCH /auth/eu` recusa com 400 uma tela fora da lista. **Pensado para
  o MVP de NCs: rever quando o QualityHub ganhar outros módulos** (a
  lista de telas cresce, e os papéis podem passar a valer por módulo).
- **Erros 4xx do Fastify e corpo só em JSON** (Matthew, 2026-10-06; B21 e
  B20, da revisão de segurança): o `setErrorHandler` responde com o
  status do Fastify todo erro abaixo de 500 que não é dos ramos
  conhecidos, com a mensagem de uma tabela em português
  (`MENSAGENS_ERRO_CLIENTE`: 400, 413, 415; "Requisição inválida." para
  os outros), em vez do texto em inglês do Fastify. O parser de
  `text/plain` sai (`removeContentTypeParser`): corpo que não é JSON
  para no 415, antes do handler. No mesmo passo, o ramo de validação
  passou a usar o `hasZodFastifySchemaValidationErrors` da biblioteca, e
  o do `AppError`, um `send` só. **Limite conhecido:** POST **sem** corpo
  não tem `content-type` e continua passando; a proteção dele é o
  `SameSite=Strict`, e o *Fetch Metadata* fica para a D1 (S5).
- **Checksum dos binários no CI** (2026-10-06, revisão de segurança S3):
  o gitleaks e o osv-scanner só rodam depois do `sha256sum -c` com o hash
  fixo no `ci.yml`, tirado do arquivo de checksums da release. Trocar a
  versão exige trocar o hash. As actions continuam por tag (`@v7`).

### Análise do repositório (branch `chore/analise-repositorio`, entre a A3 e a A4)

Quatro análises com as skills do `agent-skills` (2026-10-02, Matthew):
contrato de qualidade, auditoria de segurança, revisão e simplificação
de código, e coerência documental. Nenhuma regra de negócio mudou.

- **Contrato de qualidade em `CONSTRAINTS.md`** (raiz). Um piso
  (nenhuma supressão, stub, teste facilitado, segredo ou configuração
  afrouxada) e uma tabela com o comando, o momento e o efeito (bloqueia
  ou avisa) de cada check. Tipos, lint, testes, segredos e arquitetura
  bloqueiam; SAST, dependências e cobertura só avisam até o fim da A4. Os
  números são "medir e travar", sem metas inventadas. Afrouxar a régua
  só em commit próprio, com aprovação de Matthew. O `CLAUDE.md` exige
  ler o arquivo antes de escrever código. **Sem ADR:** é regra de
  trabalho, não escolha de arquitetura.
- **Dependências de verificação novas** (TRD §1, princípio 2), instaladas
  por Matthew na A4: `@vitest/coverage-v8` (cobertura) e
  `dependency-cruiser` (as regras de arquitetura do `CLAUDE.md` viram
  check) como dependências de desenvolvimento; gitleaks (segredos),
  Semgrep (SAST) e osv-scanner (dependências) só no CI, sem instalar nas
  máquinas. Escolhidas porque são as ferramentas de referência de cada
  dimensão: config e formato de regra que o resto do ecossistema já usa.
- **Endurecimento aplicado** (auditoria de segurança): bcrypt com custo
  12 no `definir-senha` (era 10; um teste confere o hash); o servidor
  recusa subir com `JWT_SECRET` com menos de 32 caracteres; Postgres de
  desenvolvimento publicado só em `127.0.0.1`.
- **Achados alocados no plano:** B19 (transições sem trava sob
  concorrência) na A4, antes dele a simplificação do `ciclo-vida`; os
  outros achados na A4, A5 e A6. `@fastify/helmet` entra na A4; o
  `@fastify/cors` **não**: front e back na mesma origem (TRD §2.1).
- **Vulnerabilidades do Prisma 7** viram a exceção **X1** do
  `CONSTRAINTS.md` (dono e prazo: 2026-12-31), ligada ao risco do TRD §13
  (o porquê). Os IDs de exceção começam com X para não colidir com as
  decisões E1–E3 do esquema.

### Fase A3 — correções de regra (branch `fase/a3-correcoes`)

- **Planos de ação conferidos pela Investigação, não pela NC** (PRD Q17,
  2026-10-01, Matthew, confirmado com a analista). Diverge da RN-21
  confirmada na Q1, que punha os planos na guarda da NC. O A3 da
  investigação inclui as contramedidas, então o QA não aprovaria a
  investigação sem aprovar os planos que ela propõe. Fica assim:
  - a Investigação só é submetida com toda ação não cancelada ligada a
    ela com o plano aprovado, e pode fechar sem nenhuma ação (RN-24);
  - a NC exige **toda** investigação não cancelada fechada, e não olha
    mais as ações (RN-21);
  - a ação nasce ligada a uma investigação em `ABERTO`, e o
    vínculo não se apaga (RN-49). Sem isso, uma ação criada depois do
    envio escaparia das duas guardas. A exceção é a ação do
    `PARCIALMENTE_EFICAZ`, que segue depois do fechamento.

  Efeitos: a etapa "Em plano de ação" deixa de existir (10 etapas,
  `fluxo-app.md` §4); o B5 muda de lugar (esquema §7); o B10 é ampliado.
  Implementação na ordem 8 da A3, dividida em 8a–8f.
- **Cancelar investigação com ações pendentes é recusado** (PRD Q18,
  RN-50, Matthew). Com a NC ignorando investigação cancelada e sem olhar
  as ações, cancelar a investigação deixaria ações soltas. Recusar (409
  com a lista) foi preferido a cancelar as ações junto, que faria algo
  que ninguém pediu.
- **Escada de cenários na ordem real** (ordem 8a): `ncPublicada` →
  `investigacaoAberta` → `ncProntaParaFechar` → `fecharNC` →
  `executarAcao`. A ação nasce com a investigação aberta e tem o plano
  aprovado (`aprovarPlano`) antes do envio; o `ncProntaParaFechar`
  devolve essa ação, e o `executarAcao` a usa em vez de criar outra. O
  `levarAcaoCorretivaAte` parte da `investigacaoAberta`. Refatoração
  pura: mesmos testes, e um pouco mais rápida (39 testes da ação e da
  verificação: 54 s → 50 s).
- **`AcaoCorretiva.investigacaoId` obrigatório no banco** (ordem 8b,
  migration `investigacao_obrigatoria_na_acao`): a RN-49 também garantida
  pelo `NOT NULL`, não só pelo schema. A chave estrangeira passou de
  `SET NULL` (que soltava a ação sem aviso quando a investigação era
  apagada) para `RESTRICT`. **Ação só em investigação aberta, não em
  rascunho** (sugestão de Matthew, no lugar de recusar a exclusão do
  rascunho com ação): rascunho ainda não existe formalmente, e assim
  investigação com ação está sempre publicada — item publicado não se
  exclui, então o caso da exclusão nem aparece. Barrar só na tela foi
  descartado: a API deixaria passar. A NC em rascunho continua sendo
  excluída com os filhos (testado). A checagem "ação sem
  investigação" do `NAO_EFICAZ` saiu: o caso não existe mais. O banco de
  desenvolvimento precisou de reset (tinha 10 ações sem investigação):
  quem tiver ações assim no banco local precisa do mesmo
  (`SETUP.md` §12, passos 6 e 7).

- **Guardas que respondem "o que falta"** (ordens 8c/8d): a decisão é uma
  função pura (`avaliarFechamentoNC`, testada sem banco, escrita por
  Matthew), e o service só carrega os dados. A lista tem **um item por
  requisito, sempre os mesmos e na mesma ordem**, com os registros que
  faltam em `pendentes` — e não um item por registro, para a tela mostrar
  o ✅ também do que está atendido. O tipo `ItemChecklist` fica em
  `compartilhado/registro/checklist.ts`, para a guarda da investigação
  (8e). O `AppError` ganhou `detalhes`, enviados no campo `error` da
  resposta. A guarda roda como **validador** do `cicloVidaService.submeter`,
  depois de estado, permissão e aprovador: assim quem não pode submeter
  continua recebendo 403, e não a lista. A guarda da investigação (8e,
  RN-24) segue o mesmo desenho (`avaliarSubmissaoInvestigacao`). Fica
  para a C2: o aprovador entrar na lista dos seis tipos, em vez de ser
  barrado antes pela checagem genérica.
- **RN-50 (8f):** o `cicloVidaService.cancelar` ganhou um validador
  opcional, chamado depois de estado e permissão — o mesmo gancho do
  `submeter`. A investigação o usa com `avaliarCancelamentoInvestigacao`;
  os outros tipos não passam nada e continuam iguais.

### Fase A2 — rede de proteção (branch `fase/a2-rede-protecao`)

- **Máquina de estados e permissões: um arquivo por tipo**
  (`compartilhado/registro/maquina-estados.<tipo>.test.ts`,
  `compartilhado/permissoes/permissoes.<tipo>.test.ts`). Cada um tem um
  dicionário de ações, uma tabela "estado → o que é recusado" e um
  `it.each`. Estado errado espera **409**; pessoa errada, **403**. As
  duas famílias passaram pela prova de quebra (uma ação permitida posta
  na tabela derruba todos os arquivos).
- **Cenários montados pela API**, em escada: `src/testes/cenarios.ts`
  (`ncPublicada` → `ncProntaParaFechar` → `fecharNC` → `aprovarPlano` →
  `executarAcao`) e um `levarXAte(estado)` por tipo em
  `src/testes/levar-ate/`, que confere o estado em cada degrau.
- **Ler o banco para conferir, nunca para montar.** Quando não há rota
  que mostre o resultado (atribuições, registro de `Aprovacao`), o teste
  lê a tabela com o `prisma`; o cenário continua passando pela API, com
  as mesmas guardas de um usuário real.
- **O ciclo de vida genérico é testado por um tipo só** — a Contenção,
  que chega a `EM_APROVACAO` com menos requisições. A NC entra só no que
  é dela (reabrir). As listagens têm um teste por tipo, porque cada
  repositório tem o seu filtro.
- **Bug conhecido vira `it.fails`**, com um comentário apontando o Bxx:
  fica verde enquanto o bug existe e vermelho no dia do conserto (aí
  vira `it`). Como o `it.fails` passa com **qualquer** falha, o motivo é
  conferido trocando para `it` uma vez antes do commit. Casos que são bug
  mas não têm teste pronto ficam **fora** das tabelas, comentados (B1,
  B8, B12).
- **`testTimeout: 15_000`**: o padrão de 5 s estourava com a máquina
  ocupada (um teste de ~2,7 s chegou a 6,4 s).
- **Concorrência** (`sequencia.test.ts`): com o contador existente, quem
  protege é o `UPDATE ... increment` atômico, não o `FOR UPDATE` — a
  prova de quebra só falhou lendo e somando na aplicação (e aí o
  `@unique` do código recusou os repetidos com 500). Com o contador
  ainda inexistente, o `FOR UPDATE` não trava nada: B15.
- **`.http` aposentados**: os 8 arquivos de `testes/old/` foram cruzados
  com a suíte e apagados depois que tudo o que exercitavam ganhou teste
  (inclusive o `POST /usuarios` e o definir senha, que não tinham
  nenhum).
- **Achados**: B15 (primeira publicação do ano sob concorrência), B16
  (colaborador inexistente dá 500), B17 (atribuições em qualquer
  estado), B18 (motivo em branco volta 409), além do B14 — todos na A3.
  Regras novas, decididas por Matthew: **RN-47** (atribuições só em
  `RASCUNHO`/`ABERTO`; em `EM_APROVACAO`, só o `GERENTE` troca o
  aprovador) e **RN-48** (retirar da aprovação), com a ação
  `TROCAR_APROVADOR_EM_APROVACAO` no catálogo.
- **Em aberto**: o `podeExecutar` aceita colaborador **ou** aprovador
  designado, e o PRD §8 pede colaborador para publicar, submeter e
  excluir — conversar com a analista antes de virar bug. A suíte foi de
  ~44 s para ~110 s; medir antes de otimizar (um banco por worker é a
  opção de maior ganho).

### Fase A1 — testes e infraestrutura de testes (branch `fase/a1-testes`)

- **Vitest 5 + Testcontainers** (TRD §9): um Postgres 17 descartável
  por execução, criado no `globalSetup`, com as migrations aplicadas
  por `prisma migrate deploy`. A URL chega aos testes por
  `provide`/`inject`, e os `setupFiles` trocam a `DATABASE_URL` **antes**
  de o `prisma` ser importado (a ordem dos arquivos importa).
- **Isolamento por `TRUNCATE`** de todas as tabelas antes de cada teste,
  com **trava**: aborta se `current_database()` não for `test`, para
  nunca apagar o banco de desenvolvimento. `fileParallelism: false`,
  porque todos os arquivos usam o mesmo banco.
- `allowScripts`: `protobufjs`, `ssh2` e `cpu-features` **negados** de
  propósito — vêm do Testcontainers e não precisam rodar scripts de
  instalação.
- **Fábricas** em `src/testes/fabricas.ts`: `criarUsuario` e
  `loginComo(perfil)`, com os **7** perfis de
  `testes/setup-usuarios-teste.sql` (o número 8, citado antes nos
  documentos, estava errado). O `loginComo` é o **único** helper de
  autenticação: na A4 (cookie) só ele muda. Com o banco vazio não há
  quem conceda papel, então o usuário concede a si mesmo
  (`concedidoPorId` = o próprio id), como o admin do SQL.
- A **matriz** do `catalogo` não ganhou teste unitário (repetiria o dado
  no teste); o `temPapel` é testado na lógica, e a matriz é coberta
  pela API na A2.
- **CI** no GitHub Actions (`.github/workflows/ci.yml`): `npm ci` →
  `prisma generate` → lint → typecheck → testes, em `push` na `main` e
  em `pull_request` (não em `push` de qualquer branch: evita rodar duas
  vezes, e o `pull_request` testa a branch **já mesclada** com a
  `main`). Consequência: o PR de cada fase é aberto **cedo, em
  rascunho**. O check `verificar` é obrigatório no ruleset "Proteger
  main", sem exceções — vale também para o dono do repositório.
- Log do Fastify em `warn` durante os testes (`NODE_ENV=test`, definido
  pelo Vitest): some o log de cada requisição, mas o erro de um 500
  continua aparecendo.
- **Divisão de trabalho revista** (`CLAUDE.md`, plano §1): Matthew
  escreve o que ensina conceito novo; Claude faz o resto, anunciando
  cada item e esperando confirmação.

### Fase A0 — preparação (branch `fase/a0-preparacao`)

- **Biome 2.5.14** adotado como formatador e linter (TRD §9.5), com
  versão **exata** no `package.json` (uma atualização do formatador pode
  reformatar arquivos sozinha; atualizar é decisão deliberada, com
  commit próprio). Configuração escolhida para **mexer o mínimo** no
  código existente: 4 espaços (o código já usava) e 120 colunas (com o
  padrão de 80, 526 linhas seriam quebradas; com 120, 94). JSON com 2
  espaços, o padrão que o npm usa ao reescrever o `package.json`.
- A formatação foi um **commit separado** (`style:`), e a equivalência
  foi verificada: antes × depois pelo esbuild, ignorando espaços e
  quebras de linha, só mudaram ordem de imports, `;` soltos e um
  parêntese redundante num `||`.
- Correções de lint sem mudar regra de negócio, com uma melhoria: o
  handler de erro 500 passa a logar por `request.log` (inclui o id da
  requisição) em vez de `app.log`.
- Removidos: barramento de eventos (ADR-38), modelos comentados no
  `schema.prisma`, `requests-acao-corretiva.http`. `ignoreTrailingSlash`
  migrado para `routerOptions` (pendência 5 — resolvida; o aviso
  `FSTDEP022` sumiu e `/nc` × `/nc/` seguem na mesma rota).
- Scripts `test` e `build` **adiados**: `test` entra com o Vitest (A1),
  `build` com o Dockerfile (D1). Criá-los antes seria deixar algo pela
  metade.
- `npm audit` aponta 4 vulnerabilidades altas **herdadas do Prisma 7**
  (`deepmerge-ts`, `mysql2`), sem correção na linha 7.x; risco prático
  baixo, registrado no TRD §13. `npm audit fix --force` rebaixaria para
  o Prisma 6 — não usar.

### Planejamento em seis documentos; shadcn/ui no lugar do Mantine

- **Planejamento reorganizado** em `docs/prd.md` (produto),
  `docs/fluxo-app.md` (telas e navegação) e `docs/ui-ux.md` (fundações
  visuais, componentes, wireframes), com TRD, Esquema Backend e Plano de
  Implementação a seguir. Decisões de produto revisadas com a analista
  ficam no PRD (§9); este changelog continua sendo o registro das
  decisões de arquitetura.
- **Frontend usará shadcn/ui (Radix + Tailwind), não Mantine** — diverge
  do ADR-28 do documento original. Escolha de Matthew. Consequências
  registradas em `docs/ui-ux.md` §1.1: Tailwind entra na stack, e
  complementos são necessários para o que o shadcn/ui não traz pronto
  (TanStack Table, react-day-picker, Sonner, Tiptap para menções,
  react-dropzone para anexos). Regra: nenhuma biblioteca além dessas
  sem registrar o motivo aqui.
- **TRD** (`docs/trd.md`) registra os ADRs novos, 33 a 38: shadcn/ui;
  anexos só via backend (onde ficam: junto com a hospedagem); sessão em
  cookie httpOnly com usuário/papéis conferidos a cada requisição
  (corrige o atraso de até 5 h para revogar papel, porque hoje os papéis
  vão dentro do JWT); testes automáticos **antes** das correções de
  regra; OpenAPI + Orval; remoção do barramento de eventos sem uso.
  **ADR-30 (on-premise) em revisão**: sem TI envolvida e com volume
  pequeno (54 NCs no total), as opções de hospedagem estão comparadas no
  TRD §10.6.
- **Revisão cruzada dos seis documentos com o código** (mesmo dia):
  encontrou os bugs B9–B13 (`docs/esquema-backend.md` §7) — o mais grave,
  B9, é a validação de `detectadoEm` com `new Date()` avaliado uma vez
  na carga do módulo. Duas decisões de produto novas: **filho herda o
  aprovador da NC** (RN-46; antes, nascia sem aprovador e travava o
  colaborador) e **rascunho não se cancela, só se exclui** (RN-06). A
  guarda de fechamento passa a ter dois grupos (filhos × envio), para a
  etapa "Pronta para fechamento" e a pendência correspondente não
  dependerem de campos que ninguém é avisado para preencher. Regra nova
  de fuso: todo cálculo de "dia" no backend usa `America/Sao_Paulo`.

### Filtros de listagem de NC, tipo `Ator`, reorganização em subpastas, e três bugs de schema de fechamento

- **Reorganização de `modulos/nc/` em subpastas por entidade** — resolve a
  pendência #12. `nc/nc/`, `nc/contencao/`, `nc/classificacao/`,
  `nc/investigacao/` (com `hipotese.*` junto — continua sem ciclo de vida
  próprio, decisão já registrada, sem rota HTTP dedicada), `nc/acao-corretiva/`,
  `nc/verificacao/`. Feito via `git mv` + ajuste de imports relativos,
  sem mudança de lógica.

- **Tipo `Ator` criado** (`compartilhado/entidades/ator.ts`,
  `{ id: string, papeis: Papel[] }`) — resolve a pendência #13.
  Substituídas 65 ocorrências do tipo inline em 10 arquivos
  (`pode-executar.ts`, `atribuicao.service.ts`, `ciclo-vida.service.ts`,
  os seis `*.service.ts` de entidade, `usuario.service.ts`).
  `types/fastify-jwt.d.ts` também passou a referenciar `Ator` para o
  `request.user`, em vez de repetir o shape uma terceira vez.

- **Filtros de listagem de NC implementados** (resolve a pendência #8):
  `GET /nc` aceita `estado`, `origem`, `classificacao`, `de`/`ate` (sobre
  `detectadoEm`), `minhas`, e paginação por `cursor`/`limit`.
  - `ncRepository.listar` reescrito para entrar por `NaoConformidade.
findMany` direto, igual às outras cinco entidades — antes entrava por
    `registroRepository.listar` (Registro-primeiro), única exceção ao
    padrão. `NaoConformidade.id` é o mesmo valor de `Registro.id` (chave
    compartilhada), então o cursor filtra/ordena direto ali.
  - `classificacao` filtra via `NaoConformidade.classificacoes` (relação
    já existente), exigindo `some: { valor, registro: { estado: "FECHADO" } }`
    — decisão consciente de **não** reviver o campo denormalizado
    `classificacaoAtual` (ver item abaixo): uma NC pode ter mais de uma
    Classificação ao longo da vida, e "qual é a atual" é regra de negócio
    que ninguém definiu; join ao vivo reflete o banco sem inventar isso.
  - `minhas` filtra via `Registro.atribuicoes` (`some: { usuarioId }`) —
    "atribuído a mim" (colaborador ou aprovador), não "criado por mim".
  - Novo helper compartilhado `compartilhado/registro/paginacao-cursor.ts`:
    schema Zod (`cursor`, `limit`, teto de 100) + função `paginar`, que
    corta o resultado de uma busca por `limit + 1` e calcula o próximo
    cursor. Só exige `{ id: string }` — nenhuma entidade específica —
    pensado pra ser reaproveitado pelas outras cinco quando precisarem
    de paginação.
  - `ncFiltrosListagemSchema`/`NCFiltrosListagemInput` centralizados em
    `nc.schema.ts`, reaproveitados em `nc.routes.ts`, `nc.controller.ts`,
    `nc.service.ts` e `nc.repository.ts` — schema único, tipo inferido,
    nunca reescrito à mão (mesmo padrão de todo outro input do projeto).

- **Campo órfão `NaoConformidade.classificacaoAtual` removido via
  migration** (`remove_classificacao_atual_orfa`). Existia desde a Fase 0
  (antes de `Classificacao` virar entidade própria com ciclo de vida
  completo) e nunca foi escrito por nenhuma função do código — dado morto
  do desenho original, confirmado via `git log -S` até o commit que o
  criou. Se um dia a analista de qualidade definir de propósito o que
  significa "a classificação atual" de uma NC com múltiplas
  Classificações, isso volta como campo real, com semântica por trás —
  não como cache de conveniência.

- **Três bugs da mesma família corrigidos — schema de fechamento existia,
  mas nunca era usado como validador de `submeter`.** Achados testando
  `testes/requests-fluxo-completo.http` (novo arquivo, encadeia as seis
  entidades ponta a ponta, feliz + modos de falha, criado nesta sessão):
  1. `nc.schema.ts` — `riscosRevisados`/`mudancasSGQ` só existiam no
     `.extend()` de `ncFechamentoSchema`, nunca em `ncBaseSchema`. Como
     `PATCH /nc/:id` valida contra `ncRascunhoSchema` (derivado do base),
     o Zod descartava os dois campos silenciosamente — a NC nunca
     conseguia ser fechada de verdade pela API. Corrigido movendo os dois
     pro `ncBaseSchema` como `.nullish()`, igual ao padrão de
     Contenção/Investigação.
  2. `acao-corretiva.schema.ts` — mesmo problema com `investigacaoId`: só
     existia como intersecção de tipo TypeScript manual em
     `acao-corretiva.controller/service/repository.ts` (sem efeito em
     runtime), nunca no schema Zod real. Toda `AcaoCorretiva` criada
     nascia com `investigacaoId: null`, silencioso até o ramo `NAO_EFICAZ`
     da Verificação (o único que checa essa vinculação pra reabrir a
     Investigação). Corrigido adicionando `investigacaoId: z.uuid()
.nullish()` ao `acaoCorretivaBaseSchema`.
  3. `contencao.service.ts` — `submeterContencao` validava contra
     `contencaoPublicacaoSchema` (campos opcionais) em vez de
     `contencaoFechamentoSchema` (campos obrigatórios) — era exatamente a
     lacuna já anotada na seção "Entidade `Contencao`" abaixo, reaparecida
     ao conferir se as outras entidades tinham o mesmo bug do item 1.
     Corrigido trocando o validador de `submeterContencao`. Testado via
     curl: sem `executadaEm`/`disposicao` → 400; preenchidos → 200.

  Limpeza relacionada: as intersecções manuais `& { investigacaoId?: string }`
  em `acao-corretiva.controller.ts`, `.service.ts` e `.repository.ts` (só
  tinham efeito em compile-time, redundantes desde que o campo entrou no
  schema Zod do item 2 acima) foram removidas numa sessão seguinte.

- **Auditoria em `criarUsuario` adicionada** — `EntidadeAuditada.USUARIO`
  + `acao: "CRIAR_USUARIO"`, mesmo padrão de `authService.definirSenha`.
  (`atualizarNC` já registrava auditoria desde antes desta sessão — a
  pendência original sobre isso estava parcialmente desatualizada.)

- **Lacuna nova identificada, ainda sem decisão de design**: o módulo
  `usuario` só tem `POST /usuarios` (criar). Não existe listagem/busca de
  usuário, não existe revogar um papel específico (`usuarioPapelRepository`
  só tem `concederPapel`), e não existe inativar um usuário (`Usuario` sem
  campo `ativo`/`desativadoEm`). `authService.fazerLogin` não checa nada
  disso porque não há o que checar. Relevante pra um sistema de
  aprovações (ex.: alguém sair da empresa e continuar como aprovador
  válido). Ver pendência nova na lista abaixo.

### Entidade `Verificacao` — completa e testada; MVP de backend fechado

- **`Verificacao` nunca é criada diretamente pelo usuário** — nasce
  automaticamente dentro de `finalizarExecucaoAcaoCorretiva`, já em
  `ABERTO` (pula `RASCUNHO` de propósito), com código gerado via
  `sequenciaService` (mesma lógica de `publicar`), `prazo` calculado
  (`hoje + diasParaVerificar`, informado pelo colaborador ao finalizar),
  `instrucoesVerificacao` copiado do plano da `AcaoCorretiva`, e o mesmo
  usuário atualmente atribuído como `APROVADOR` da `AcaoCorretiva` já
  atribuído como **`APROVADOR` e `COLABORADOR`** da `Verificacao` nova
  (as duas — evita um passo manual extra para a mesma pessoa poder
  editar e depois concluir).
- Por nascer sempre já publicada, `publicarVerificacao` foi removida do
  service/controller/routes — nunca haveria uso real para essa rota.
- `Verificacao.eficaz: Boolean?` virou `Verificacao.resultado:
ResultadoVerificacao?` (enum: `EFICAZ`, `PARCIALMENTE_EFICAZ`,
  `NAO_EFICAZ`) — RN-23 passa a ser "qualquer resultado diferente de
  `EFICAZ` bloqueia o fechamento da NC e exige nova Ação Corretiva".
  `Verificacao.evidencia` renomeado para `Verificacao.conclusao`
  (`AcaoCorretiva.evidencia` mantém o nome antigo — propósito diferente).
- Duas linhas de auditoria em `finalizarExecucaoAcaoCorretiva`: uma para
  o fechamento da Ação Corretiva (`FINALIZAR_EXECUCAO`), outra para o
  nascimento da Verificação (`GERAR_VERIFICACAO`) — a auditoria genérica
  de `criarRascunho` não é suficiente aqui porque a Verificação nasce
  por um caminho não convencional (pula rascunho, já ganha código,
  atribuições automáticas), então precisa de um registro próprio.
- **Conclusão sem portão** (`VERIFICACAO: []`), usando `cicloVidaService.
concluir` já existente desde a Fase 1 — exige colaborador com papel
  `APROVADOR` (`CONCLUIR_VERIFICACAO`), sem aprovação adicional.
- **Todas as seis entidades do domínio (NC, Contenção, Classificação,
  Investigação, Ação Corretiva, Verificação) estão completas e testadas
  de ponta a ponta** — fecha o MVP de backend do ciclo ISO 9001 completo
  de não conformidade, da detecção ao fechamento com verificação de
  eficácia.

### `AcaoCorretiva` — mudança de arquitetura para portão único

- **`ACAO_CORRETIVA` passou de dois portões (`["PLANO", "EXECUCAO"]`) para
  um só (`["PLANO"]`)** — decisão de produto: o QA só aprova o plano;
  a execução em si não precisa de aprovação separada, só precisa
  acontecer e ser registrada (`executadoEm`/`evidencia`).
- **`cicloVidaService.decidir` ganhou parâmetro
  `fecharAoAprovarUltimoPortao: boolean = true`** — quando `false`,
  aprovar o último (e único, no caso de Ação Corretiva) portão volta o
  item para `ABERTO` em vez de `FECHADO`. Valor padrão preserva o
  comportamento de todas as outras cinco entidades sem nenhuma mudança
  nas chamadas existentes. `decidirAcaoCorretiva` passa `false`.
- **`submeterAcaoCorretiva` sempre usa `acaoCorretivaPlanoSchema`** —
  não existe mais uma segunda submissão para a execução (ela nunca passa
  por `EM_APROVACAO`).
- **Nova função `finalizarExecucaoAcaoCorretiva`** — transição própria,
  fora do `cicloVidaService` genérico (não reaproveita `concluir`, que
  exige zero portões). Leva o item de `ABERTO` (`portaoAtual` continua
  `0`, nunca foi incrementado, porque o `decidir` com
  `fecharAoAprovarUltimoPortao: false` só muda `estado`) direto para
  `FECHADO`, exigindo `executadoEm`/`evidencia` preenchidos
  (`acaoCorretivaExecucaoSchema`), sem aprovação — feito pelo próprio
  colaborador.

### `Verificacao` — decisões de modelagem em andamento (código pendente)

Conversa em curso, decisões já tomadas mas **ainda não aplicadas** em
nenhum arquivo (nem schema Prisma, nem código):

1. **`AcaoCorretiva` ganha campo `instrucoesVerificacao: String?`** —
   preenchido no momento do plano (junto com `descricao`/`prazo`),
   descrevendo como o QA deve conduzir a verificação depois.
2. **Ao finalizar a execução, a pessoa informa um número de dias**
   (não uma data) — o sistema calcula `prazo = hoje + esses dias` e
   grava na `Verificacao` recém-criada. `finalizarExecucaoAcaoCorretiva`
   precisa de um parâmetro novo para isso (dias, não `Date` direto como
   estava na primeira tentativa).
3. **`instrucoesVerificacao` é copiado de `AcaoCorretiva` para dentro
   da `Verificacao`** recém-criada, no mesmo momento — nome do campo em
   `Verificacao` ainda a decidir (mesmo nome, ou algo como
   `comoVerificar`).
4. **`Verificacao.evidencia` renomeado para `Verificacao.conclusao`**
   (só em `Verificacao` — `AcaoCorretiva.evidencia` continua com esse
   nome, propósito diferente: evidência de execução vs. conclusão da
   análise do QA).
5. **`Verificacao.eficaz: Boolean?` vira `Verificacao.resultado:
ResultadoVerificacao?`**, um enum novo com três valores: `EFICAZ`,
   `PARCIALMENTE_EFICAZ`, `NAO_EFICAZ` (sem `PENDENTE` — redundante com
   o próprio `estado` do Registro). RN-23 passa a ser "qualquer
   resultado diferente de `EFICAZ` bloqueia o fechamento da NC e exige
   nova Ação Corretiva" — `PARCIALMENTE_EFICAZ` tem a mesma consequência
   prática de `NAO_EFICAZ`, só mais preciso informativamente. Enum
   desacoplado (`compartilhado/entidades/resultado-verificacao.ts`)
   ainda a criar.
6. **Ainda não decidido**: se a `Verificacao` recém-criada nasce com
   algum colaborador/aprovador atribuído automaticamente, ou se isso
   fica como passo manual via `atribuicaoService` depois.

**Próximos passos, na ordem**: ajustar `schema.prisma` (`AcaoCorretiva.
instrucoesVerificacao`, `Verificacao.conclusao`/`resultado` +
`ResultadoVerificacao`), migration, criar o enum desacoplado, reescrever
`finalizarExecucaoAcaoCorretiva` com o parâmetro de dias e a cópia de
`instrucoesVerificacao`, e então gerar `verificacao.schema/repository/
service/controller/routes.ts` do zero (nunca foram criados).

### Entidades `Hipotese` e `AcaoCorretiva` — completas e testadas

- **`AcaoCorretiva` aponta só para `Investigacao`** (`investigacaoId String?`),
  não para `Hipotese` individual — rollback de uma decisão anterior.
  Rastrear "essa ação resolve esse fator contribuinte específico" foi
  considerado controle excessivo; o julgamento de quais fatores
  contribuintes precisam de ação fica com o QA na aprovação (`decidir`
  com `REPROVADO` + motivo), não estruturado no banco.
- **`Hipotese` não tem ciclo de vida próprio** — não é uma entidade
  filha de `Registro` (sem publicar/submeter/decidir/rotas dedicadas).
  É gerida inteiramente dentro do fluxo de `Investigacao`
  (`hipotese.repository.ts` com `criar`/`atualizar`/`listarPorInvestigacao`/
  `excluir`, sem `service` próprio). Campos: `descricao`,
  `numeroIshikawa` (referência simples por número de posição — o
  Ishikawa em si continua livre dentro do `conteudo: Json` da
  investigação, decisão preservada), `classificacao`
  (`CAUSA_DIRETA | FATOR_CONTRIBUINTE | SEM_RELACAO`).
- **`descricao`/`classificacao` de `Hipotese` são nuláveis no banco** —
  hipóteses podem ser criadas incompletas durante o processo, só
  precisam estar completas na hora de submeter a Investigação.
  `submeterInvestigacao` agora também valida cada `Hipotese` existente
  contra `hipoteseFechamentoSchema`, além da checagem de `causaRaiz`
  (RN-24) já existente.
- **`submeterAcaoCorretiva` escolhe o schema de validação pelo
  `portaoAtual`** (`0` → `acaoCorretivaPlanoSchema`, exige `descricao`+
  `prazo`; `1` → `acaoCorretivaExecucaoSchema`, exige também
  `executadoEm`+`evidencia`, RN-25) — primeira vez que uma entidade usa
  os dois portões (`PLANO`, `EXECUCAO`) de verdade; `cicloVidaService`
  não precisou de nenhuma mudança nova além da parametrização de `acao`
  já feita para `Classificacao`.

### Bug real corrigido: `submeter` não validava conteúdo obrigatório

- **`submeterInvestigacao`/`submeterClassificacao` usavam o schema de
  publicação** (campos nullish) em vez de um schema de fechamento
  (campos obrigatórios) — permitindo submeter (e, por consequência,
  aprovar/fechar, já que ambas têm portão único) itens sem
  `causaRaiz`/`causaDireta` (Investigação, violando RN-24) ou sem
  `valor`/`justificativa` (Classificação). Descoberto testando RN-24 na
  prática.
- **`classificacaoFechamentoSchema` recriado** (tinha sido removido por
  parecer redundante com a publicação — mas os dois eram idênticos só
  porque a base nunca exigia nada; o problema estava um nível abaixo).
- **A régua consolidada**: `publicar` usa o schema de publicação
  (permissivo, permite conteúdo incompleto — a entidade "existe como
  evidência ISO" mas pode continuar em edição); `submeter` usa o schema
  de fechamento (exige tudo, porque é o último portão de qualidade antes
  de uma decisão que pode fechar definitivamente). `NC` e `Contencao`
  não tinham esse bug porque seus campos essenciais já eram obrigatórios
  desde a base (só o rascunho os relaxa via `.partial()`) — só
  `Investigacao`/`Classificacao` tinham campos opcionais mesmo na base,
  exigindo o schema de fechamento separado para `submeter`.
- Controller/routes de `submeter` não precisaram de nenhuma mudança — o
  schema de fechamento valida dados **já persistidos** (buscados do
  banco dentro do service), não o corpo da requisição de submeter, que
  não tem corpo.

### Regra geral revisada: edição permitida além de `RASCUNHO`

- **Descoberta ao testar `Investigacao`**: publicar não deveria travar o
  conteúdo — só formaliza que o item existe e ganha código. A edição
  deveria ficar bloqueada apenas a partir de `EM_APROVACAO` (quando o
  item está sob decisão formal — editar por baixo do aprovador seria
  incoerente), não a partir de `ABERTO`.
- Criado `compartilhado/registro/estados-editaveis.ts`, exportando
  `ESTADOS_EDITAVEIS = ["RASCUNHO", "ABERTO"]`. Aplicado nas quatro
  entidades já modeladas (`NaoConformidade`, `Contencao`, `Classificacao`,
  `Investigacao`) — todas seguem a mesma regra, sem exceção; a suspeita
  inicial de que `Classificacao` seria diferente (por ir rápido para
  decisão) não se confirmou — o bloqueio real é sobre `EM_APROVACAO`, não
  sobre "já publicado".
- **Renomeado `salvarRascunho<Entidade>` → `atualizar<Entidade>`** nas
  quatro entidades (service, controller, routes) — o nome antigo ficou
  impreciso, já que a função edita em mais de um estado agora, não só
  rascunho. Feito via rename symbol do editor, para atualizar todas as
  referências de uma vez.

### Entidade `Investigacao` — service completo

- Usa as ações **padrão** (`GERENCIAR_RASCUNHO`, `PUBLICAR`, `SUBMETER`),
  não `CLASSIFICAR` — diferente de `Classificacao`, investigação é
  conduzida pelo colaborador (`EDITOR`), com aprovação do `APROVADOR`
  só no final (portão `UNICA`), não exclusiva de `APROVADOR` do início
  ao fim.
- **Tem `cancelarInvestigacao`**, mas **não tem** `reabrirInvestigacao` —
  mesmo raciocínio de `Contencao`: uma investigação pode ser abandonada
  no meio (ex.: causa direta identificada errada, ou reclassificação da
  NC invalida a linha de investigação em curso), mas nunca reaberta —
  uma nova investigação é criada, mantendo evidente no histórico que a
  anterior foi cancelada e outra tomou seu lugar.
- `Prisma.JsonNull` necessário no repository (`criar`/`atualizar`) para
  o campo `conteudo: Json?` — `null` puro do JavaScript não é aceito
  pelo Prisma nesse tipo de campo (ambiguidade entre "coluna vazia" e
  "valor JSON `null` armazenado"). A conversão precisa vir **depois**
  do espalhamento de `...dados` no objeto `data`, nunca antes — spread
  posterior sobrescreve o anterior.

### Entidade `Investigacao` — modelo simplificado em relação ao documento

- **`conclusao` e `causaRaiz` fundidos num único campo (`causaRaiz`)** —
  documento original tinha os dois separados; decisão de Matthew que a
  conclusão da investigação **é** a causa raiz identificada, sem sentido
  prático em duplicar. RN-24 ("conclusão preenchida e ≥1 causa raiz")
  vira, na prática, uma única checagem: `causaRaiz` preenchida.
- **`CausaRaiz` deixou de ser tabela própria** (o documento previa
  `causas CausaRaiz[]`, pensada para 1:N). Depois de mapear o processo
  real com a analista, ficou claro que cada Investigação tem **uma
  única** causa raiz (1:1) — virou campo de texto simples
  (`causaRaiz: String?`) direto em `Investigacao`, buscável por palavra-
  chave sem precisar de tabela/agregação separada.
- **`realProblema` novo campo**, também dentro de `Investigacao` — cada
  Real Problema identificado a partir da NC gera sua própria
  Investigação (1 real problema = 1 investigação; uma NC pode ter
  várias). Diferente de `NaoConformidade.requisitoViolado` (constatação
  imediata na criação da NC) — `realProblema` é resultado de um processo
  de análise (etapa do A3 SPS), descoberto depois, não declarado de
  cara.
- **Estrutura completa da entidade ainda em desenho** (pendente):
  `Hipotese` (testes de hipótese do A3 SPS, classificados em
  `CAUSA_DIRETA | FATOR_CONTRIBUINTE | SEM_RELACAO`) e a forma como
  `AcaoCorretiva` vai apontar para "o que ela resolve" (a causa raiz de
  uma investigação, ou uma hipótese específica) — decisão de usar duas
  FKs nuláveis (`investigacaoId`/`hipoteseId`, nunca as duas ao mesmo
  tempo, checado no service, não no banco) ainda não implementada.

### Entidade `Investigacao` — decisão de metodologia (produto, não técnica)

- **`MetodoInvestigacao` divergiu do documento original.** O documento
  previa `CINCO_PORQUES|ISHIKAWA|OITO_D` como opções isoladas. Depois de
  conversa com a analista de qualidade, decidido usar **só `A3_SPS`**
  por ora — metodologia composta (baseada na experiência prévia da
  analista na Novo Nordisk) que já **inclui** Ishikawa e 5 Porquês como
  etapas internas do próprio fluxo, dentro do `conteudo: Json` da
  Investigação. `PEOPLE_SUDOKU` foi cogitado e descartado por ora — nem
  Matthew nem a analista têm certeza da estrutura completa dele; revisar
  quando (se) isso for mapeado com confiança.
- **Estrutura esperada do `conteudo` (Json) para `A3_SPS`** — documentada
  aqui porque o banco não valida isso (é JSON livre), mas o frontend vai
  precisar seguir essa sequência ao montar o formulário:
  `PERCEPÇÃO INICIAL → DESCRIÇÃO → REAL PROBLEMA → ISHIKAWA → CAUSA
DIRETA → 5 PORQUÊS → CAUSA RAIZ → CONTRAMEDIDAS → CHECK DE
EFETIVIDADE`. A "causa raiz" identificada ao final do processo é a
  mesma que deve ser **extraída** e registrada como uma linha real em
  `CausaRaiz` (RN-24 exige ≥1) — o campo dentro do JSON é rascunho do
  processo, a linha em `CausaRaiz` é o dado consultável ("quais causas
  mais se repetem?").

### Modelagem / Schema

- **`Registro`**: sem `atualizadoPorId`/`atualizadoPor` — quem atualizou por
  último se consulta via `Auditoria` (já indexada por `entidade` +
  `entidadeId` + `registradoEm`), não se armazena como campo redundante.
- **`NaoConformidade`**: sem `responsaveisId`/`qaId` (resolvidos via
  `Atribuicao` genérica), sem `analiseCausa` (pertence a `Investigacao`),
  sem `reportadoPorId` (não é exigência textual da ISO 10.2 — decisão de
  escopo, o custo de cadastro pelo Admin não compensava o ganho).
- **`NaoConformidade`**: mantém `processoAfetado` **e** `requisitoViolado`
  como campos distintos (o primeiro sobre localização operacional, o
  segundo sobre qual requisito/procedimento foi violado).
- **`Usuario.id`**: migrado de `Int` para `String` (`uuid(7)`) — propagado
  por toda FK de usuário no sistema.
- **`ConviteSenha` renomeado para `TokenAcesso`**, com campo `tipo`
  (`CONVITE` | `RECUPERACAO_SENHA`), preparando o fluxo futuro de "esqueci
  minha senha" sem precisar de uma segunda tabela.
- **`Reabertura`**: modelo que o documento original não detalhava — criado
  seguindo o padrão de `Aprovacao` (evento + motivo + autor + timestamp).
  Campos: `id`, `registroId`, `motivo`, `reabertoPorId`, `reabertoEm`.
- **`Cancelamento`**: mesma situação de `Reabertura` — nunca especificado
  no documento original, apesar de RN-06 exigir motivo de cancelamento.
  Mesmo padrão: `id`, `registroId`, `motivo`, `canceladoPorId`,
  `canceladoEm`.
- **RN-13 ajustada para `NaoConformidade`**: a exigência de aprovador
  definido não é mais checada em `publicar`, e sim em `submeter` — permite
  que a NC nasça (vire oficial, ganhe código) antes de um QA ser designado,
  refletindo o processo real onde a triagem de responsável acontece depois
  da criação.

### Permissões

- **RN-18 desmembrada**: `ALTERAR_ATRIBUICOES` virou duas ações —
  `ADICIONAR_COLABORADOR` (qualquer `EDITOR`/`GERENTE`, sem exigir
  atribuição prévia) e `DEFINIR_APROVADOR` (só `APROVADOR`/`GERENTE`).
  Motivo: colaboradores precisam de liberdade para se auto-organizar; QA
  precisa de controle mais rígido sobre quem aprova.
- **`Verificacao`**: `concluir` exige colaborador atribuído com papel
  `APROVADOR` (não `EDITOR`) — regra específica do service, análoga à
  RN-20 (Classificação). O Effectiveness Check do ETQ Reliance exigia QA.
  Ainda precisa reintroduzir o campo `prazo DateTime`, que existia no
  schema antigo e foi perdido na consolidação do documento.
- **`pode-executar.ts` desmembrado**: `temPapel` (só camada 1 — papel) foi
  extraída como função própria, separada de `podeExecutar` (as três
  camadas). Motivo: ações como `DEFINIR_APROVADOR` não podem exigir
  atribuição prévia — seria uma trava impossível (a pessoa nunca "já é"
  aprovadora antes de se tornar aprovadora pela primeira vez).
- **`cancelar`**: checagem de permissão é "ser `GERENTE` OU ser o
  aprovador do item" — não usa `podeExecutar` genérico nem `temPapel`
  sozinha, é uma combinação manual (`ehGerente || ehAprovadorDoItem`).
- **`decidir`**: não usa `podeExecutar` genérico — usa checagem estrita
  (`temPapel(ator, "APROVAR")` + `ehAprovador` especificamente, não
  `ehColaborador`), porque RN-16 exige ser _o_ aprovador designado, não
  qualquer colaborador com papel `APROVADOR`.

### Catálogos e enums

- **`entidades-auditadas.ts` reescrito**: renomeado de `Entidades` para
  `EntidadeAuditada`, derivado de `TipoRegistro` via spread
  (`...TipoRegistro`) mais `USUARIO`/`TOKEN_ACESSO`, garantindo que nunca
  diverge dos seis tipos de registro. Removidas entidades obsoletas do
  model antigo (`ANEXO`, `SETOR`, `APROVACAO`, `COMENTARIO` como estavam
  desenhadas antes).
- **Catálogo de ações de permissão (`Acao`)**: desmembrado em granularidade
  maior que o documento original sugeria — `GERENCIAR_RASCUNHO` (criar +
  excluir rascunho, fusão segura) mantido separado de `PUBLICAR` e
  `SUBMETER` (decisão consciente de manter nomes específicos, mesmo com
  regra de papel idêntica hoje, para facilitar divergência futura sem
  reescrever chamadas espalhadas).
- **`Decisao` desacoplado**: criado em `compartilhado/entidades/decisao.ts`
  (só existia como enum do Prisma antes) — usado em `decidir.schema.ts` e
  em `ciclo-vida.service.decidir`.

### Entidade `Contencao` — completa e testada

- Implementada do zero (era só schema comentado + repository apagado):
  `model Contencao` com chave compartilhada dupla (com `Registro`, via
  `onDelete: Cascade`, e com `NaoConformidade`, também `Cascade`, por
  segurança defensiva mesmo não sendo exercitada no fluxo atual).
- **`Disposicao` generalizada** (decisão de produto): em vez do
  vocabulário tradicional de chão de fábrica (retrabalho, refugo,
  segregação — específico de peça física), o enum usa termos abstratos
  que servem qualquer área que gere não conformidades (Operação, RH,
  Desenvolvimento, Qualidade): `ACEITO`, `CORRIGIDO`, `ANULADO`,
  `EM_ANALISE`. Decisão registrada porque não é óbvia relendo o código —
  alguém revisando pode estranhar a ausência de "refugo"/"retrabalho".
- `executadaEm` e `disposicao` ficam juntos desde `contencaoBaseSchema`
  (opcionais/nullish) — decisão de processo real: no fluxo da empresa,
  quem executa a contenção já sabe, no mesmo momento, qual foi o destino
  da peça/situação. Diferente de `riscosRevisados`/`mudancasSGQ` em NC,
  que só fazem sentido depois de tudo mais decidido.
- `contencao.service.ts` reescrito com 9 funções (sem `reabrir` —
  decisão: contenções que não funcionam geram uma **nova** tentativa,
  não uma reabertura da antiga, já que a relação com a NC é 1:N).
- `contencaoRepository.listarContencoes` aceita filtros opcionais
  (`naoConformidadeId`, `estado`) — modelo a ser replicado quando
  `listarNC` for revisitada com os filtros do contrato de API original.
- Testado via API real de ponta a ponta, incluindo seis modos de falha
  específicos (disposição inválida, NC inexistente, filtro vazio,
  segunda contenção pra mesma NC, filtro de estado inválido, e a
  checagem de atribuição específica — alguém com papel certo mas sem
  ser colaborador daquela contenção específica).
- ~~**Lacuna identificada, ainda não resolvida**: `contencaoFechamentoSchema`
  existe mas nenhuma função do `service` o utiliza~~ — **RESOLVIDO.**
  `submeterContencao` agora usa `contencaoFechamentoSchema` como validador.
  Ver seção "Filtros de listagem de NC, tipo `Ator`..." no topo do
  documento.

### Entidade `Classificacao` — completa e testada

- **Descoberta de arquitetura**: `cicloVidaService.publicar`/`submeter`/
  `excluirRascunho` tinham a ação de permissão fixa internamente
  (`"PUBLICAR"`, `"SUBMETER"`, `"GERENCIAR_RASCUNHO"`) — impossível para
  `Classificacao` exigir `"CLASSIFICAR"` (RN-20: só `APROVADOR`/`GERENTE`
  cria/edita/publica/submete/exclui, nunca `EDITOR` puro). Corrigido
  adicionando parâmetro opcional `acao: Acao` com valor padrão igual à
  ação original em cada função — zero impacto nas chamadas existentes
  (NC, Contenção), `Classificacao` passa `"CLASSIFICAR"` explicitamente.
  Aproveitado para corrigir `antes: dadoValidado` → `antes: registro` em
  `publicar` (bug: registrava o resultado da validação, não o estado
  real anterior do Registro).
- Sem `cancelarClassificacao` nem `reabrirClassificacao` — mesmo raciocínio
  de `Contencao`: ciclo de vida é curto, excluir rascunho já cobre
  "desistir cedo", reclassificar sempre gera uma nova instância (1:N com
  a NC), nunca uma reabertura da anterior.
- Criador sempre vira `COLABORADOR` (nunca `APROVADOR` automaticamente),
  mesmo precisando ter papel `APROVADOR` para criar — preserva a
  possibilidade de designar formalmente outra pessoa como aprovadora via
  `atribuicaoService.definirAprovador`, em vez de travar nisso implicitamente.
- Testado de ponta a ponta (13 casos), incluindo a checagem estrita de
  `decidir` (papel certo mas não é o aprovador designado → 403) e RN-20
  em três pontos (criar, publicar, excluir — todos bloqueiam EDITOR).

- `model Classificacao`: chave compartilhada dupla (`Registro` +
  `NaoConformidade`, ambas `onDelete: Cascade`), mesmo padrão de
  `Contencao`. `ClassificacaoNC` desacoplado criado (só existia no Prisma).
- `classificacao.schema.ts`: sem schema de fechamento — nenhum campo só
  faz sentido "depois de tudo decidido" nesta entidade.

- **`nc.schema.ts`**: campo `cliente` estava `.optional()`, mas dados vindos
  do Prisma trazem `null` (não `undefined`) para colunas nuláveis não
  preenchidas — o Zod rejeitava. Corrigido para `.nullish()` (aceita
  `undefined` **e** `null`). Regra geral: todo campo opcional que é
  validado contra dados vindos do banco precisa de `.nullish()`, não só
  `.optional()`.
- **`schema.prisma`**: `Atribuicao.registro` não tinha `onDelete: Cascade`,
  diferente de `NaoConformidade.registro`. Isso impedia excluir um
  `Registro` em `RASCUNHO` sempre que ele já tivesse pelo menos uma
  `Atribuicao` (o que é sempre o caso, por RN-14 — o criador já é
  colaborador desde a criação). Corrigido adicionando o cascade.
- **`atribuicaoService.adicionarColaboradores`/`removerColaboradores`**:
  o mesmo `usuarioId` repetido dentro do array recebido na mesma
  requisição causava erro `500` (`P2002`, violação de chave primária) —
  o filtro B2 (checagem contra `ehColaborador`) só olhava o estado do
  banco, nunca duplicatas dentro do próprio array de entrada. Corrigido
  com `[...new Set(colaboradoresId)]`, eliminando duplicatas antes do
  filtro, nas duas funções.

### Módulo `atribuicao/` — completo e testado

- Implementado do zero: `atribuicaoRepository` (7 funções — `ehColaborador`,
  `ehAprovador`, `existeAprovador`, `contarColaboradores`, `buscarAprovador`,
  `inserirAtribuicao`/`removerAtribuicao`, genéricas por `FuncaoAtribuicao`),
  `atribuicaoService` (`adicionarColaboradores`, `removerColaboradores`,
  `definirAprovador`), `atribuicaoController`, `atribuicaoRoutes`.
- `GERENCIAR_COLABORADORES` (renomeado de `ADICIONAR_COLABORADOR`) cobre
  tanto adicionar quanto remover colaboradores — mesma regra de papel
  (`EDITOR`/`GERENTE`), sem checagem de atribuição prévia.
- `removerColaboradores` valida RN-12 (não deixar o registro sem nenhum
  colaborador) contando o total atual e comparando com quantos serão de
  fato removidos (após dedupe e após filtrar quem já não era colaborador).
- `definirAprovador` valida que o **alvo** (não o ator) tem papel
  `APROVADOR` antes de atribuí-lo; segue o padrão "hard delete do vigente
  - insert" para respeitar o índice único parcial.
- Ambas as operações de lote (`adicionarColaboradores`/`removerColaboradores`)
  usam filtro "B2": separam quem já satisfaz a condição (já é/não é
  colaborador) do que precisa de fato ser processado, devolvendo os dois
  grupos na resposta (`adicionados`/`jaEramColaboradores`,
  `removidos`/`naoEramColaboradores`) — em vez de falhar ou ignorar
  silenciosamente.
- Testado via API real de ponta a ponta (10 categorias de modo de falha,
  incluindo estado, regras de negócio, atribuição específica, validação,
  auto-aprovação, id inexistente, JWT adulterado/expirado, e os cenários
  específicos deste módulo) — eliminou de vez a necessidade de inserir
  `Atribuicao` manualmente via SQL nos testes.

### Infraestrutura

- **`fastify-type-provider-zod`** adotado para validação de rota, em vez de
  `.parse()` manual dentro dos controllers. Controllers agora usam
  `FastifyRequest<{ Body: ..., Params: ... }>` tipado, sem validação
  redundante.
- **`app.ts`/`server.ts`** divididos conforme §10.5 do documento original —
  `app.ts` monta a instância (Fastify, JWT, Zod, error handler, rotas),
  `server.ts` só chama `.listen()`.
- **`setErrorHandler`** trata três casos: `ZodError` (validação manual
  dentro de services, via `.parse()` explícito), erros do tipo
  `FST_ERR_VALIDATION` (validação de rota pelo Fastify/type-provider,
  identificados por `instanceof Error && "code" in erro`, já que
  `FastifyError` não é uma classe real exportável para `instanceof`), e
  `AppError` (erros de domínio).

---

## Pendências em aberto

> **A partir de 2026-09-24, a lista viva de trabalho é
> `docs/plano-implementacao.md`** (com a fase de cada item na tabela de
> rastreabilidade, §8). A lista abaixo fica como histórico; as
> pendências ainda abertas nela já estão no plano.

1. **Catálogo de ações de auditoria** (`acoes-auditadas.ts`) — ainda usa
   strings soltas no campo `acao` de cada chamada a `auditoriaRepository.
registrar`. Lista já em uso: `CRIAR_RASCUNHO`, `PUBLICAR`,
   `EXCLUIR_RASCUNHO`, `SUBMETER`, `APROVADO`/`REPROVADO`, `REABRIR`,
   `CANCELAR`, `DEFINIR_SENHA`, `CRIAR_USUARIO`, `ADICIONAR_COLABORADORES`,
   `REMOVER_COLABORADOR`, `DEFINIR_APROVADOR`, `FINALIZAR_EXECUCAO`,
   `GERAR_VERIFICACAO`, `CONCLUIR_VERIFICACAO`. Quando reescrito como enum
   tipado, revisar todas as funções já escritas para trocar strings soltas
   pelo tipo.

2. ~~**`ADICIONAR_COLABORADOR`** sem checagem de atribuição prévia~~ —
   **RESOLVIDO.** Virou `GERENCIAR_COLABORADORES` no módulo `atribuicao/`,
   sem checagem de atribuição prévia; mantido de propósito na revisão do
   PRD (`docs/prd.md`, Q9 / RN-18).

3. ~~**`criarRascunhoNC`** atribui só o criador como colaborador~~ —
   **RESOLVIDO em parte.** A rota `POST /registros/:id/colaboradores` já
   existe. O PRD (Q10 / RF-01) decidiu que a criação da NC aceita
   colaboradores no mesmo passo — implementação pendente.

4. **`fazerLogin`** deveria auditar tentativas de login, inclusive falhas
   (útil para detectar força bruta) — isso muda a natureza da função (hoje
   só leitura, via `prisma` direto, sem transação) e precisa ser desenhado
   com cuidado antes de implementar.

5. ~~**`ignoreTrailingSlash`** em `app.ts` usa a forma deprecada~~ —
   **RESOLVIDO na fase A0**: migrado para
   `Fastify({ routerOptions: { ignoreTrailingSlash: true } })`.

6. ~~**`contencao/`** em estado intermediário~~ — **RESOLVIDO.** Módulo
   completo (schema, repository, service, controller, routes), testado
   via API de ponta a ponta. Ver seção "Entidade `Contencao`" acima.

7. ~~**`submeterNCParaFechamento`** (a guarda de fechamento) ainda
   bloqueada~~ — **implementada** em `submeterNC`, mas a regra foi revista
   no PRD (`docs/prd.md`, Q1 / RN-21): passa a exigir também todos os
   planos de Ação Corretiva aprovados. Junto, a reação a `NAO_EFICAZ` deve
   reabrir só o que estiver fechado (Q2 — hoje dá erro se a NC estiver
   aberta) e `PARCIALMENTE_EFICAZ` deve copiar todos os colaboradores (Q3).
   **Implementado na A3**, já com a regra revista na Q17: os planos são
   conferidos pela Investigação (RN-24), e a NC exige toda investigação
   fechada (RN-21).

8. ~~**Listagem de NCs (`listarNC`)** — hoje sem filtros nem paginação~~ —
   **RESOLVIDO.** `GET /nc` aceita `estado`, `origem`, `classificacao`,
   `de`/`ate`, `minhas` e `cursor`/`limit`. Ver seção "Filtros de listagem
   de NC, tipo `Ator`..." no topo do documento.

9. **Módulo Feed** (comentários, respostas, menções `@`/`#`) — não
   iniciado. Depende do módulo `nc/` estar mais maduro.

10. **Documentação OpenAPI** — não iniciada. `fastify-type-provider-zod`
    já está em uso, o que facilita gerar isso a partir dos schemas
    existentes quando chegarmos nessa etapa.

11. **Arquivos de teste manual** (`requests.http`, `requests-modos-falha.http`,
    `requests-contencao.http`, `setup-usuarios-teste.sql`) reorganizados
    da raiz do projeto para a pasta `testes/`.

12. ~~**Reorganizar `modulos/nc/` em subpastas por entidade**~~ —
    **RESOLVIDO.** `nc/nc/`, `nc/contencao/`, `nc/classificacao/`,
    `nc/investigacao/`, `nc/acao-corretiva/`, `nc/verificacao/`.

13. ~~**Criar tipo `Ator`**~~ — **RESOLVIDO.**
    `compartilhado/entidades/ator.ts`, 65 ocorrências substituídas em 10
    arquivos. Ver seção "Filtros de listagem de NC, tipo `Ator`..." no
    topo do documento.

14. **Gerenciamento de usuários** — o módulo `usuario` só tem `POST
    /usuarios` (criar). Faltam: listagem/busca (nem por email), revogar
    um papel específico (`usuarioPapelRepository` só tem `concederPapel`,
    sem `revogarPapel`, sem campo `revogadoEm` em `UsuarioPapel`), e
    inativar um usuário (`Usuario` sem campo `ativo`/`desativadoEm` —
    `authService.fazerLogin` não tem o que checar). Descoberta desta
    sessão, sem decisão de design ainda sobre como deveria funcionar
    (revogar papel × inativar usuário × os dois, e o que acontece com
    atribuições/registros que a pessoa já tinha).