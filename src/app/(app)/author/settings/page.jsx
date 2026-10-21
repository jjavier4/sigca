import { notFound } from 'next/navigation';
import { requireSession } from '@/lib/auth-utils';
import { getPerfil } from '@/lib/data/usuarios';
import FormPerfil from '@/components/ui/autor/formPerfil';

export default async function PerfilPage() {
  const session = await requireSession(['AUTOR', 'ADMIN']);
  const perfil = await getPerfil(session.user.id);

  if (!perfil) notFound();

  return <FormPerfil numeroControlInicial={perfil.numero_control ?? ''} />;
}
