-- CreateEnum
CREATE TYPE "ClassificacaoNC" AS ENUM ('MAJOR', 'MINOR');

-- AlterTable
ALTER TABLE "NaoConformidade" ADD COLUMN     "analiseCausa" TEXT,
ADD COLUMN     "classificacao" "ClassificacaoNC";

-- CreateTable
CREATE TABLE "Investigacao" (
    "id" SERIAL NOT NULL,
    "naoConformidadeId" INTEGER NOT NULL,
    "responsavelId" INTEGER NOT NULL,
    "causaRaiz" TEXT NOT NULL,
    "metodologia" TEXT,
    "abrangencia" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Investigacao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Anexo" (
    "id" SERIAL NOT NULL,
    "nomeArquivo" TEXT NOT NULL,
    "caminho" TEXT NOT NULL,
    "tipoMime" TEXT NOT NULL,
    "tamanhoBytes" INTEGER NOT NULL,
    "naoConformidadeId" INTEGER,
    "contencaoId" INTEGER,
    "investigacaoId" INTEGER,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "enviadoPorId" INTEGER NOT NULL,

    CONSTRAINT "Anexo_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Investigacao" ADD CONSTRAINT "Investigacao_naoConformidadeId_fkey" FOREIGN KEY ("naoConformidadeId") REFERENCES "NaoConformidade"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Investigacao" ADD CONSTRAINT "Investigacao_responsavelId_fkey" FOREIGN KEY ("responsavelId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Anexo" ADD CONSTRAINT "Anexo_naoConformidadeId_fkey" FOREIGN KEY ("naoConformidadeId") REFERENCES "NaoConformidade"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Anexo" ADD CONSTRAINT "Anexo_contencaoId_fkey" FOREIGN KEY ("contencaoId") REFERENCES "Contencao"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Anexo" ADD CONSTRAINT "Anexo_investigacaoId_fkey" FOREIGN KEY ("investigacaoId") REFERENCES "Investigacao"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Anexo" ADD CONSTRAINT "Anexo_enviadoPorId_fkey" FOREIGN KEY ("enviadoPorId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
