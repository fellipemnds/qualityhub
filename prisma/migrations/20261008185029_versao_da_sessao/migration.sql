-- A versão das sessões no lugar da data (B27): o JWT leva a versão lida no login, e derrubar as sessões soma 1.
-- Os tokens emitidos antes desta migration deixam de valer (não levam a versão): todo mundo entra de novo.
-- AlterTable
ALTER TABLE "Usuario" DROP COLUMN "sessaoValidaDesde",
ADD COLUMN     "versaoSessao" INTEGER NOT NULL DEFAULT 0;
