import { requireSession } from '@/lib/auth-utils';
import { getTrabajosParaAnalisis } from '@/lib/data/evaluacion';
import GestionAnalisis from '@/components/ui/commite/gestionAnalisis';

export default async function AssessedIAPage() {
  await requireSession(['COMITE', 'ADMIN']);
  const { pendientes, evaluados } = await getTrabajosParaAnalisis();

  return <GestionAnalisis trabajosPendientes={pendientes} trabajosEvaluados={evaluados} />;
}
