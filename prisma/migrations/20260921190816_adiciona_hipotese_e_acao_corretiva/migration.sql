-- CreateEnum
CREATE TYPE "ClassificacaoHipotese" AS ENUM ('CAUSA_DIRETA', 'FATOR_CONTRIBUINTE', 'SEM_RELACAO');

-- CreateTable
CREATE TABLE "Hipotese" (
    "id" TEXT NOT NULL,
    "investigacaoId" TEXT NOT NULL,
    "descricao" TEXT,
    "numeroIshikawa" INTEGER,
    "classificacao" "ClassificacaoHipotese",

    CONSTRAINT "Hipotese_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AcaoCorretiva" (
    "id" TEXT NOT NULL,
    "naoConformidadeId" TEXT NOT NULL,
    "investigacaoId" TEXT,
    "descricao" TEXT,
    "prazo" TIMESTAMP(3),
    "executadoEm" TIMESTAMP(3),
    "evidencia" TEXT,

    CONSTRAINT "AcaoCorretiva_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Hipotese" ADD CONSTRAINT "Hipotese_investigacaoId_fkey" FOREIGN KEY ("investigacaoId") REFERENCES "Investigacao"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AcaoCorretiva" ADD CONSTRAINT "AcaoCorretiva_id_fkey" FOREIGN KEY ("id") REFERENCES "Registro"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AcaoCorretiva" ADD CONSTRAINT "AcaoCorretiva_naoConformidadeId_fkey" FOREIGN KEY ("naoConformidadeId") REFERENCES "NaoConformidade"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AcaoCorretiva" ADD CONSTRAINT "AcaoCorretiva_investigacaoId_fkey" FOREIGN KEY ("investigacaoId") REFERENCES "Investigacao"("id") ON DELETE SET NULL ON UPDATE CASCADE;
