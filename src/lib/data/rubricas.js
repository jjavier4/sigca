import 'server-only';
import { prisma } from '@/lib/db';

export async function getCriteriosPorGrupo(grupos) {
  if (grupos.length === 0) return {};

  const criterios = await prisma.criteriosEvaluacion.findMany({
    where: { grupo: { in: grupos } },
    orderBy: { createdAt: 'asc' },
    select: {
      id: true,
      nombre: true,
      descripcion: true,
      grupo: true,
      descripcion_puntaje: true,
    },
  });

  return Object.fromEntries(
    grupos.map((grupo) => [grupo, criterios.filter((criterio) => criterio.grupo === grupo)])
  );
}
