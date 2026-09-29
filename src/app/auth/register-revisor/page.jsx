import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import RegisterRevisorContent from './registerRevisorContent';

export default function RegisterRevisorPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 text-center">
            <Loader2 className="w-16 h-16 text-blue-600 mx-auto mb-4 animate-spin" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Registrando tu cuenta...</h2>
            <p className="text-gray-600">Por favor espera un momento</p>
          </div>
        </div>
      }
    >
      <RegisterRevisorContent />
    </Suspense>
  );
}