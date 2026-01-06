/*
  Warnings:

  - You are about to drop the column `tokenVerificacion` on the `Usuarios` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "public"."Usuarios_tokenVerificacion_key";

-- AlterTable
ALTER TABLE "Usuarios" DROP COLUMN "tokenVerificacion";
