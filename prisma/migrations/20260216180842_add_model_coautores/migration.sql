/*
  Warnings:

  - You are about to drop the column `coautores` on the `Trabajos` table. All the data in the column will be lost.
  - Changed the type of `tipo` on the `Trabajos` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "Trabajos" DROP COLUMN "coautores",
DROP COLUMN "tipo",
ADD COLUMN     "tipo" "GrupoRubrica" NOT NULL;

-- CreateTable
CREATE TABLE "Coautores" (
    "id" TEXT NOT NULL,
    "idTrabajo" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "correo" TEXT NOT NULL,

    CONSTRAINT "Coautores_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Coautores_idTrabajo_idx" ON "Coautores"("idTrabajo");

-- AddForeignKey
ALTER TABLE "Coautores" ADD CONSTRAINT "Coautores_idTrabajo_fkey" FOREIGN KEY ("idTrabajo") REFERENCES "Trabajos"("id") ON DELETE CASCADE ON UPDATE CASCADE;
