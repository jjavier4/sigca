/*
  Warnings:

  - You are about to drop the column `referencia_pago` on the `Usuarios` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[referencia_pago]` on the table `Trabajos` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "public"."Usuarios_referencia_pago_key";

-- AlterTable
ALTER TABLE "Trabajos" ADD COLUMN     "referencia_pago" TEXT;

-- AlterTable
ALTER TABLE "Usuarios" DROP COLUMN "referencia_pago";

-- CreateIndex
CREATE UNIQUE INDEX "Trabajos_referencia_pago_key" ON "Trabajos"("referencia_pago");
