import 'server-only';
import { prisma } from '@/lib/db';
import { GRUPOS_RUBRICA } from '@/lib/validation';

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

export async function getRubricasDelComite() {
  const [criteriosPorGrupo, asignacionesActivas] = await Promise.all([
    getCriteriosPorGrupo(GRUPOS_RUBRICA),
    Promise.all(
      GRUPOS_RUBRICA.map((grupo) =>
        prisma.asignaciones.count({
          where: { activa: true, trabajo: { tipo: grupo, convocatoria: { activa: true } } },
        })
      )
    ),
  ]);

  return Object.fromEntries(
    GRUPOS_RUBRICA.map((grupo, indice) => [
      grupo,
      { criterios: criteriosPorGrupo[grupo], asignacionesActivas: asignacionesActivas[indice] },
    ])
  );
}
