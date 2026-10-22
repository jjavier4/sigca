import { requireSession } from '@/lib/auth-utils';
import { getUsuariosPorRoles } from '@/lib/data/usuarios';
import GestionUsuariosAdmin from '@/components/ui/admin/gestionUsuariosAdmin';

export default async function AdminManageUsersPage() {
  await requireSession(['ADMIN']);
  const usuarios = await getUsuariosPorRoles(['COMITE', 'REVISOR']);

  return <GestionUsuariosAdmin usuarios={usuarios} />;
}
