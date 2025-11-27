"use client";
import React, { useEffect, useState } from 'react';
import { Calendar, FileText, Clock, Tag, ChevronRight } from 'lucide-react';
import { CardConvocatorie, ModalConvocatorie } from '@/components/ui/cards/cardConvocatorie';
import { useSession } from 'next-auth/react';
import Loading from '@/components/ui/utils/loading';
import LoadingError from '@/components/ui/utils/loadingError';
export default function ViewConvocatorias() {
  const { data: session, status } = useSession();
  const [convocatorias, setConvocatorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorLoading, setErrorLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedConvocatoria, setSelectedConvocatoria] = useState(null);
  const [filtro, setFiltro] = useState('todas'); // todas, abiertas, cerradas

  useEffect(() => {
    fetchConvocatorias();
  }, []);

  const fetchConvocatorias = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/convocatories/findall2');
      const data = await response.json();

      if (response.ok) {
        setConvocatorias(data.convocatorias);
      } else {
        setError(data.error);
      }
    } catch (error) {
      console.error('Error al cargar convocatorias:', error);
      setErrorLoading(true);
    } finally {
      setLoading(false);
    }
  };

  const convocatoriasFiltradas = convocatorias.filter(conv => {
    const now = new Date();
    const inicio = new Date(conv.fecha_inicio);
    const cierre = new Date(conv.fecha_cierre);

    if (filtro === 'abiertas') {
      return now >= inicio && now <= cierre;
    } else if (filtro === 'cerradas') {
      return now > cierre;
    }
    return true;
  });

  if (loading) {
    return (
      <Loading />
    )
  }

  if (errorLoading) {
    return (
      <LoadingError error={'Error al cargar convocatorias '} />
    );
  }

  const sendFile = async (dataConvocatoria,file, convocatoriaId, userId) => {
    const formData = new FormData();
    formData.append('dataConvocatoria',  JSON.stringify(dataConvocatoria));
    formData.append('file', file);
    formData.append('convocatoriaId', convocatoriaId);
    formData.append('userId', userId);

    const response = await fetch('/api/works/upload', {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();

    if (response.ok) {
      return true
    }
    return data;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Convocatorias Disponibles
          </h1>
        </div>

        {/* Filtros */}
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

        {/* Grid de Cards */}
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
                onClick={setSelectedConvocatoria}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {selectedConvocatoria && (
        <ModalConvocatorie
          convocatoria={selectedConvocatoria}
          onClose={() => setSelectedConvocatoria(null)}
          user={session ? session.user : null}
          sendFile={sendFile}
        />
      )}
    </div>
  );
}