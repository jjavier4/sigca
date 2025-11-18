-- CreateTable
CREATE TABLE "Comentarios" (
    "id" TEXT NOT NULL,
    "contenido" TEXT NOT NULL,
    "trabajoId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Comentarios_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Comentarios_trabajoId_idx" ON "Comentarios"("trabajoId");

-- AddForeignKey
ALTER TABLE "Comentarios" ADD CONSTRAINT "Comentarios_trabajoId_fkey" FOREIGN KEY ("trabajoId") REFERENCES "Trabajos"("id") ON DELETE CASCADE ON UPDATE CASCADE;
