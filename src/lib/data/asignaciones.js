import 'server-only';
import { prisma } from '@/lib/db';

export async function getAsignacionesDeRevisor(revisorId) {
  const anioActual = new Date().getFullYear();

  return prisma.asignaciones.findMany({
    where: {
      revisorId,
      id: { startsWith: `${anioActual}-` },
      trabajo: { convocatoria: { activa: true } },
    },
    select: {
      id: true,
      activa: true,
      createdAt: true,
      trabajo: {
        select: {
          id: true,
          titulo: true,
          tipo: true,
          convocatoria: { select: { titulo: true } },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
}
