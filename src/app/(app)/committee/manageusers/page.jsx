import { requireSession } from '@/lib/auth-utils';
import { getUsuariosPorRoles } from '@/lib/data/usuarios';
import GestionUsuarios from '@/components/ui/commite/gestionUsuarios';

export default async function ManageUsersPage() {
  await requireSession(['COMITE']);
  const usuarios = await getUsuariosPorRoles(['REVISOR', 'AUTOR']);

  return <GestionUsuarios usuarios={usuarios} />;
}
