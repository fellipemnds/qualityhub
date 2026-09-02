-- CreateEnum
CREATE TYPE "OrigemNC" AS ENUM ('AUDITORIA_INTERNA', 'AUDITORIA_EXTERNA', 'OPERACAO', 'RECLAMACAO_CLIENTE');

-- CreateEnum
CREATE TYPE "TipoRegistro" AS ENUM ('NAO_CONFORMIDADE', 'CONCESSAO');

-- CreateEnum
CREATE TYPE "EstadoNC" AS ENUM ('ABERTA', 'EM_ANALISE', 'IMPROCEDENTE', 'EM_CONTENCAO', 'EM_ACAO_CORRETIVA', 'VERIFICACAO_EFICACIA', 'ENCERRADA');

-- CreateTable
CREATE TABLE "NaoConformidade" (
    "id" SERIAL NOT NULL,
    "numero" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "requisitoViolado" TEXT NOT NULL,
    "tipo" "TipoRegistro" NOT NULL DEFAULT 'NAO_CONFORMIDADE',
    "origem" "OrigemNC" NOT NULL,
    "estado" "EstadoNC" NOT NULL DEFAULT 'ABERTA',
    "cliente" TEXT,
    "dataOcorrencia" TIMESTAMP(3) NOT NULL,
    "dataRegistro" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "setorId" INTEGER NOT NULL,
    "atualizadoem" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reaberturas" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "NaoConformidade_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "NaoConformidade_numero_key" ON "NaoConformidade"("numero");

-- AddForeignKey
ALTER TABLE "NaoConformidade" ADD CONSTRAINT "NaoConformidade_setorId_fkey" FOREIGN KEY ("setorId") REFERENCES "Setor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
