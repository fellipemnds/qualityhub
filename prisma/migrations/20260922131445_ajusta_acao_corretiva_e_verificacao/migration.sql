/*
  Warnings:

  - You are about to drop the column `eficaz` on the `Verificacao` table. All the data in the column will be lost.
  - You are about to drop the column `evidencia` on the `Verificacao` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "ResultadoVerificacao" AS ENUM ('EFICAZ', 'PARCIALMENTE_EFICAZ', 'NAO_EFICAZ');

-- AlterTable
ALTER TABLE "AcaoCorretiva" ADD COLUMN     "instrucoesVerificacao" TEXT;

-- AlterTable
ALTER TABLE "Verificacao" DROP COLUMN "eficaz",
DROP COLUMN "evidencia",
ADD COLUMN     "conclusao" TEXT,
ADD COLUMN     "instrucoesVerificacao" TEXT,
ADD COLUMN     "resultado" "ResultadoVerificacao";
