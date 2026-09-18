-- CreateTable
CREATE TABLE "Classificacao" (
    "id" TEXT NOT NULL,
    "naoConformidadeId" TEXT NOT NULL,
    "valor" "ClassificacaoNC",
    "justificativa" TEXT,

    CONSTRAINT "Classificacao_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Classificacao" ADD CONSTRAINT "Classificacao_id_fkey" FOREIGN KEY ("id") REFERENCES "Registro"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Classificacao" ADD CONSTRAINT "Classificacao_naoConformidadeId_fkey" FOREIGN KEY ("naoConformidadeId") REFERENCES "NaoConformidade"("id") ON DELETE CASCADE ON UPDATE CASCADE;
