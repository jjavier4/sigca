import 'server-only';
import { prisma } from '@/lib/db';

export async function getConvocatoriasPublicas() {
  const anioActual = new Date().getFullYear();

  return prisma.convocatorias.findMany({
    where: {
      id: { startsWith: `${anioActual}-` },
      activa: true,
    },
    select: {
      id: true,
      titulo: true,
      descripcion: true,
      fecha_inicio: true,
      fecha_cierre: true,
    },
    orderBy: { fecha_inicio: 'desc' },
  });
}

export async function getConvocatoriasDelComite() {
  const anioActual = new Date().getFullYear();

  return prisma.convocatorias.findMany({
    where: { id: { startsWith: `${anioActual}-` } },
    select: {
      id: true,
      titulo: true,
      descripcion: true,
      fecha_inicio: true,
      fecha_cierre: true,
      activa: true,
      _count: { select: { trabajos: true } },
    },
    orderBy: [{ activa: 'desc' }, { fecha_inicio: 'desc' }],
  });
}
