/*
  Warnings:

  - You are about to drop the `rubricas` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "GrupoRubrica" AS ENUM ('DIFUSION', 'DIVULGACION');

-- AlterTable
ALTER TABLE "Asignaciones" ADD COLUMN     "calificacion" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "Trabajos" ADD COLUMN     "calificacion_final" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "Usuarios" ADD COLUMN     "activa" BOOLEAN NOT NULL DEFAULT false;

-- DropTable
DROP TABLE "public"."rubricas";

-- CreateTable
CREATE TABLE "CriteriosEvaluacion" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "grupo" "GrupoRubrica" NOT NULL,
    "descripcion_puntaje" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CriteriosEvaluacion_pkey" PRIMARY KEY ("id")
);
