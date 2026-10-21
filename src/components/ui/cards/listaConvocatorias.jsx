'use client';
import React, { useMemo, useState } from 'react';
import { FileText } from 'lucide-react';
import { CardConvocatorie, ModalConvocatorie } from '@/components/ui/cards/cardConvocatorie';
import Alert from '@/components/ui/utils/alert';
import useAccion from '@/hooks/useAccion';
import { subirTrabajo } from '@/actions/trabajos';

export default function ListaConvocatorias({ convocatorias, usuario }) {
  const [seleccionada, setSeleccionada] = useState(null);
  const [filtro, setFiltro] = useState('todas');
  const { ejecutar, pendiente, alerta } = useAccion();
  const esAutor = usuario?.rol === 'AUTOR';

  const convocatoriasFiltradas = useMemo(() => {
    return convocatorias.filter((convocatoria) => {
      const ahora = new Date();
      const inicio = new Date(convocatoria.fecha_inicio);
      const cierre = new Date(convocatoria.fecha_cierre);

      if (filtro === 'abiertas') return ahora >= inicio && ahora <= cierre;
      if (filtro === 'cerradas') return ahora > cierre;
      return true;
    });
  }, [convocatorias, filtro]);

  const enviarPropuesta = (formData) => ejecutar(() => subirTrabajo(formData));

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <Alert {...alerta} />
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Convocatorias Disponibles
          </h1>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex gap-3">
            <button
              onClick={() => setFiltro('todas')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${filtro === 'todas'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
              Todas ({convocatorias.length})
            </button>
            <button
              onClick={() => setFiltro('abiertas')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${filtro === 'abiertas'
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
              Abiertas
            </button>
            <button
              onClick={() => setFiltro('cerradas')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${filtro === 'cerradas'
                ? 'bg-gray-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
              Cerradas
            </button>
          </div>
        </div>

        {convocatoriasFiltradas.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <FileText className="mx-auto mb-4 text-gray-400" size={64} />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              No hay convocatorias disponibles
            </h3>
            <p className="text-gray-600">
              {filtro === 'abiertas'
                ? 'No hay convocatorias abiertas en este momento'
                : filtro === 'cerradas'
                  ? 'No hay convocatorias cerradas'
                  : 'Aún no se han publicado convocatorias'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {convocatoriasFiltradas.map((convocatoria) => (
              <CardConvocatorie
                key={convocatoria.id}
                convocatoria={convocatoria}
                onClick={setSeleccionada}
                esAutor={esAutor}
              />
            ))}
          </div>
        )}
      </div>

      {seleccionada && esAutor && (
        <ModalConvocatorie
          key={seleccionada.id}
          convocatoria={seleccionada}
          onClose={() => setSeleccionada(null)}
          onEnviar={enviarPropuesta}
          pendiente={pendiente}
        />
      )}
    </div>
  );
}
