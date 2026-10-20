import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import VerifyEmailPage from './VerifyEmailPage';

export default function Page({ searchParams }) {
  return (
    <Suspense
      fallback={
        <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 text-center">
          <Loader2 className="w-16 h-16 text-blue-600 mx-auto mb-4 animate-spin" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Verificando tu correo...</h2>
          <p className="text-gray-600">Por favor espera un momento</p>
        </div>
      }
    >
      <VerifyEmailPage searchParams={searchParams} />
    </Suspense>
  );
}