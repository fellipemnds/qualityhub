# QualityHub

## O que é QualityHub:

QualityHub é uma plataforma de gestão de qualidade com base nos requisitos da ISO 9001.

---

## O problema:

Este é um projeto pessoal que surgiu após perceber alguns pontos de falha na minha empresa atual que recentemente foi certificada na ISO 9001, onde a gestão da qualidade é realizada através de planilhas e e-mail, com a gestão de uma única analista e sem rastreabilidade e controle de nenhuma das ações.

Apesar disso, este projeto surgiu como um desejo pessoal de aprender novas tecnologias e expandir meus conhecimentos em desenvolvimento full-stack.

---

## Escopo:

### Módulo de Não Conformidades:

Este módulo de Não-Conformidades foi criado com base no processo rodado na minha empresa e também teve inspiração do ETQ Reliance, software de gestão de qualidade que eu usava na minha empresa anterior.

Este módulo é capaz de controlar todo o fluxo do processo de Não-Conformidades, desde a sua abertura, contenções, investigações, ações corretivas, verificação de efetividade e fechamento. Além do processo, este módulo também possui as seguintes funcionalidades:

- _Gates_ de aprovação para as etapas do processo — o sistema garante a aprovação do QA nas etapas-chave (classificação, contenção, investigação, plano de ação e fechamento da NC)
- Guardas de fechamento — a NC só fecha com classificação e investigações aprovadas e nenhuma contenção pendente; a investigação só é enviada com os planos de ação aprovados
- Autoaprovação permitida, mas registrada — quando quem aprova é quem criou o item, o sistema grava isso na decisão, para a auditoria enxergar o caso
- Papéis que se somam (`EDITOR`, `APROVADOR`, `GERENTE`, `VISUALIZADOR`, `ADMIN`) e atribuição por item (colaboradores e um aprovador)
- Trilha de Auditoria — todo evento relevante é registrado com autor, data e valores antes/depois
- _Planejado:_ Activity Feed (eventos e comentários com menções numa linha do tempo única), anexos, "Minhas pendências" e relatórios do gestor

Os requisitos completos estão em [`docs/prd.md`](docs/prd.md).

### Roadmap:

O projeto possui a arquitetura preparada para receber outros módulos. Como objetivo, tenho interesse em desenvolver os seguintes módulos:

- Módulo de Documentações
- Gestão de Alterações
- Plataforma de Treinamentos
- Plataforma de Solicitações
- Gestão de Comunicações
- Gestão de Estoque
- Área do Colaborador
- Gestão de Vagas de Emprego
- Gestão de Pontos e Férias

---

## Stack

- **Runtime:** Node.js 24 (via nvm)
- **Linguagem:** TypeScript 7
- **Framework HTTP:** Fastify 5, com `fastify-type-provider-zod`
- **Validação:** Zod 4
- **ORM:** Prisma 7, com `@prisma/adapter-pg`
- **Banco:** PostgreSQL 17 (Docker Compose em desenvolvimento)
- **Autenticação:** JWT (`@fastify/jwt`) e bcrypt; a sessão em cookie `HttpOnly` está planejada para a fase A4
- **Testes:** Vitest + `app.inject()` + Testcontainers (um Postgres descartável por execução)
- **Lint e formatação:** Biome
- **CI:** GitHub Actions (lint → typecheck → testes em todo Pull Request)
- **Ambiente:** WSL 2 + Ubuntu, Docker Desktop
- **Frontend (planejado):** React + Vite + shadcn/ui + Tailwind

As decisões técnicas e o porquê de cada uma estão em [`docs/trd.md`](docs/trd.md) e [`docs/changelog-arquitetura.md`](docs/changelog-arquitetura.md).

---

## Rodando o projeto

O passo a passo do ambiente (WSL, nvm, Docker, Git e SSH) está no [`SETUP.md`](SETUP.md). Com o ambiente pronto, e o **Docker Desktop aberto**:

### 1. Variáveis de ambiente

```bash
cp .env.example .env
```

O `DATABASE_URL` do exemplo já aponta para o banco do `docker-compose.yml`. Troque o `JWT_SECRET` por uma chave sua, com **pelo menos 32 caracteres** (o servidor recusa subir com menos):

```bash
openssl rand -base64 32
```

### 2. Banco de dados

```bash
docker compose up -d
```

### 3. Dependências, cliente do Prisma e migrations

```bash
npm run preparar
```

Ele roda `npm ci`, `prisma generate` e `prisma migrate deploy`. É o mesmo comando para deixar a máquina em dia depois de um `git pull`.

### 4. Usuários de teste (opcional)

```bash
docker exec -i qualityhub_db psql -U qualityhub -d qualityhub < testes/setup-usuarios-teste.sql
```

### 5. Servidor

```bash
npm run dev
```

A API fica disponível em `http://localhost:3333`.

---

## Scripts

| Comando | O que faz |
| --- | --- |
| `npm run dev` | Servidor com recarga automática |
| `npm test` | Testes (Vitest + Testcontainers; precisa do Docker Desktop aberto) |
| `npm run test:cobertura` | A suíte completa com a trava da cobertura (`CONSTRAINTS.md` §2); é o que o CI roda |
| `npm run typecheck` | Confere os tipos sem compilar (`tsc --noEmit`) |
| `npm run lint` | Biome: formatação, lint, ordem dos imports e regras de arquitetura |
| `npm run lint:fix` | Corrige o que o Biome consegue sozinho |
| `npm run preparar` | `npm ci` + `prisma generate` + `prisma migrate deploy` |
| `npm run ambiente -- <trabalho\|casa\|comparar>` | Foto do ambiente da máquina, para comparar os dois PCs (`SETUP.md` §12.5) |

Outros comandos úteis:

| Comando | O que faz |
| --- | --- |
| `npx prisma studio` | Interface visual para os dados |
| `npx prisma migrate dev --name <nome>` | Cria e aplica uma migration (depois, `npx prisma generate`) |
| `docker compose down` | Para o banco, preservando os dados |
| `docker compose down -v` | Para o banco **apagando os dados** |

---

## Trocando de máquina

O projeto é desenvolvido em dois computadores. A rotina completa está no [`SETUP.md`](SETUP.md) §12. Em resumo, ao chegar numa máquina:

```bash
git pull
docker compose up -d
npm run preparar
```

---

## Estado atual do projeto

A ordem de construção está em [`docs/plano-implementacao.md`](docs/plano-implementacao.md).

**Concluído**

- Backend do fluxo completo da NC: as seis entidades, ciclo de vida, permissões em três camadas, atribuições e auditoria
- Testes automatizados (cerca de 250, de API, com banco real) e CI obrigatório na `main`
- Correções de regra da fase A3 (bugs B1–B18, exceto o B7)
- Contrato de qualidade ([`CONSTRAINTS.md`](CONSTRAINTS.md)) e auditoria de segurança

**Próximo**

- A4 — sessão em cookie e revogação imediata de papéis (B7), e a correção de concorrência nas transições (B19)
- A5 — contrato da API (OpenAPI) · A6 — gestão de usuários e setores
- Design (identidade visual, wireframes, protótipo) e frontend em fatias
- Hospedagem e produção
