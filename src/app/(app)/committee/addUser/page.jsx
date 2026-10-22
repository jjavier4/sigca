import { requireSession } from '@/lib/auth-utils';
import FormUsuario from '@/components/ui/commite/formUsuario';

export default async function AddUserPage() {
  await requireSession(['COMITE']);

  return <FormUsuario />;
}
