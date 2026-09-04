/*
  Warnings:

  - The values [MAJOR,MINOR] on the enum `ClassificacaoNC` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "ClassificacaoNC_new" AS ENUM ('MAIOR', 'MENOR');
ALTER TABLE "NaoConformidade" ALTER COLUMN "classificacao" TYPE "ClassificacaoNC_new" USING ("classificacao"::text::"ClassificacaoNC_new");
ALTER TYPE "ClassificacaoNC" RENAME TO "ClassificacaoNC_old";
ALTER TYPE "ClassificacaoNC_new" RENAME TO "ClassificacaoNC";
DROP TYPE "public"."ClassificacaoNC_old";
COMMIT;

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "EstadoNC" ADD VALUE 'CANCELADA';
ALTER TYPE "EstadoNC" ADD VALUE 'INVESTIGACAO';
