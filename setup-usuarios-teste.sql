-- Setup de usuários de teste para o QualityHub
-- Rode com: psql -U qualityhub -d qualityhub -f setup-usuarios-teste.sql
-- (ou cole o conteúdo inteiro dentro de uma sessão psql aberta)
--
-- ANTES DE RODAR: gere o hash da senha de teste compartilhada.
-- No terminal, na raiz do projeto (onde o bcrypt está instalado):
--
--   node -e 'console.log(require("bcrypt").hashSync("SenhaDeTeste123!", 10))'
--
-- Copie o resultado (algo como $2b$10$....) e substitua HASH_AQUI abaixo,
-- nas sete linhas marcadas. Todos os usuários de teste terão a MESMA senha:
-- "SenhaDeTeste123!" — é só para desenvolvimento local.

BEGIN;

-- 1. Setor (todos os usuários de teste ficam no mesmo setor)
INSERT INTO "Setor" (nome, "criadoEm")
VALUES ('Qualidade', now())
RETURNING id AS setor_id \gset

-- 2. Admin — papel único: ADMIN
-- Concede o papel a si mesmo (caso especial de bootstrap, sem quem conceder antes dele)
INSERT INTO "Usuario" (id, nome, email, "senhaHash", "setorId", "criadoEm", "atualizadoEm")
VALUES (gen_random_uuid(), 'Admin Teste', 'admin@teste.com', '$2b$10$OrTdi2xVpof1UUrMI5rTyuH2KfV9Lr78ww0meFaslUENmU15JJ6wa', :'setor_id', now(), now())
RETURNING id AS admin_id \gset

INSERT INTO "UsuarioPapel" ("usuarioId", papel, "concedidoPorId", "concedidoEm")
VALUES (:'admin_id', 'ADMIN', :'admin_id', now());

-- 3. Editor — papel único: EDITOR (ex.: colaborador de área)
INSERT INTO "Usuario" (id, nome, email, "senhaHash", "setorId", "criadoEm", "atualizadoEm")
VALUES (gen_random_uuid(), 'Editor Teste', 'editor@teste.com', '$2b$10$OrTdi2xVpof1UUrMI5rTyuH2KfV9Lr78ww0meFaslUENmU15JJ6wa', :'setor_id', now(), now())
RETURNING id AS editor_id \gset

INSERT INTO "UsuarioPapel" ("usuarioId", papel, "concedidoPorId", "concedidoEm")
VALUES (:'editor_id', 'EDITOR', :'admin_id', now());

-- 4. Aprovador — papel único: APROVADOR
INSERT INTO "Usuario" (id, nome, email, "senhaHash", "setorId", "criadoEm", "atualizadoEm")
VALUES (gen_random_uuid(), 'Aprovador Teste', 'aprovador@teste.com', '$2b$10$OrTdi2xVpof1UUrMI5rTyuH2KfV9Lr78ww0meFaslUENmU15JJ6wa', :'setor_id', now(), now())
RETURNING id AS aprovador_id \gset

INSERT INTO "UsuarioPapel" ("usuarioId", papel, "concedidoPorId", "concedidoEm")
VALUES (:'aprovador_id', 'APROVADOR', :'admin_id', now());

-- 5. QA — papéis: EDITOR + APROVADOR (mapeamento real do documento, §5.2)
INSERT INTO "Usuario" (id, nome, email, "senhaHash", "setorId", "criadoEm", "atualizadoEm")
VALUES (gen_random_uuid(), 'QA Teste', 'qa@teste.com', '$2b$10$OrTdi2xVpof1UUrMI5rTyuH2KfV9Lr78ww0meFaslUENmU15JJ6wa', :'setor_id', now(), now())
RETURNING id AS qa_id \gset

INSERT INTO "UsuarioPapel" ("usuarioId", papel, "concedidoPorId", "concedidoEm")
VALUES
  (:'qa_id', 'EDITOR', :'admin_id', now()),
  (:'qa_id', 'APROVADOR', :'admin_id', now());

-- 6. Gerente — papéis: EDITOR + APROVADOR + GERENTE (mapeamento real, §5.2)
INSERT INTO "Usuario" (id, nome, email, "senhaHash", "setorId", "criadoEm", "atualizadoEm")
VALUES (gen_random_uuid(), 'Gerente Teste', 'gerente@teste.com', '$2b$10$OrTdi2xVpof1UUrMI5rTyuH2KfV9Lr78ww0meFaslUENmU15JJ6wa', :'setor_id', now(), now())
RETURNING id AS gerente_id \gset

INSERT INTO "UsuarioPapel" ("usuarioId", papel, "concedidoPorId", "concedidoEm")
VALUES
  (:'gerente_id', 'EDITOR', :'admin_id', now()),
  (:'gerente_id', 'APROVADOR', :'admin_id', now()),
  (:'gerente_id', 'GERENTE', :'admin_id', now());

-- 7. Visualizador — papel único: VISUALIZADOR
INSERT INTO "Usuario" (id, nome, email, "senhaHash", "setorId", "criadoEm", "atualizadoEm")
VALUES (gen_random_uuid(), 'Visualizador Teste', 'visualizador@teste.com', '$2b$10$OrTdi2xVpof1UUrMI5rTyuH2KfV9Lr78ww0meFaslUENmU15JJ6wa', :'setor_id', now(), now())
RETURNING id AS visualizador_id \gset

INSERT INTO "UsuarioPapel" ("usuarioId", papel, "concedidoPorId", "concedidoEm")
VALUES (:'visualizador_id', 'VISUALIZADOR', :'admin_id', now());

-- 8. Sem Papel — usuário válido, mas sem nenhuma linha em UsuarioPapel
-- (usado para testar que ausência de papel nega, em vez de liberar, acesso)
INSERT INTO "Usuario" (id, nome, email, "senhaHash", "setorId", "criadoEm", "atualizadoEm")
VALUES (gen_random_uuid(), 'Sem Papel Teste', 'sempapel@teste.com', '$2b$10$OrTdi2xVpof1UUrMI5rTyuH2KfV9Lr78ww0meFaslUENmU15JJ6wa', :'setor_id', now(), now());

COMMIT;

-- Conferência rápida: lista todos os usuários de teste com seus papéis
-- (sempapel@teste.com aparece sem nenhuma linha de papel — é o esperado)
SELECT u.email, up.papel
FROM "Usuario" u
LEFT JOIN "UsuarioPapel" up ON up."usuarioId" = u.id
WHERE u.email LIKE '%@teste.com'
ORDER BY u.email, up.papel;