'use client';

export default function ErrorDePagina({ reset }) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md text-center">
        <p className="text-red-800 font-medium">Ocurrió un error al cargar esta página.</p>
        <button
          type="button"
          onClick={() => reset()}
          className="mt-4 rounded-lg bg-red-600 px-4 py-2 font-semibold text-white transition-colors hover:bg-red-700"
        >
          Reintentar
        </button>
      </div>
    </div>
  );
}
