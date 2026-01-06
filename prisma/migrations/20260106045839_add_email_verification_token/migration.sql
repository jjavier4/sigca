/*
  Warnings:

  - A unique constraint covering the columns `[tokenVerificacion]` on the table `Usuarios` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Usuarios" ADD COLUMN     "tokenVerificacion" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Usuarios_tokenVerificacion_key" ON "Usuarios"("tokenVerificacion");
