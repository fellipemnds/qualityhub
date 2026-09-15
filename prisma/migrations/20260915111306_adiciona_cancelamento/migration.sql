-- CreateTable
CREATE TABLE "Cancelamento" (
    "id" TEXT NOT NULL,
    "registroId" TEXT NOT NULL,
    "canceladoPorId" TEXT NOT NULL,
    "motivo" TEXT NOT NULL,
    "canceladoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Cancelamento_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Cancelamento" ADD CONSTRAINT "Cancelamento_registroId_fkey" FOREIGN KEY ("registroId") REFERENCES "Registro"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cancelamento" ADD CONSTRAINT "Cancelamento_canceladoPorId_fkey" FOREIGN KEY ("canceladoPorId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
