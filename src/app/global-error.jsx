'use client';

export default function ErrorGlobal({ reset }) {
  return (
    <html lang="es">
      <body className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="max-w-md rounded-lg border border-red-200 bg-red-50 p-6 text-center">
          <p className="font-medium text-red-800">Ocurrió un error inesperado en la aplicación.</p>
          <button
            type="button"
            onClick={() => reset()}
            className="mt-4 rounded-lg bg-red-600 px-4 py-2 font-semibold text-white hover:bg-red-700"
          >
            Reintentar
          </button>
        </div>
      </body>
    </html>
  );
}
