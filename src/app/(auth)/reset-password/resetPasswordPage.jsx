import { XCircle, AlertCircle } from 'lucide-react';
import ResetPasswordForm from '@/components/ui/auth/resetpasswordform';
import { consultarToken } from '@/lib/tokens';

const MENSAJE_INVALIDO =
  'El enlace de restablecimiento es inválido o ha expirado. Por favor solicita un nuevo enlace de restablecimiento de contraseña.';

async function validarToken(token) {
  if (!token) {
    return { valid: false, error: 'No se proporcionó un token de restablecimiento válido' };
  }
  const email = await consultarToken(token, 'RESTABLECIMIENTO');
  return email ? { valid: true, email } : { valid: false, error: MENSAJE_INVALIDO };
}

export default async function ResetPasswordPage({ searchParams }) {
  const { token } = await searchParams;
  const { valid, email, error } = await validarToken(token);

  if (!valid) {
    return (
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
          <XCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Enlace Inválido</h2>
          <p className="text-sm text-gray-500">{error}</p>
        </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Restablecer Contraseña</h1>
          </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="mb-6 bg-blue-50 p-4 rounded">
            <div className="flex items-start">
              <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 mr-2 flex-shrink-0" />
              
                <p className="text-sm text-gray-700">
                  <strong>Cuenta:</strong> {email}
                </p>
            </div>
          </div>

          <ResetPasswordForm token={token} />
        </div>
      </div>
    </div>
  );
}