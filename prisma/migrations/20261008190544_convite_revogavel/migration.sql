-- AlterTable
ALTER TABLE "TokenAcesso" ADD COLUMN     "revogadoEm" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "TokenAcesso_usuarioId_idx" ON "TokenAcesso"("usuarioId");
