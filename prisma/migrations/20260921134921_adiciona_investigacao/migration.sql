-- CreateEnum
CREATE TYPE "MetodoInvestigacao" AS ENUM ('A3_SPS');

-- CreateTable
CREATE TABLE "Investigacao" (
    "id" TEXT NOT NULL,
    "naoConformidadeId" TEXT NOT NULL,
    "realProblema" TEXT,
    "metodo" "MetodoInvestigacao",
    "conteudo" JSONB,
    "causaDireta" TEXT,
    "causaRaiz" TEXT,

    CONSTRAINT "Investigacao_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Investigacao" ADD CONSTRAINT "Investigacao_id_fkey" FOREIGN KEY ("id") REFERENCES "Registro"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Investigacao" ADD CONSTRAINT "Investigacao_naoConformidadeId_fkey" FOREIGN KEY ("naoConformidadeId") REFERENCES "NaoConformidade"("id") ON DELETE CASCADE ON UPDATE CASCADE;
