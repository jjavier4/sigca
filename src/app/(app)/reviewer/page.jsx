import { requireSession } from '@/lib/auth-utils';
import { getAsignacionesDeRevisor } from '@/lib/data/asignaciones';
import { getCriteriosPorGrupo } from '@/lib/data/rubricas';
import MisAsignaciones from '@/components/ui/reviewer/misAsignaciones';

export default async function MisAsignacionesPage() {
  const session = await requireSession(['REVISOR', 'ADMIN']);
  const asignaciones = await getAsignacionesDeRevisor(session.user.id);

  const grupos = [
    ...new Set(
      asignaciones.filter((asignacion) => asignacion.activa).map((asignacion) => asignacion.trabajo.tipo)
    ),
  ];
  const criteriosPorGrupo = await getCriteriosPorGrupo(grupos);

  return <MisAsignaciones asignaciones={asignaciones} criteriosPorGrupo={criteriosPorGrupo} />;
}
