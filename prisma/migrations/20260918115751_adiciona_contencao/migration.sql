-- CreateEnum
CREATE TYPE "Disposicao" AS ENUM ('ACEITO', 'CORRIGIDO', 'ANULADO', 'EM_ANALISE');

-- CreateTable
CREATE TABLE "Contencao" (
    "id" TEXT NOT NULL,
    "naoConformidadeId" TEXT NOT NULL,
    "descricao" TEXT,
    "executadaEm" TIMESTAMP(3),
    "disposicao" "Disposicao",

    CONSTRAINT "Contencao_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Contencao" ADD CONSTRAINT "Contencao_id_fkey" FOREIGN KEY ("id") REFERENCES "Registro"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contencao" ADD CONSTRAINT "Contencao_naoConformidadeId_fkey" FOREIGN KEY ("naoConformidadeId") REFERENCES "NaoConformidade"("id") ON DELETE CASCADE ON UPDATE CASCADE;
