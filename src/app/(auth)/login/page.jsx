import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import AuthForm from '@/components/ui/auth/authform';

function rutaInterna(valor) {
  if (typeof valor !== 'string' || !valor.startsWith('/') || valor.startsWith('//') || valor.startsWith('/\\')) {
    return '/';
  }
  return valor;
}

export default async function LoginPage({ searchParams }) {
  const session = await getServerSession(authOptions);
  const { callbackUrl } = await searchParams;
  const destino = rutaInterna(callbackUrl);

  if (session) {
    redirect(destino);
  }

  return (
    <div className="w-full flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        <AuthForm callbackUrl={destino} />
      </div>
    </div>
  );
}
