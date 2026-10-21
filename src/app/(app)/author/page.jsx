import { requireSession } from '@/lib/auth-utils';
import { getTrabajosDeAutor } from '@/lib/data/trabajos';
import MisTrabajos from '@/components/ui/autor/misTrabajos';

export default async function DashboardAuthor() {
  const session = await requireSession(['AUTOR', 'ADMIN']);
  const trabajos = await getTrabajosDeAutor(session.user.id);

  return <MisTrabajos trabajos={trabajos} />;
}
