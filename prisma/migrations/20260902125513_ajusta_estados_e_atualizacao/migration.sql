/*
  Warnings:

  - The values [EM_ANALISE,EM_CONTENCAO,EM_ACAO_CORRETIVA,VERIFICACAO_EFICACIA] on the enum `EstadoNC` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `atualizadoem` on the `NaoConformidade` table. All the data in the column will be lost.
  - Added the required column `atualizadoEm` to the `NaoConformidade` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "EstadoNC_new" AS ENUM ('ABERTA', 'ANALISE', 'IMPROCEDENTE', 'CONTENCAO', 'ACAO_CORRETIVA', 'VERIFICACAO', 'ENCERRADA');
ALTER TABLE "public"."NaoConformidade" ALTER COLUMN "estado" DROP DEFAULT;
ALTER TABLE "NaoConformidade" ALTER COLUMN "estado" TYPE "EstadoNC_new" USING ("estado"::text::"EstadoNC_new");
ALTER TYPE "EstadoNC" RENAME TO "EstadoNC_old";
ALTER TYPE "EstadoNC_new" RENAME TO "EstadoNC";
DROP TYPE "public"."EstadoNC_old";
ALTER TABLE "NaoConformidade" ALTER COLUMN "estado" SET DEFAULT 'ABERTA';
COMMIT;

-- AlterTable
ALTER TABLE "NaoConformidade" DROP COLUMN "atualizadoem",
ADD COLUMN     "atualizadoEm" TIMESTAMP(3) NOT NULL;
