-- AlterTable
ALTER TABLE "AcaoCorretiva" ALTER COLUMN "prazo" SET DATA TYPE DATE,
ALTER COLUMN "executadoEm" SET DATA TYPE DATE;

-- AlterTable
ALTER TABLE "Contencao" ALTER COLUMN "executadaEm" SET DATA TYPE DATE;

-- AlterTable
ALTER TABLE "NaoConformidade" ALTER COLUMN "detectadoEm" SET DATA TYPE DATE;

-- AlterTable
ALTER TABLE "Verificacao" ALTER COLUMN "prazo" SET DATA TYPE DATE,
ALTER COLUMN "verificadoEm" SET DATA TYPE DATE;
