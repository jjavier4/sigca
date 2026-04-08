/*
  Warnings:

  - A unique constraint covering the columns `[numero_control]` on the table `Usuarios` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[referencia_pago]` on the table `Usuarios` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Usuarios" ADD COLUMN     "numero_control" TEXT,
ADD COLUMN     "referencia_pago" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Usuarios_numero_control_key" ON "Usuarios"("numero_control");

-- CreateIndex
CREATE UNIQUE INDEX "Usuarios_referencia_pago_key" ON "Usuarios"("referencia_pago");
