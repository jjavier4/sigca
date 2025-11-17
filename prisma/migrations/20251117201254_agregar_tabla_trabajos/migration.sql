-- CreateEnum
CREATE TYPE "Rol" AS ENUM ('AUTOR', 'REVISOR', 'COMITE', 'ADMIN');

-- CreateEnum
CREATE TYPE "EstadoTrabajo" AS ENUM ('EN_REVISION', 'ACEPTADO', 'CAMBIOS_SOLICITADOS', 'RECHAZADO');

-- CreateTable
CREATE TABLE "Usuarios" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "apellidoP" TEXT NOT NULL,
    "apellidoM" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "rol" "Rol" NOT NULL DEFAULT 'AUTOR',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Convocatorias" (
    "id" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "fecha_inicio" TIMESTAMP(3) NOT NULL,
    "fecha_cierre" TIMESTAMP(3) NOT NULL,
    "areas_tematicas" TEXT[],
    "requisitos" TEXT NOT NULL,
    "activa" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Convocatorias_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Trabajos" (
    "id" TEXT NOT NULL,
    "archivo_url" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "estado" "EstadoTrabajo" NOT NULL DEFAULT 'EN_REVISION',
    "usuarioId" TEXT NOT NULL,
    "convocatoriaId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Trabajos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuarios_email_key" ON "Usuarios"("email");

-- CreateIndex
CREATE INDEX "Trabajos_usuarioId_idx" ON "Trabajos"("usuarioId");

-- CreateIndex
CREATE INDEX "Trabajos_convocatoriaId_idx" ON "Trabajos"("convocatoriaId");

-- CreateIndex
CREATE INDEX "Trabajos_estado_idx" ON "Trabajos"("estado");

-- AddForeignKey
ALTER TABLE "Trabajos" ADD CONSTRAINT "Trabajos_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Trabajos" ADD CONSTRAINT "Trabajos_convocatoriaId_fkey" FOREIGN KEY ("convocatoriaId") REFERENCES "Convocatorias"("id") ON DELETE CASCADE ON UPDATE CASCADE;
