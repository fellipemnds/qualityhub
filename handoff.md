# Handoff — estado da sessão

> Lido no **início de toda sessão** (regra no `CLAUDE.md`) e atualizado
> no **fim de toda sessão** ou quando Matthew disser "vou trocar de
> computador". Aqui fica só o que muda de sessão para sessão; o que é
> estável mora nos documentos apontados.

**Última atualização:** 2026-09-25, computador do trabalho, à tarde
(Matthew continua em casa no mesmo dia).

## 1. Objetivo

Fase **A1 — aprender testes + infraestrutura de testes**. O que ela
entrega e quando está pronta: `docs/plano-implementacao.md`, seção A1.
Por que os testes vêm antes das correções: `docs/trd.md` §9 (ADR-36).

## 2. Estado atual

- Branch **`fase/a1-testes`**, tudo commitado **e no `origin`**.
- **Infraestrutura de testes pronta e funcionando** (`npm test` → 5
  verdes). Como funciona: `CLAUDE.md`, seção "Testes".
- Matthew escreveu tudo: os 4 testes da `paginar`, o `GET /` com
  `app.inject()`, o `vitest.config.ts` e os três arquivos de
  `src/testes/`. Já viu a trava de segurança disparar (comentando a
  `DATABASE_URL`) e cada teste da `paginar` falhar de propósito.
- O que ele já domina: `describe`/`it`/`expect`, `toBe` × `toEqual`,
  ler o diff de falha, `beforeEach`, `globalSetup` × `setupFiles`,
  `provide`/`inject` + `declare module`, hoisting de `import`,
  `$queryRaw` (marcadores `$1`) × `$executeRawUnsafe`.
- Pontos em que ele tropeçou (para reforçar, sem repetir a explicação
  longa): `import` × `include`; valor × tipo (`const x = { id: string }`);
  `process.env["X"] = valor` (chave × conteúdo); chamar × declarar
  função (`beforeEach(async () => {})`); desestruturar `[x]` quando
  queria a lista inteira.

## 3. Arquivos no meio de uma mudança

Nenhum. O `src/testes/fabricas.ts` do próximo passo **ainda não foi
criado**.

## 4. O que foi alterado nesta sessão

`git log 111f0b2..fase/a1-testes`. Resumo: Vitest + script `test`;
testes da `paginar`; `.http` movidos para `testes/old/`;
Testcontainers + `globalSetup`/`setupFiles` + `GET /`; limpeza do banco
com trava. No `allowScripts`, `protobufjs`, `ssh2` e `cpu-features`
foram **negados** de propósito (vêm do Testcontainers, não precisam
rodar).

## 5. Falhas (e o porquê)

| O que falhou | Por quê | Situação |
|---|---|---|
| `npm audit`: 4 vulnerabilidades altas | Herdadas do Prisma 7 | **Aberto**, risco baixo — `docs/trd.md` §13. Nunca `npm audit fix --force` |
| Aviso "Update available 7.10.0 → 8.0.0-rc" do Prisma | É release candidate e versão major | **Não atualizar** |
| `$queryRaw` com `TRUNCATE TABLE ${tabelas}` → `syntax error at or near "$1"` | Tagged template vira parâmetro; nome de tabela não pode ser parâmetro | Resolvido com `$executeRawUnsafe` (nomes vêm do próprio Postgres) |

**Pendências anotadas (commits separados, fora da ordem da A1):**
- Trocar os 5 `process.env["..."]` antigos por `process.env.X`
  (avisos `useLiteralKeys` do Biome).
- Desligar o log do Fastify durante os testes (polui a saída).
- Na D1: excluir `**/*.test.ts` e `src/testes/` do build.
- Os testes unitários pagam a limpeza do banco (~100 ms cada, por causa
  do `beforeEach` global). Aceito; separar em dois grupos só se pesar.

## 6. Próximo passo

**Em casa, antes de codar:**
1. Se ainda não fez: `SETUP.md` §12.1 inteiro (casa estava ~2 semanas
   atrás) e instalar/autenticar o `gh`.
2. `git switch fase/a1-testes` → `git pull` → **`npm run preparar`**
   (instala o Vitest e o Testcontainers).
3. **Abrir o Docker Desktop** e rodar `npm test` → 5 verdes. Na
   primeira vez baixa a imagem do Ryuk (e a `postgres:17-alpine`, se
   não existir em casa).

**Depois, passo 6a (Matthew coda):** `src/testes/fabricas.ts` com
`criarUsuario({ email?, senha? })`:
- padrões `"usuario@teste.com"` e `"SenhaDeTeste123!"`;
- `senha: null` → `senhaHash: null` (padrão da desestruturação só vale
  para `undefined`, não para `null`);
- hash com `bcrypt.hash(senha, 10)`;
- setor via `connectOrCreate` pelo nome `"Qualidade"` (nome é único);
- devolve o usuário e a senha em texto; papéis ficam para o
  `loginComo`.

**6b:** `src/modulos/auth/auth.routes.test.ts`, `describe("POST
/auth/login")`: sucesso (200 + `token`), senha errada e usuário sem
senha (401 + `{ mensagem: "Credenciais inválidas" }`, idênticos —
RN-38). Regra de ouro: comentar o `$executeRawUnsafe` e ver o segundo
teste quebrar com e-mail duplicado (prova a limpeza).

Depois: `loginComo(perfil)` com os 8 perfis → teste unitário do
`temPapel` → CI no GitHub Actions.
