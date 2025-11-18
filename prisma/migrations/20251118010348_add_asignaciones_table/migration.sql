-- CreateTable
CREATE TABLE "Asignaciones" (
    "id" TEXT NOT NULL,
    "activa" BOOLEAN NOT NULL DEFAULT true,
    "trabajoId" TEXT NOT NULL,
    "revisorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "closeAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Asignaciones_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Asignaciones_trabajoId_idx" ON "Asignaciones"("trabajoId");

-- CreateIndex
CREATE INDEX "Asignaciones_revisorId_idx" ON "Asignaciones"("revisorId");

-- CreateIndex
CREATE INDEX "Asignaciones_activa_idx" ON "Asignaciones"("activa");

-- CreateIndex
CREATE UNIQUE INDEX "Asignaciones_trabajoId_revisorId_key" ON "Asignaciones"("trabajoId", "revisorId");

-- AddForeignKey
ALTER TABLE "Asignaciones" ADD CONSTRAINT "Asignaciones_trabajoId_fkey" FOREIGN KEY ("trabajoId") REFERENCES "Trabajos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Asignaciones" ADD CONSTRAINT "Asignaciones_revisorId_fkey" FOREIGN KEY ("revisorId") REFERENCES "Usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;
