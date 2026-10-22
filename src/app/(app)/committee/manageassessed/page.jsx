import { requireSession } from '@/lib/auth-utils';
import { getTrabajosConAsignaciones, getRevisoresConCarga } from '@/lib/data/evaluacion';
import GestionAsignaciones from '@/components/ui/commite/gestionAsignaciones';

export default async function ManageAssessedPage() {
  await requireSession(['COMITE', 'ADMIN']);
  const [trabajosConAsignaciones, revisores] = await Promise.all([
    getTrabajosConAsignaciones(),
    getRevisoresConCarga(),
  ]);

  return <GestionAsignaciones trabajosConAsignaciones={trabajosConAsignaciones} revisores={revisores} />;
}
