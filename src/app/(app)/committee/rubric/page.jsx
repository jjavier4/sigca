import { requireSession } from '@/lib/auth-utils';
import { getRubricasDelComite } from '@/lib/data/rubricas';
import GestionRubricas from '@/components/ui/commite/gestionRubricas';

export default async function RubricPage() {
  await requireSession(['COMITE', 'ADMIN']);
  const rubricas = await getRubricasDelComite();

  return <GestionRubricas rubricas={rubricas} />;
}
