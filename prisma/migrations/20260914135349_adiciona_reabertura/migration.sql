-- CreateTable
CREATE TABLE "Reabertura" (
    "id" TEXT NOT NULL,
    "registroId" TEXT NOT NULL,
    "reabertoPorId" TEXT NOT NULL,
    "motivo" TEXT NOT NULL,
    "reabertoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Reabertura_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Reabertura" ADD CONSTRAINT "Reabertura_registroId_fkey" FOREIGN KEY ("registroId") REFERENCES "Registro"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reabertura" ADD CONSTRAINT "Reabertura_reabertoPorId_fkey" FOREIGN KEY ("reabertoPorId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
