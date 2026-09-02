-- CreateEnum
CREATE TYPE "PortaoAprovacao" AS ENUM ('CLASSIFICACAO', 'ENCERRAMENTO_INVESTIGACAO', 'ENCERRAMENTO_NC', 'AUTORIZACAO_CONCESSAO');

-- CreateTable
CREATE TABLE "Aprovacao" (
    "id" SERIAL NOT NULL,
    "portao" "PortaoAprovacao" NOT NULL,
    "autoaprovacao" BOOLEAN NOT NULL DEFAULT false,
    "justificativa" TEXT,
    "naoConformidadeId" INTEGER NOT NULL,
    "aprovadorId" INTEGER NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Aprovacao_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Aprovacao" ADD CONSTRAINT "Aprovacao_naoConformidadeId_fkey" FOREIGN KEY ("naoConformidadeId") REFERENCES "NaoConformidade"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Aprovacao" ADD CONSTRAINT "Aprovacao_aprovadorId_fkey" FOREIGN KEY ("aprovadorId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
