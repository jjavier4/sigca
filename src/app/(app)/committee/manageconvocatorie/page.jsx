import { requireSession } from '@/lib/auth-utils';
import { getConvocatoriasDelComite } from '@/lib/data/convocatorias';
import GestionConvocatorias from '@/components/ui/commite/gestionConvocatorias';

export default async function ManageConvocatoriesPage() {
  await requireSession(['COMITE', 'ADMIN']);
  const convocatorias = await getConvocatoriasDelComite();

  return <GestionConvocatorias convocatorias={convocatorias} />;
}
