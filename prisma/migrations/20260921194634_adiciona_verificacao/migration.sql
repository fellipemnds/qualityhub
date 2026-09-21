-- CreateTable
CREATE TABLE "Verificacao" (
    "id" TEXT NOT NULL,
    "acaoCorretivaId" TEXT NOT NULL,
    "prazo" TIMESTAMP(3),
    "eficaz" BOOLEAN,
    "evidencia" TEXT,
    "verificadoEm" TIMESTAMP(3),

    CONSTRAINT "Verificacao_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Verificacao" ADD CONSTRAINT "Verificacao_id_fkey" FOREIGN KEY ("id") REFERENCES "Registro"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Verificacao" ADD CONSTRAINT "Verificacao_acaoCorretivaId_fkey" FOREIGN KEY ("acaoCorretivaId") REFERENCES "AcaoCorretiva"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
