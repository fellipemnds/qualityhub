-- DropForeignKey
ALTER TABLE "Atribuicao" DROP CONSTRAINT "Atribuicao_registroId_fkey";

-- AddForeignKey
ALTER TABLE "Atribuicao" ADD CONSTRAINT "Atribuicao_registroId_fkey" FOREIGN KEY ("registroId") REFERENCES "Registro"("id") ON DELETE CASCADE ON UPDATE CASCADE;
