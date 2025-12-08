/*
  Warnings:

  - The values [CAMBIOS_SOLICITADOS] on the enum `EstadoTrabajo` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `areas_tematicas` on the `Convocatorias` table. All the data in the column will be lost.
  - You are about to drop the column `requisitos` on the `Convocatorias` table. All the data in the column will be lost.
  - You are about to drop the column `version` on the `Trabajos` table. All the data in the column will be lost.
  - The `coautores` column on the `Trabajos` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the `Comentarios` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `archivo_url` to the `Convocatorias` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "EstadoTrabajo_new" AS ENUM ('EN_REVISION', 'ACEPTADO', 'RECHAZADO');
ALTER TABLE "public"."Trabajos" ALTER COLUMN "estado" DROP DEFAULT;
ALTER TABLE "Trabajos" ALTER COLUMN "estado" TYPE "EstadoTrabajo_new" USING ("estado"::text::"EstadoTrabajo_new");
ALTER TYPE "EstadoTrabajo" RENAME TO "EstadoTrabajo_old";
ALTER TYPE "EstadoTrabajo_new" RENAME TO "EstadoTrabajo";
DROP TYPE "public"."EstadoTrabajo_old";
ALTER TABLE "Trabajos" ALTER COLUMN "estado" SET DEFAULT 'EN_REVISION';
COMMIT;

-- DropForeignKey
ALTER TABLE "public"."Comentarios" DROP CONSTRAINT "Comentarios_trabajoId_fkey";

-- AlterTable
ALTER TABLE "Asignaciones" ADD COLUMN     "comentario" TEXT,
ALTER COLUMN "closeAt" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Convocatorias" DROP COLUMN "areas_tematicas",
DROP COLUMN "requisitos",
ADD COLUMN     "archivo_url" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Trabajos" DROP COLUMN "version",
DROP COLUMN "coautores",
ADD COLUMN     "coautores" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- DropTable
DROP TABLE "public"."Comentarios";
