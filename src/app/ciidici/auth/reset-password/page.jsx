'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Lock, Loader2, XCircle, CheckCircle, AlertCircle,Check,X } from 'lucide-react';
import FormLabelInput from '@/components/ui/form/FormLabelInput';
import Alert from '@/components/ui/utils/alert';

export default function RestablecerPasswordPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');

  const [isValidatingToken, setIsValidatingToken] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [emailFromToken, setEmailFromToken] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [passwordData, setPasswordData] = useState({
    password: '',
    confirmPassword: '',
  });

  useEffect(() => {
    if (!token) {
      setIsValidatingToken(false);
      setTokenValid(false);
      setError('No se proporcionó un token de restablecimiento válido');
      return;
    }

    validarTokenRestablecimiento();
  }, [token]);

  const validarTokenRestablecimiento = async () => {
    try {
      const response = await fetch(`/api/auth/validate-token-time?token=${token}`);
      const data = await response.json();

      if (response.ok && data.valid) {
        setTokenValid(true);
        setEmailFromToken(data.email);
      } else {
        setTokenValid(false);
        setError(data.error || 'El enlace de restablecimiento es inválido o ha expirado');
      }
    } catch (err) {
      setTokenValid(false);
      setError('Error al validar el enlace de restablecimiento');
    } finally {
      setIsValidatingToken(false);
    }
  };

  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError('');
        setSuccess('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    if (passwordData.password !== passwordData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      setIsLoading(false);
      return;
    }

    if (passwordData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/update-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          password: passwordData.password,
          confirmPassword: passwordData.confirmPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.expired) {
          setError('El enlace ha expirado. Por favor solicita un nuevo enlace de restablecimiento.');
        } else {
          setError(data.error || 'Error al restablecer la contraseña');
        }
        throw new Error(data.error || 'Error al restablecer la contraseña');
      }

      setSuccess('¡Contraseña restablecida exitosamente! Redirigiendo al inicio de sesión...');

      setPasswordData({
        password: '',
        confirmPassword: '',
      });

      setTimeout(() => {
        router.push('/ciidici/auth');
      }, 3000);

    } catch (err) {
      console.error('Error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isValidatingToken) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 flex items-center justify-center py-12 px-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
          <Loader2 color="blue" className="w-16 h-16  mx-auto mb-4 animate-spin" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Validando invitación...
          </h2>
          <p className="text-gray-600">Por favor espera un momento</p>
        </div>
      </div>
    );
  }


  if (!tokenValid) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 flex items-center justify-center py-12 px-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
          <XCircle color='red' className="w-16 h-16 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Invitación Inválida
          </h2>
          <div className="space-y-3">
            <p className="text-sm text-gray-500">
              El enlace de restablecimiento es inválido o ha expirado. Por favor solicita un nuevo enlace de restablecimiento de contraseña.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Restablecer Contraseña</h1>
          <p className="text-blue-200">Crea una nueva contraseña para tu cuenta</p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="mb-6 bg-blue-50  p-4 rounded">
            <div className="flex items-start">
              <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 mr-2 flex-shrink-0" />
              <div>
                <p className="text-sm text-gray-700">
                  <strong>Cuenta:</strong> {emailFromToken}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Ingresa tu nueva contraseña para restablecer el acceso a tu cuenta
                </p>
              </div>
            </div>
          </div>

          <Alert
            type={error ? 'error' : 'success'}
            message={error || success}
            isVisible={error || success}
          />

          <form onSubmit={handleSubmit} className="space-y-6">
            <FormLabelInput
              title="Nueva Contraseña"
              children={<Lock className="absolute left-3 top-3 text-black" size={20} />}
              type="password"
              value={passwordData.password}
              change={(e) => setPasswordData({ ...passwordData, password: e.target.value })}
              placeholder="••••••••"
              required={true}
            />

            <FormLabelInput
              title="Confirmar Nueva Contraseña"
              children={<Lock className="absolute left-3 top-3 text-black" size={20} />}
              type="password"
              value={passwordData.confirmPassword}
              change={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
              placeholder="••••••••"
              required={true}
            />

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <p className="text-sm text-gray-700 font-semibold mb-2">
                Requisitos de la contraseña:
              </p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li className="flex items-center">
                  <span className={`mr-2 ${passwordData.password.length >= 6 ? 'text-green-600' : 'text-red-400'}`}>
                    {passwordData.password.length >= 6 ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                  </span>
                  Mínimo 6 caracteres
                </li>
                <li className="flex items-center">
                  <span className={`mr-2 ${passwordData.password === passwordData.confirmPassword && passwordData.password ? 'text-green-600' : 'text-red-400'}`}>
                    {passwordData.password === passwordData.confirmPassword && passwordData.password ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                  </span>
                  Las contraseñas coinciden
                </li>
              </ul>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 rounded-lg transition-all duration-300 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  Restableciendo...
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5" />
                  Restablecer Contraseña
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => router.push('/ciidici/auth')}
              className="text-blue-600 hover:text-blue-700 font-medium text-sm"
            >
              Volver al inicio de sesión
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
