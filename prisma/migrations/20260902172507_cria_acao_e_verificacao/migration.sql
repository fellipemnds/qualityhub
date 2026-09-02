-- CreateEnum
CREATE TYPE "ResultadoVerificacao" AS ENUM ('PENDENTE', 'EFICAZ', 'PARCIALMENTE_EFICAZ', 'NAO_EFICAZ');

-- AlterTable
ALTER TABLE "Anexo" ADD COLUMN     "acaoId" INTEGER,
ADD COLUMN     "verificacaoId" INTEGER;

-- CreateTable
CREATE TABLE "Acao" (
    "id" SERIAL NOT NULL,
    "descricao" TEXT NOT NULL,
    "efeitoEsperado" TEXT NOT NULL,
    "prazo" TIMESTAMP(3) NOT NULL,
    "concluidaEm" TIMESTAMP(3),
    "investigacaoId" INTEGER NOT NULL,
    "responsavelId" INTEGER NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Acao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Verificacao" (
    "id" SERIAL NOT NULL,
    "resultado" "ResultadoVerificacao" NOT NULL DEFAULT 'PENDENTE',
    "conclusao" TEXT,
    "dataAlvo" TIMESTAMP(3) NOT NULL,
    "verificadoEm" TIMESTAMP(3),
    "acaoId" INTEGER NOT NULL,
    "responsavelId" INTEGER NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Verificacao_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Anexo" ADD CONSTRAINT "Anexo_acaoId_fkey" FOREIGN KEY ("acaoId") REFERENCES "Acao"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Anexo" ADD CONSTRAINT "Anexo_verificacaoId_fkey" FOREIGN KEY ("verificacaoId") REFERENCES "Verificacao"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Acao" ADD CONSTRAINT "Acao_investigacaoId_fkey" FOREIGN KEY ("investigacaoId") REFERENCES "Investigacao"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Acao" ADD CONSTRAINT "Acao_responsavelId_fkey" FOREIGN KEY ("responsavelId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Verificacao" ADD CONSTRAINT "Verificacao_acaoId_fkey" FOREIGN KEY ("acaoId") REFERENCES "Acao"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Verificacao" ADD CONSTRAINT "Verificacao_responsavelId_fkey" FOREIGN KEY ("responsavelId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
