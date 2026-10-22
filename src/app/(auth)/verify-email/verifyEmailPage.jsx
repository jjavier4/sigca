import { XCircle } from 'lucide-react';
import { consultarToken } from '@/lib/tokens';
import VerificarCuenta from '@/components/ui/auth/verificarCuenta';

export default async function VerifyEmailPage({ searchParams }) {
  const { token } = await searchParams;
  const email = await consultarToken(token, 'VERIFICACION');

  if (!email) {
    return (
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8">
        <div className="text-center">
          <XCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Error de Verificación</h2>
          <p className="text-gray-600 mb-6">El enlace de verificación es inválido o ha expirado</p>
          <p className="text-sm text-gray-500">
            Si el enlace expiró, intenta iniciar sesión y recibirás un nuevo correo de verificación
          </p>
        </div>
      </div>
    );
  }

  return <VerificarCuenta token={token} email={email} />;
}
