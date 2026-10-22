import { requireSession } from '@/lib/auth-utils';
import FormUsuarioAdmin from '@/components/ui/admin/formUsuarioAdmin';

export default async function AdminAddUserPage() {
  await requireSession(['ADMIN']);

  return <FormUsuarioAdmin />;
}
