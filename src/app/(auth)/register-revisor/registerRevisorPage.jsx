import { XCircle } from 'lucide-react';
import RegisterRevisorForm from '@/components/ui/auth/registerformrevisor';
import { consultarToken } from '@/lib/tokens';

const MENSAJE_INVALIDO =
  'El enlace de invitación puede haber expirado o ser inválido. Por favor contacte al comité organizador para solicitar una nueva invitación.';

async function validarInvitacion(token) {
  if (!token) {
    return { valid: false, error: 'No se proporcionó un token de invitación válido.' };
  }
  const email = await consultarToken(token, 'INVITACION');
  return email ? { valid: true, email } : { valid: false, error: MENSAJE_INVALIDO };
}

export default async function RegisterRevisorPage({ searchParams }) {
  const { token } = await searchParams;
  const { valid, email, error } = await validarInvitacion(token);

  if (!valid) {
    return (
      
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
          <XCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Invitación Inválida</h2>
          <p className="text-sm text-gray-500">{error}</p>
        </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Registro de Revisor</h1>
          <p className="text-pink-100">CIIDiCI - Instituto Tecnológico de Toluca</p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="mb-6 bg-blue-50 p-4 rounded">
            <p className="text-sm text-gray-700">
              <strong>Correo de invitación:</strong> {email}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Complete el formulario para registrarse como revisor académico
            </p>
          </div>

          <RegisterRevisorForm token={token} email={email} />
        </div>
      </div>
    </div>
  );
}