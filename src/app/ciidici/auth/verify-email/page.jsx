'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { CheckCircle, XCircle, Loader2, Mail } from 'lucide-react';
import Link from 'next/link';

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');

  const [status, setStatus] = useState('loading'); // loading, success, error, already_verified
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Token de verificación no válido');
      return;
    }

    verificarEmail();
  }, [token]);

  const verificarEmail = async () => {
    try {
      const response = await fetch(`/api/auth/verify-email?token=${token}`);
      const data = await response.json();

      if (response.ok) {
        if (data.alreadyVerified) {
          setStatus('already_verified');
          setMessage(data.message);
        } else {
          setStatus('success');
          setMessage(data.message);
        }
      } else {
        setStatus('error');
        setMessage(data.error || 'Error al verificar el correo');
      }
    } catch (error) {
      setStatus('error');
      setMessage('Error de conexión. Intenta nuevamente.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8">
        <div className="text-center">
          {status === 'loading' && (
            <>
              <Loader2 className="w-16 h-16 text-blue-600 mx-auto mb-4 animate-spin" />
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Verificando tu correo...
              </h2>
              <p className="text-gray-600">Por favor espera un momento</p>
            </>
          )}

          {status === 'success' && (
            <>
              <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                ¡Cuenta Verificada!
              </h2>
              <p className="text-gray-600 mb-6">{message}</p>
              
            </>
          )}

          {status === 'already_verified' && (
            <>
              <Mail className="w-16 h-16 text-blue-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Cuenta Ya Verificada
              </h2>
              <p className="text-gray-600 mb-6">{message}</p>
              
            </>
          )}

          {status === 'error' && (
            <>
              <XCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Error de Verificación
              </h2>
              <p className="text-gray-600 mb-6">{message}</p>
              <div className="space-y-3">                
                <p className="text-sm text-gray-500">
                  Si el enlace expiró, intenta iniciar sesión y recibirás un nuevo correo de verificación
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}