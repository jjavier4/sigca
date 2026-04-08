/*
  Warnings:

  - You are about to drop the column `correo` on the `Coautores` table. All the data in the column will be lost.
  - Added the required column `email` to the `Coautores` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Coautores" DROP COLUMN "correo",
ADD COLUMN     "email" TEXT NOT NULL;
