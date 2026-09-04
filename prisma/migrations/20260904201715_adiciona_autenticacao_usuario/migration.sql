/*
  Warnings:

  - Added the required column `perfil` to the `Usuario` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "PerfilUsuario" AS ENUM ('COLABORADOR', 'QA', 'DIRETORIA');

-- AlterTable
ALTER TABLE "Usuario" ADD COLUMN     "perfil" "PerfilUsuario" NOT NULL,
ADD COLUMN     "senhaHash" TEXT;
