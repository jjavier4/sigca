import { requireSession } from '@/lib/auth-utils';
import InvitarRevisores from '@/components/ui/commite/invitarRevisores';

export default async function SendMailPage() {
  await requireSession(['COMITE', 'ADMIN']);

  return <InvitarRevisores />;
}
