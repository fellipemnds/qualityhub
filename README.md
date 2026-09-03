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
- *Gates* de aprovação para as etapas do processo — o sistema garante a aprovação do QA durante as etapas-chave do processo
- Controle compensatório de autoaprovação — o sistema detecta automaticamente quando aprovador e executor são a mesma pessoa, exige justificativa registrada e sinaliza o caso, convertendo um risco invisível de auditoria em risco gerenciado
- Função de Concessão para aceitação dos riscos de Não Conformidade — o sistema permite a aprovação da diretoria, exigindo justificativa registrada e sinalizando quando acontece.
- Papéis de usuário segregados (Colaborador, QA, Diretoria)
- Trilha de Auditoria — todo evento relevante é registrado com autor, data e valores antes/depois, de forma imutável e para qualquer entidade da plataforma
- Activity Feed — eventos do sistema e comentários das pessoas numa linha do tempo única, permitindo entender o histórico completo de uma NC em segundos
- Anexos

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

## Stacks
As ferramentas e tecnologias utilizadas neste projeto são: 
- **Runtime:** Node.js v24.20.0
- **Linguagem:** TypeScript v7.0.2 (instalado via `latest`; versão muito recenete, sob observação para anomalias de tipagem)
- **Framework HTTP:** Fastify v5.12.1
- **ORM:** Prisma 7.10.0
- **Driver adapter:** @prisma/adapter-pg + pg v7.x
- **Database:** PostgreSQL 17 Alpine
- **Container**: Docker + Docker Compose
- **Execução em dev:** tsx v4.23.13
- **Variáveis de Ambiente:** dotenv v17.4.2
- **Versionamento:** Git/GitHub
- Ambiente: WSL 2 + Ubuntu

### A definir: 
- Validação: Zod? 
- Autenticação: JWT ou sessão?
- Testes: Vitest?
- Front-End: React?
- Design: Figma? 
- Deploy: A definir

---

## Rotina de inicialização do projeto

### 0. Pré-requisitos
Para o setup do ambiente de desenvolvimento, consulte [SETUP.MD](SETUP.md).

### 1. Clonar o repositório
Para clonar o repositório, consulte [SETUP.MD](SETUP.md).

### 2. Instalação de Dependências
Para instalação das dependências, entre na pasta raiz do projeto e execute o seguinte comando: 

```bash
npm install
```

### 3. Configurar as variáveis de ambiente
Para configurar as variáveis de ambiente, copie o arquivo `.env.example` e ajuste os valores conforme necessário: 

```bash
cp .env.example .env
```

### 4. Subir o banco de dados
Para subir o banco de dados, suba o Docker container usando o seguinte comando: 

```bash
docker compose up -d
```

Para verificar se o container subiu corretamente, digite: 

```bash
docker compose ps
```

### 5. Aplicar as migrations
Para aplicar as Prisma migrations criadas, use o seguinte comando: 

```bash
npx prisma migrate dev
```

### 6. Iniciar o servidor
Para iniciar o servidor, execute o arquivo `server.ts` usando o seguinte comando: 

```bash
npx tsx src/server.ts
```

A API ficará disponível em `http://localhost:3333`.

---

## Trocando de máquina
Durante o desenvolvimento, precisei alternar entre duas máquinas, para isso, usei os seguintes comandos no Terminal: 

```bash
git pull
npm install
docker compose up -d
npx prisma migrate dev
```

---

## Comandos úteis

| Comando | O que faz |
|---|---|
| `npx prisma studio` | Interface visual para os dados |
| `npx prisma migrate dev --name <nome>` | Cria e aplica uma Migration |
| `npx prisma generate` | Regenera o Prisma Client |
| `npx tsc --noEmit` | Verifica os tipos sem compilar |
| `docker compose down ` | Para o banco — preservando os dados |
| `docker compose down -v` | Para o banco — **apagando os dados** |

---

## Estado atual do projeto

**Concluído**
- Modelagem dos dados: 10 entidades cobrindo o fluxo completo de NCs
- Servidor Fastify com endpoints iniciais

**Em desenvolvimento**
- API: Estrutura em camadas e regras de negócio

**A fazer**
- Autenticação e autorização
- Protótipo da interface
- Front-end
- Testes automatizados
- Deploy