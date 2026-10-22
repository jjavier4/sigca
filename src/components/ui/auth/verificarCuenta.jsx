'use client';
import { useState } from 'react';
import Link from 'next/link';
import { CheckCircle, Mail, XCircle, Loader2 } from 'lucide-react';
import useAccion from '@/hooks/useAccion';
import { verificarCuenta } from '@/actions/auth';

export default function VerificarCuenta({ token, email }) {
  const [resultado, setResultado] = useState(null);
  const { ejecutar, pendiente } = useAccion();

  const activar = async () => {
    setResultado(await ejecutar(() => verificarCuenta(token)));
  };

  const Icono = resultado ? (resultado.ok ? CheckCircle : XCircle) : Mail;
  const color = resultado ? (resultado.ok ? 'text-green-600' : 'text-red-600') : 'text-blue-600';
  const titulo = resultado ? (resultado.ok ? '¡Cuenta Verificada!' : 'Error de Verificación') : 'Activa tu cuenta';
  const mensaje = resultado
    ? resultado.ok ? resultado.message : resultado.error
    : `Confirma la activación de la cuenta ${email}.`;

  return (
    <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8">
      <div className="text-center">
        <Icono className={`w-16 h-16 ${color} mx-auto mb-4`} />
        <h2 className="text-2xl font-bold text-gray-800 mb-2">{titulo}</h2>
        <p className="text-gray-600 mb-6">{mensaje}</p>

        {!resultado && (
          <button
            type="button"
            onClick={activar}
            disabled={pendiente}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 rounded-lg transition-all duration-300 inline-flex items-center justify-center gap-2"
          >
            {pendiente && <Loader2 size={18} className="animate-spin" />}
            {pendiente ? 'Activando...' : 'Activar mi cuenta'}
          </button>
        )}

        {resultado?.ok && (
          <Link
            href="/login"
            className="inline-block w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-all duration-300"
          >
            Iniciar sesión
          </Link>
        )}

        {resultado && !resultado.ok && (
          <p className="text-sm text-gray-500">
            Si el enlace expiró, intenta iniciar sesión y recibirás un nuevo correo de verificación
          </p>
        )}
      </div>
    </div>
  );
}
