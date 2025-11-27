"use client";
import React, { useEffect, useState } from 'react';
import { FileText} from 'lucide-react';
import { useSession } from 'next-auth/react';
import Alert from '@/components/ui/utils/alert';
import CardInfo from '@/components/ui/cards/cardInfo';
import CardAssigment from '@/components/ui/reviewer/cardAssigment';
import CardRubric from '@/components/ui/reviewer/cardRubric';


export default function MisAsignaciones() {
  const { data: session } = useSession();
  const [asignaciones, setAsignaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('TODAS');
  const [showAlert, setShowAlert] = useState(false);
  const [selectedAsignacion, setSelectedAsignacion] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (session?.user?.id) {
      fetchAsignaciones();
    }
  }, [session]);

  const fetchAsignaciones = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/assignments/assignments-user?revisorId=${session.user.id}`);
      const data = await response.json();

      if (response.ok) {
        setAsignaciones(data.asignaciones);
      } else {
        setError(data.error);
      }
    } catch (error) {
      console.error('Error al cargar asignaciones:', error);
      setShowAlert(true);
      setError('Error al cargar las asignaciones');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitEvaluacion = async (evaluacion) => {
    try {
      setIsSubmitting(true);
      setError('');

      const response = await fetch('/api/assignments/assess', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(evaluacion)
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Evaluación enviada exitosamente');
        setSelectedAsignacion(null);
        await fetchAsignaciones();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.error);
        setTimeout(() => setError(''), 3000);
      }
    } catch (error) {
      console.error('Error al enviar evaluación:', error);
      setError('Error al enviar la evaluación');
      setTimeout(() => setError(''), 3000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const asignacionesFiltradas = asignaciones.filter((asig) => {
    if (filtroEstado === 'TODAS') return true;
    if (filtroEstado === 'ACTIVAS') return asig.activa;
    return asig.trabajo.estado === filtroEstado;
  });

  const getEstadisticas = () => {
    return {
      total: asignaciones.length,
      activas: asignaciones.filter(a => a.activa).length,
      enRevision: asignaciones.filter(a => a.trabajo.estado === 'EN_REVISION').length,
      evaluadas: asignaciones.filter(a => a.trabajo.estado !== 'EN_REVISION').length
    };
  };

  const stats = getEstadisticas();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando asignaciones...</p>
        </div>
      </div>
    );
  }

  // Vista de evaluación (PDF + Rúbrica)
  if (selectedAsignacion) {
    return (
      <div className="h-screen bg-gray-100 flex flex-col">
        {/* Alertas */}
        <Alert
          type={error ? 'error' : 'success'}
          message={error || success}
          isVisible={error || success}
          onClose={() => {
            setTimeout(() => { setShowAlert(!showAlert); }, 3000)
          }}
        />

        {/* Contenedor principal dividido */}
        <div className="flex-1 flex overflow-hidden">
          {/* Panel izquierdo: PDF */}
          <div className="w-4/7 p-4 flex flex-col">
            <div className="bg-gradient-to-r bg-blue-800 p-4 rounded-t-lg">
              <h2 className="text-xl font-bold text-white mb-1">Documento PDF</h2>
              <p className="text-blue-100 text-sm">
                Versión {selectedAsignacion.trabajo.version}
              </p>
            </div>
            <div className="flex-1 bg-white rounded-b-lg overflow-hidden">
              <iframe
                src={selectedAsignacion.trabajo.archivo_url}
                className="w-full h-full"
                title="PDF Viewer"
              />
            </div>
          </div>

          {/* Panel derecho: Rúbrica */}
          <div className="w-3/7 flex flex-col p-4">
            <CardRubric
              asignacion={selectedAsignacion}
              onSubmit={handleSubmitEvaluacion}
              isLoading={isSubmitting}
              onCancel={() => setSelectedAsignacion(null)}
            />
          </div>
        </div>
      </div>
    );
  }

  // Vista de lista de asignaciones
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Mis Asignaciones</h1>
          <p className="text-gray-600">Trabajos asignados para revisión</p>
        </div>

        {/* Alertas */}
        <Alert
          type={error ? 'error' : 'success'}
          message={error || success}
          isVisible={error || success}
          onClose={() => {
            setTimeout(() => { setShowAlert(!showAlert); }, 3000)
          }}
        />

        {/* Estadísticas Y  filtros*/}

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <CardInfo title="Total de Trabajos" stats={stats.total} classN="border-gray-400" onclick={() => setFiltroEstado('TODAS')} select={filtroEstado === 'TODAS'} />
          <CardInfo title="Activas" stats={stats.enRevision} classN="border-blue-400" onclick={() => setFiltroEstado('ACTIVAS')} select={filtroEstado === 'ACTIVAS'} />
          <CardInfo title="En revision" stats={stats.aceptados} classN="border-green-400" onclick={() => setFiltroEstado('EN_REVISION')} select={filtroEstado === 'EN_REVISION'} />
          <CardInfo title="Evaluadas" stats={stats.cambios} classN="border-orange-400" onclick={() => setFiltroEstado('EVALUADAS')} select={filtroEstado === 'EVALUADAS'} />
        </div>

        

        {/* Grid de Cards */}
        {asignacionesFiltradas.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <FileText className="mx-auto mb-4 text-gray-400" size={64} />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No hay asignaciones</h3>
            <p className="text-gray-600">No tienes trabajos asignados en este momento</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {asignacionesFiltradas.map((asignacion) => (
              <CardAssigment
                key={asignacion.id}
                asignacion={asignacion}
                onSelect={setSelectedAsignacion}
                isSelected={selectedAsignacion?.id === asignacion.id}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}