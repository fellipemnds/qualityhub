-- CreateEnum
CREATE TYPE "PortaoAprovacao" AS ENUM ('FECHAMENTO', 'UNICA', 'PLANO', 'EXECUCAO');

-- CreateEnum
CREATE TYPE "Decisao" AS ENUM ('APROVADO', 'REPROVADO');

-- CreateTable
CREATE TABLE "Aprovacao" (
    "id" TEXT NOT NULL,
    "registroId" TEXT NOT NULL,
    "portao" "PortaoAprovacao" NOT NULL,
    "decisao" "Decisao" NOT NULL,
    "motivo" TEXT,
    "aprovadorId" TEXT NOT NULL,
    "autoAprovacao" BOOLEAN NOT NULL,
    "decididoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Aprovacao_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Aprovacao" ADD CONSTRAINT "Aprovacao_registroId_fkey" FOREIGN KEY ("registroId") REFERENCES "Registro"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Aprovacao" ADD CONSTRAINT "Aprovacao_aprovadorId_fkey" FOREIGN KEY ("aprovadorId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
