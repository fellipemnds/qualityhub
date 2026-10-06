-- CreateEnum
CREATE TYPE "TelaInicial" AS ENUM ('PENDENCIAS', 'NCS', 'RELATORIOS', 'USUARIOS');

-- AlterTable
ALTER TABLE "Usuario" ADD COLUMN     "desativadoEm" TIMESTAMP(3),
ADD COLUMN     "sessaoValidaDesde" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "telaInicial" "TelaInicial";
