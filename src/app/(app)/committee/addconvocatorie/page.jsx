import { requireSession } from '@/lib/auth-utils';
import { href } from '@/utils/route';
import FormConvocatoria from '@/components/ui/commite/formConvocatoria';

export default async function AddConvocatoriePage() {
  const session = await requireSession(['COMITE', 'ADMIN']);

  return <FormConvocatoria rutaPanel={href(session.user.rol)} />;
}
