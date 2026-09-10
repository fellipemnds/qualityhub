-- CreateEnum
CREATE TYPE "TipoRegistro" AS ENUM ('NAO_CONFORMIDADE', 'CLASSIFICACAO', 'CONTENCAO', 'INVESTIGACAO', 'ACAO_CORRETIVA', 'VERIFICACAO');

-- CreateEnum
CREATE TYPE "EstadoRegistro" AS ENUM ('RASCUNHO', 'ABERTO', 'EM_APROVACAO', 'FECHADO', 'CANCELADO');

-- CreateEnum
CREATE TYPE "OrigemNC" AS ENUM ('AUDITORIA_INTERNA', 'AUDITORIA_EXTERNA', 'OPERACAO', 'RECLAMACAO_CLIENTE');

-- CreateEnum
CREATE TYPE "ClassificacaoNC" AS ENUM ('MAIOR', 'MENOR');

-- CreateEnum
CREATE TYPE "Papel" AS ENUM ('VISUALIZADOR', 'EDITOR', 'APROVADOR', 'GERENTE', 'ADMIN');

-- CreateEnum
CREATE TYPE "TipoTokenAcesso" AS ENUM ('CONVITE', 'RECUPERACAO_SENHA');

-- CreateEnum
CREATE TYPE "FuncaoAtribuicao" AS ENUM ('COLABORADOR', 'APROVADOR');

-- CreateTable
CREATE TABLE "Registro" (
    "id" TEXT NOT NULL,
    "tipo" "TipoRegistro" NOT NULL,
    "codigo" TEXT,
    "estado" "EstadoRegistro" NOT NULL DEFAULT 'RASCUNHO',
    "portaoAtual" INTEGER NOT NULL DEFAULT 0,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,
    "criadoPorId" TEXT NOT NULL,

    CONSTRAINT "Registro_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NaoConformidade" (
    "id" TEXT NOT NULL,
    "titulo" TEXT,
    "descricao" TEXT,
    "requisitoViolado" TEXT,
    "processoAfetado" TEXT,
    "classificacaoAtual" "ClassificacaoNC",
    "setorId" INTEGER,
    "detectadoEm" TIMESTAMP(3),
    "origem" "OrigemNC",
    "cliente" TEXT,
    "riscosRevisados" TEXT,
    "mudancasSGQ" TEXT,

    CONSTRAINT "NaoConformidade_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Setor" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Setor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UsuarioPapel" (
    "usuarioId" TEXT NOT NULL,
    "papel" "Papel" NOT NULL,
    "concedidoPorId" TEXT NOT NULL,
    "concedidoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UsuarioPapel_pkey" PRIMARY KEY ("usuarioId","papel")
);

-- CreateTable
CREATE TABLE "Usuario" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senhaHash" TEXT,
    "setorId" INTEGER NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TokenAcesso" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "tipo" "TipoTokenAcesso" NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiraEm" TIMESTAMP(3) NOT NULL,
    "usadoEm" TIMESTAMP(3),

    CONSTRAINT "TokenAcesso_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContadorSequencia" (
    "prefixo" TEXT NOT NULL,
    "ano" INTEGER NOT NULL,
    "ultimoNumero" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "ContadorSequencia_pkey" PRIMARY KEY ("prefixo","ano")
);

-- CreateTable
CREATE TABLE "Atribuicao" (
    "registroId" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "funcao" "FuncaoAtribuicao" NOT NULL,
    "atribuidoPorId" TEXT NOT NULL,
    "atribuidoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Atribuicao_pkey" PRIMARY KEY ("registroId","usuarioId","funcao")
);

-- CreateIndex
CREATE UNIQUE INDEX "Registro_codigo_key" ON "Registro"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "Setor_nome_key" ON "Setor"("nome");

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_email_key" ON "Usuario"("email");

-- CreateIndex
CREATE UNIQUE INDEX "TokenAcesso_tokenHash_key" ON "TokenAcesso"("tokenHash");

-- CreateIndex
CREATE UNIQUE INDEX "atribuicao_um_aprovador" ON "Atribuicao"("registroId") WHERE ("funcao" = 'APROVADOR');

-- AddForeignKey
ALTER TABLE "Registro" ADD CONSTRAINT "Registro_criadoPorId_fkey" FOREIGN KEY ("criadoPorId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NaoConformidade" ADD CONSTRAINT "NaoConformidade_setorId_fkey" FOREIGN KEY ("setorId") REFERENCES "Setor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NaoConformidade" ADD CONSTRAINT "NaoConformidade_id_fkey" FOREIGN KEY ("id") REFERENCES "Registro"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UsuarioPapel" ADD CONSTRAINT "UsuarioPapel_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UsuarioPapel" ADD CONSTRAINT "UsuarioPapel_concedidoPorId_fkey" FOREIGN KEY ("concedidoPorId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Usuario" ADD CONSTRAINT "Usuario_setorId_fkey" FOREIGN KEY ("setorId") REFERENCES "Setor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TokenAcesso" ADD CONSTRAINT "TokenAcesso_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Atribuicao" ADD CONSTRAINT "Atribuicao_registroId_fkey" FOREIGN KEY ("registroId") REFERENCES "Registro"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Atribuicao" ADD CONSTRAINT "Atribuicao_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Atribuicao" ADD CONSTRAINT "Atribuicao_atribuidoPorId_fkey" FOREIGN KEY ("atribuidoPorId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
