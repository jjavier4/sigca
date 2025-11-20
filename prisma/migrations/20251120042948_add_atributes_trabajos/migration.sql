/*
  Warnings:

  - Added the required column `coautores` to the `Trabajos` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tipo` to the `Trabajos` table without a default value. This is not possible if the table is not empty.
  - Added the required column `titulo` to the `Trabajos` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Trabajos" ADD COLUMN     "coautores" TEXT NOT NULL,
ADD COLUMN     "tipo" TEXT NOT NULL,
ADD COLUMN     "titulo" TEXT NOT NULL;
