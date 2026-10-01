/*
  Warnings:

  - Made the column `investigacaoId` on table `AcaoCorretiva` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "AcaoCorretiva" DROP CONSTRAINT "AcaoCorretiva_investigacaoId_fkey";

-- AlterTable
ALTER TABLE "AcaoCorretiva" ALTER COLUMN "investigacaoId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "AcaoCorretiva" ADD CONSTRAINT "AcaoCorretiva_investigacaoId_fkey" FOREIGN KEY ("investigacaoId") REFERENCES "Investigacao"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
