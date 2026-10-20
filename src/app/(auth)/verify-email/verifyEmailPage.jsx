import { CheckCircle, XCircle, Mail } from 'lucide-react';

const ESTADOS = {
  success: {
    Icon: CheckCircle,
    color: 'text-green-600',
    titulo: '¡Cuenta Verificada!',
  },
  already_verified: {
    Icon: Mail,
    color: 'text-blue-600',
    titulo: 'Cuenta Ya Verificada',
  },
  error: {
    Icon: XCircle,
    color: 'text-red-600',
    titulo: 'Error de Verificación',
  },
};

async function verificarEmail(token) {
  if (!token) {
    return { status: 'error', message: 'Token de verificación no válido' };
  }

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/verify-email?token=${encodeURIComponent(token)}`,
      { cache: 'no-store' }
    );
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      return { status: 'error', message: data.error || 'Error al verificar el correo' };
    }

    return {
      status: data.alreadyVerified ? 'already_verified' : 'success',
      message: data.message,
    };
  } catch {
    return { status: 'error', message: 'Error de conexión. Intenta nuevamente.' };
  }
}

export default async function VerifyEmailPage({ searchParams }) {
  const { token } = await searchParams;
  const { status, message } = await verificarEmail(token);
  const { Icon, color, titulo } = ESTADOS[status];

  return (
    <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8">
      <div className="text-center">
        <Icon className={`w-16 h-16 ${color} mx-auto mb-4`} />
        <h2 className="text-2xl font-bold text-gray-800 mb-2">{titulo}</h2>
        <p className="text-gray-600 mb-6">{message}</p>

        {status === 'error' && (
          <p className="text-sm text-gray-500">
            Si el enlace expiró, intenta iniciar sesión y recibirás un nuevo correo de verificación
          </p>
        )}
      </div>
    </div>
  );
}