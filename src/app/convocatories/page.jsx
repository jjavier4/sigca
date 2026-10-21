import { getSession } from '@/lib/auth-utils';
import { getConvocatoriasPublicas } from '@/lib/data/convocatorias';
import ListaConvocatorias from '@/components/ui/cards/listaConvocatorias';

export default async function ViewConvocatorias() {
  const [session, convocatorias] = await Promise.all([getSession(), getConvocatoriasPublicas()]);
  const usuario = session?.user ? { rol: session.user.rol } : null;

  return <ListaConvocatorias convocatorias={convocatorias} usuario={usuario} />;
}
