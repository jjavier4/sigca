'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Lock, CheckCircle, Check, X, Loader2 } from 'lucide-react';
import FormLabelInput from '@/components/ui/form/FormLabelInput';
import Alert from '@/components/ui/utils/alert';
import { actualizarPassword } from '@/actions/auth';

const LOGIN_PATH = '/login';
const MIN_LENGTH = 6;
const lockIcon = <Lock className="absolute left-3 top-3 text-black" size={20} />;

function Requisito({ cumple, children }) {
  return (
    <li className="flex items-center">
      <span className={`mr-2 ${cumple ? 'text-green-600' : 'text-red-400'}`}>
        {cumple ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
      </span>
      {children}
    </li>
  );
}

export default function ResetPasswordForm({ token }) {
  const router = useRouter();
  const [form, setForm] = useState({ password: '', confirmPassword: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const longitudOk = form.password.length >= MIN_LENGTH;
  const coinciden = !!form.password && form.password === form.confirmPassword;

  useEffect(() => {
    if (!error) return;
    const timer = setTimeout(() => setError(''), 5000);
    return () => clearTimeout(timer);
  }, [error]);

  useEffect(() => {
    if (!success) return;
    const timer = setTimeout(() => router.replace(LOGIN_PATH), 3000);
    return () => clearTimeout(timer);
  }, [success, router]);

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!coinciden) {
      setError('Las contraseñas no coinciden');
      return;
    }
    if (!longitudOk) {
      setError(`La contraseña debe tener al menos ${MIN_LENGTH} caracteres`);
      return;
    }

    setIsLoading(true);
    try {
      const resultado = await actualizarPassword({ token, ...form });

      if (!resultado.ok) {
        setError(resultado.error || 'Error al restablecer la contraseña');
        return;
      }

      setForm({ password: '', confirmPassword: '' });
      setSuccess(resultado.message);
    } catch {
      setError('Error de conexión. Intenta nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Alert type={error ? 'error' : 'success'} message={error || success} isVisible={!!(error || success)} />

      <form onSubmit={handleSubmit} className="space-y-6">
        <FormLabelInput
          title="Nueva Contraseña"
          children={lockIcon}
          type="password"
          value={form.password}
          change={update('password')}
          placeholder="••••••••"
          required
        />

        <FormLabelInput
          title="Confirmar Nueva Contraseña"
          children={lockIcon}
          type="password"
          value={form.confirmPassword}
          change={update('confirmPassword')}
          placeholder="••••••••"
          required
        />

        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <p className="text-sm text-gray-700 font-semibold mb-2">Requisitos de la contraseña:</p>
          <ul className="text-sm text-gray-600 space-y-1">
            <Requisito cumple={longitudOk}>Mínimo {MIN_LENGTH} caracteres</Requisito>
            <Requisito cumple={coinciden}>Las contraseñas coinciden</Requisito>
          </ul>
        </div>

        <button
          type="submit"
          disabled={isLoading || !!success}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 rounded-lg transition-all duration-300 flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Restableciendo
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
        <Link href={LOGIN_PATH} className="text-blue-600 hover:text-blue-700 font-medium text-sm">
          Volver al inicio de sesión
        </Link>
      </div>
    </>
  );
}