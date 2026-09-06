# O que você aprendeu construindo o QualityHub

> Documento de revisão. Cada seção lista o que foi aprendido na prática e sugere por onde aprofundar. Gerado por IA.

---

## 1. Descoberta e definição de produto

### O que você aprendeu

- **Separar sintoma de causa raiz.** A empresa não tinha um problema de "falta de ferramenta de NC" — tinha um problema de processo que a planilha perpetuava. Construir software sobre o diagnóstico errado produz software que ninguém usa.
- **Escopo inflado mata projeto.** Sua lista inicial tinha 13 módulos, cada um do tamanho de um produto inteiro. A decisão de construir **um módulo completo** em vez de treze pela metade é o que torna o projeto viável e valioso como portfólio.
- **Ler o processo real antes de modelar.** As planilhas da analista revelaram coisas que nenhuma especificação diria: o campo "Consequências Imediatas" era usado com três significados diferentes; o `Grau de atenção` era calculado; a coluna `Data` era ambígua.
- **Campo que não muda decisão nenhuma não deveria existir.** Frequência e severidade serviriam para priorizar uma fila que não existe. Foram cortados em favor de Minor/Major, que decide se há investigação.
- **Distinguir estado de história.** `REABERTA` parecia um estado, mas era um evento. Estado é onde a coisa está agora; história é como ela chegou lá.

### Para aprofundar

- _Inspired_ (Marty Cagan) — descoberta de produto
- _The Mom Test_ (Rob Fitzpatrick) — como entrevistar usuários sem induzir respostas
- ISO 9001, cláusula 10.2 — a norma que fundamenta o módulo

---

## 2. Modelagem de dados

### O que você aprendeu

- **Entidade, atributo, relacionamento.** O vocabulário básico, e por que "uma linha com trinta colunas" quebra quando aparece o segundo item de qualquer coisa.
- **Cardinalidade.** 1:1, 1:N e N:N — e a regra que decorre: **a chave estrangeira mora sempre do lado "muitos"**. Se você se pegar criando `campo_1`, `campo_2`, `campo_3`, ali existe um 1:N pedindo pra virar tabela.
- **Chave primária e estrangeira**, e a **integridade referencial** que o banco garante — algo que planilha nenhuma faz.
- **Enum versus tabela de referência.** Lista fechada e estável → enum. Lista que o usuário gerencia → tabela. E o custo do enum: adicionar valor exige migration.
- **Campo derivado não se armazena.** `Grau de atenção` e `TMF` eram calculados. Mas com uma exceção consciente: `reaberturas` é armazenado porque varrer a trilha de auditoria a cada listagem seria caro. Isso se chama **desnormalização**, e é um trade-off, não um erro.
- **Fonte única de verdade.** Você quis `foiReaberta` além de `reaberturas`; o segundo é derivável do primeiro com `> 0`, e dois dados sobre a mesma verdade podem divergir por bug.
- **Polimorfismo relacional.** A trilha de auditoria usa `entidade` + `entidadeId` sem FK, para servir toda a plataforma. O mesmo padrão foi **rejeitado** para anexos, onde a integridade importa mais que a flexibilidade. A mesma técnica pode ser certa num contexto e errada em outro.
- **Migrations.** Mudanças versionadas e incrementais no banco, reproduzíveis em qualquer máquina. E a armadilha: **renomear não existe** — o Prisma remove e cria, o que apaga dados.

### Para aprofundar

- Normalização (1FN, 2FN, 3FN) — quando aplicar e quando desnormalizar de propósito
- Índices: o que são, quando criar, e o custo de escrita que eles impõem
- _Database Design for Mere Mortals_ (Michael Hernandez)
- Documentação do PostgreSQL sobre tipos e constraints

---

## 3. Ambiente e ferramental

### O que você aprendeu

- **WSL e a fronteira entre sistemas.** Por que o projeto vive em `~/projects` e nunca em `/mnt/c/`, e como o PATH do Windows vaza para dentro do Linux (aquele `npm error ENOENT` com caminho `C:\Users\...`).
- **Docker e volumes.** Container é descartável; o volume é o que preserva os dados. `docker compose down` preserva, `down -v` apaga.
- **Gerenciamento de versão do Node com nvm**, e por que `apt install nodejs` seria pior.
- **O método de verificar dependências antes de instalar** — talvez o hábito mais valioso que você criou:
  ```bash
  npm view <pacote> dist-tags
  ```
  Foi assim que você descobriu que o Prisma publica um _release candidate_ na tag `latest`. Sem isso, teria começado o projeto em RC.
- **Ler a documentação com desconfiança.** Quando ela não estava clara sobre o `declare module`, o problema era ela, não você.

### Para aprofundar

- Comandos de terminal Linux além do básico: `grep`, `find`, `sed`, pipes
- Docker além do compose: imagens, camadas, multi-stage builds (vai importar no deploy)
- Semantic Versioning (semver) — o que `^`, `~` e as tags realmente significam

---

## 4. Git e versionamento

### O que você aprendeu

- **Staging area.** Por que existe uma etapa entre modificar e commitar, e como ela permite montar commits coerentes.
- **Os quatro estados de um arquivo:** ignorado, não rastreado, modificado, preparado.
- **Branch é um ponteiro**, não uma cópia. Por isso criar branch é instantâneo.
- **`.gitignore` e o critério:** versione o que é fonte, ignore o que é derivado, **sempre** ignore o que é segredo. E a regra dura: commit de segredo é irreversível — a única resposta correta é trocar o segredo.
- **Conventional Commits** (`feat:`, `fix:`, `docs:`, `chore:`) — e por que o histórico faz parte do portfólio.
- **O Git é distribuído.** Quando o push falhou por rede, nada foi perdido: o commit já estava seguro localmente.
- **`.env.example`** — como documentar quais variáveis existem sem expor valores.

### Para aprofundar

- Branches e merge: `git merge` vs `git rebase`
- Resolver conflitos
- `git stash`, `git bisect`, `git reflog` (esse último já salvou muita gente)
- Pull requests e code review — mesmo trabalhando sozinho, o fluxo vale

---

## 5. TypeScript

### O que você aprendeu

- **Modo estrito.** `strict` e `noUncheckedIndexedAccess` obrigam a tratar valores que podem ser nulos. Você viu isso pegar um bug real: o `bcrypt.compare` não aceitava `senhaHash` porque faltava a verificação de "usuário sem senha definida".
- **Narrowing.** Depois de `if (!usuario) throw ...`, o compilador sabe que `usuario` não é nulo. Ele acompanha o fluxo do código.
- **Tipos primitivos em minúsculo:** `string`, não `String`.
- **`import type`** — o que some na compilação e por que `@types/*` vai em `devDependencies`.
- **Caminho relativo com `.js`** em ESM, mesmo o arquivo sendo `.ts`. E a diferença entre `/src` (absoluto) e `./src` (relativo).
- **Declaration merging** (`declare module`) — como estender tipos de bibliotecas que você não controla.
- **`as` é uma promessa vazia.** Asserção de tipo não verifica nada; validação real precisa acontecer em tempo de execução.
- **Ler erro de compilador.** Erros longos têm uma linha que resolve tudo — geralmente algo como "Property X is missing". O resto é contexto.

### Para aprofundar

- Generics — você já usou sem perceber (`z.infer<typeof schema>`)
- Utility types: `Partial`, `Omit`, `Pick`, `Record`
- Type guards personalizados
- _Total TypeScript_ (Matt Pocock) — material gratuito e bem estruturado

---

## 6. JavaScript e assincronia

### O que você aprendeu

- **`async`/`await`.** Quando é necessário e quando é ruído. A regra: `async` só quando há `await` dentro; e se o valor passa por uma variável, precisa de `await`.
- **Floating promise.** Esquecer o `await` faz a função retornar antes da operação terminar — e o erro some silenciosamente.
- **Promessa é sempre "verdadeira".** Se você esquecer o `await` numa verificação booleana, o `if` nunca barra ninguém. É um bug de segurança silencioso.
- **`===` em vez de `==`**, por causa da conversão automática de tipos.
- **Desestruturação com rest** (`const { setorId, ...resto } = dados`) — para extrair e para excluir campos.
- **Módulos ESM:** nada é exportado por padrão; `export` é explícito. E exponha o mínimo necessário.
- **Template literals** e a diferença entre `${}` e `$[]`.

### Para aprofundar

- Event loop — por que o JavaScript é single-threaded e ainda assim assíncrono
- `Promise.all`, `Promise.allSettled` — quando paralelizar
- Tratamento de erro em código assíncrono
- Closures (você usou uma no `autorizar(perfis)`, que devolve outra função)

---

## 7. Arquitetura de API

### O que você aprendeu

- **HTTP na prática:** métodos, caminhos, query strings, corpo, e a distinção 4xx (culpa do cliente) vs 5xx (culpa do servidor).
- **Arquitetura em camadas:**

  | Camada     | Responsabilidade                | Não faz           |
  | ---------- | ------------------------------- | ----------------- |
  | Rotas      | declara os endpoints            | nada além disso   |
  | Controller | traduz HTTP ↔ chamada de função | regra de negócio  |
  | Service    | o processo, as regras           | não conhece HTTP  |
  | Repository | fala com o banco                | não conhece regra |

- **O teste que separa as camadas:** é sobre status HTTP → controller; é sobre uma tabela → repository; é sobre o processo → service.
- **Por que o service não pode conhecer HTTP.** Se ele recebesse `request`, não poderia ser chamado de um script, de um job, ou de um teste.
- **Organizar por módulo, não por tipo de arquivo.** Mantém junto o que muda junto.
- **Validação na fronteira.** O schema valida o que chega; depois disso, confie no tipo. E nunca confie em validação feita no cliente.
- **Hierarquia de erros.** `AppError` como base permite distinguir "erro que eu previ" de "bug", e traduzir cada um no status certo.
- **Tratamento de erro centralizado**, com a ordem importando: do mais específico ao mais genérico.
- **Middleware** e o ciclo de vida da requisição (`onRequest` antes de `preHandler`).
- **Transações e ACID** — atomicidade, consistência, isolamento, durabilidade.

### Para aprofundar

- REST: os níveis de maturidade de Richardson, HATEOAS
- OpenAPI/Swagger — documentação gerada da API
- Idempotência: por que `PUT` deveria ser idempotente e `POST` não
- Paginação, filtros e ordenação em APIs de listagem
- _Clean Architecture_ (Robert Martin) — leia com senso crítico; nem tudo se aplica a projetos pequenos

---

## 8. Segurança

### O que você aprendeu

- **Nunca armazenar senha, só o hash.** E por que o bcrypt é deliberadamente lento — cada incremento no fator de custo dobra o tempo.
- **Salt.** Hashes da mesma senha são diferentes entre si, por isso a verificação usa `compare` em vez de igualdade.
- **Enumeração de usuários.** Mensagens de erro diferentes para "email não existe" e "senha errada" permitem descobrir quem está cadastrado. O status code também vaza — por isso 400 nos dois casos, não 401.
- **JWT:** o payload é apenas codificado, não criptografado — qualquer um lê. A assinatura é o que impede forjar. E o custo do modelo sem estado: não dá pra revogar antes de expirar.
- **Expiração é obrigatória.** Token sem `exp` vale para sempre.
- **Autenticação ≠ autorização.** Quem você é, versus o que você pode.
- **Princípio do menor privilégio.** Perfil nunca deveria vir com padrão elevado.
- **Segregação de funções.** Quem executa não deveria aprovar. E quando não é possível separar, o **controle compensatório**: detectar, exigir justificativa e sinalizar.
- **Pré-cadastro.** Ninguém escolhe o próprio perfil, e o admin nunca conhece a senha de outra pessoa (não-repúdio).
- **Typosquatting.** Você encontrou `nvnm-sh` imitando `nvm-sh`, e depois uma extensão maliciosa imitando a do Prisma.
- **Scripts de instalação** como vetor de ataque, e por que o npm passou a exigir aprovação.

### Para aprofundar

- OWASP Top 10 — a lista de referência das vulnerabilidades mais comuns
- SQL injection (o Prisma protege, mas entenda o mecanismo)
- CORS, CSRF, XSS — vão importar quando o frontend existir
- Rate limiting (pendência do seu projeto)
- OAuth 2.0 e OpenID Connect — para quando fizer sentido delegar autenticação

---

## 9. Julgamento de engenharia

Esta é a categoria mais difícil de ensinar e a mais valiosa.

### O que você aprendeu

- **Adie decisões que a estrutura de dados não trava.** Paralelismo de etapas, perfil por módulo, RBAC — todos foram adiados porque a modelagem não impede a migração futura.
- **Estrutura é resposta a um problema, não profilaxia.** E o oposto também é armadilha: abstração prematura custa mais que a espera.
- **Encapsulamento como seguro contra mudança.** As permissões concentradas em `lib/permissoes.ts` significam que migrar de perfil-global para perfil-por-módulo é reescrever um arquivo, não caçar `if` por todo o sistema.
- **Avaliar vulnerabilidade por contexto.** Aquelas quatro do Prisma são `devDependency`, transitivas e inalcançáveis no seu uso. A "correção" proposta era regredir uma versão principal. Você leu, entendeu e **aceitou conscientemente** — que é diferente de ignorar.
- **Distinguir ruído de sinal.** O aviso do systemd, os avisos de depreciação, o erro do `npm` durante a instalação do nvm. Perseguir aviso inofensivo consome tempo que renderia mais no projeto.
- **Quando as correções empilham, a premissa estava errada.** Aconteceu com o `rootDir` — a saída foi recuar e simplificar, não continuar remendando.
- **Documentação envelhece.** O documento inicial do Gemini recomendava Prisma 6 quando o 8 já existia. Por isso seu `SETUP.md` aponta para o README oficial do nvm em vez de fixar o comando.
- **Verificar em vez de confiar.** Você me pegou errando versão quatro vezes. Esse reflexo é o que evita construir sobre base falsa.

---

## 10. Comunicação técnica

### O que você aprendeu

- **README como vitrine.** O que é, que problema resolve, como rodar, e as decisões interessantes.
- **Documentar armadilhas vale mais que documentar comandos.** Comando se acha no Google; saber que um erro específico é inofensivo, não.
- **Diagramas em Mermaid** — versionados como texto, renderizados pelo GitHub, com diff legível.
- **O diagrama expõe inconsistência.** Você não conseguiu desenhar o ciclo de vida porque os estados não representavam o processo. O desenho fez o trabalho de revisão.
- **Comentário diz o porquê, não o quê.** E nome bom substitui comentário.

---

## Sugestão de plano de revisão

Se você quiser consolidar, uma ordem que faz sentido:

1. **Assincronia em JavaScript** — é a base de tudo que você escreve, e ainda causa erro
2. **TypeScript além do básico** — generics e utility types vão aparecer no frontend
3. **SQL puro** — entender o que o Prisma gera te torna capaz de diagnosticar lentidão
4. **OWASP Top 10** — você já aplicou várias defesas; conhecer o mapa completo ajuda
5. **Testes** — é a Fase 6 do seu roadmap, e muda como você escreve código

E o mais importante: **você aprendeu construindo.** Nenhum dos itens acima veio de exercício sintético — todos apareceram porque o projeto exigiu.
