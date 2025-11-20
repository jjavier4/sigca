/*
  Warnings:

  - A unique constraint covering the columns `[rfc]` on the table `Usuarios` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[curp]` on the table `Usuarios` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Usuarios" ADD COLUMN     "curp" TEXT,
ADD COLUMN     "rfc" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Usuarios_rfc_key" ON "Usuarios"("rfc");

-- CreateIndex
CREATE UNIQUE INDEX "Usuarios_curp_key" ON "Usuarios"("curp");
