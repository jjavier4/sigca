import { requireSession } from '@/lib/auth-utils';
import { getTrabajosCalificados } from '@/lib/data/evaluacion';
import GestionTrabajosCalificados from '@/components/ui/commite/gestionTrabajosCalificados';

export default async function WorksAssessedPage() {
  await requireSession(['COMITE', 'ADMIN']);
  const trabajos = await getTrabajosCalificados();

  return <GestionTrabajosCalificados trabajos={trabajos} anio={new Date().getFullYear()} />;
}
