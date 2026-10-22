import { requireSession } from '@/lib/auth-utils';
import { getTrabajosSinAsignar, getRevisoresConCarga } from '@/lib/data/evaluacion';
import AsignarRevisores from '@/components/ui/commite/asignarRevisores';

export default async function AssignConvocatoriePage() {
  await requireSession(['COMITE', 'ADMIN']);
  const [trabajosSinAsignar, revisores] = await Promise.all([
    getTrabajosSinAsignar(),
    getRevisoresConCarga(),
  ]);

  return <AsignarRevisores trabajosSinAsignar={trabajosSinAsignar} revisores={revisores} />;
}
