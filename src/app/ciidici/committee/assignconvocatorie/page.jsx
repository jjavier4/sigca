"use client";
import React, { useEffect, useState } from 'react';
import { FileText, User, UserCheck, Users } from 'lucide-react';
import { CardNotAssignment, CardReviewer } from '@/components/ui/cards/cardAssignment';
import ModalComfirm from '@/components/ui/utils/modalComfirm';
import Alert from '@/components/ui/utils/alert';
import Loading from '@/components/ui/utils/loading';
import LoadError from '@/components/ui/utils/loadingError';

// Componente Principal
export default function AsignarRevisores() {
  const [trabajosSinAsignar, setTrabajosSinAsignar] = useState([]);
  const [revisores, setRevisores] = useState([]);
  const [asignacionesPorTrabajo, setAsignacionesPorTrabajo] = useState({});
  const [loading, setLoading] = useState(true);
  const [errorLoading, setErrorLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedTrabajo, setSelectedTrabajo] = useState(null);
  const [selectedRevisores, setSelectedRevisores] = useState([]); // Arreglo de revisores
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Obtener trabajos sin asignar
      const trabajosResponse = await fetch('/api/assignments/works-not-assign');
      const trabajosData = await trabajosResponse.json();

      if (trabajosResponse.ok) {
        setTrabajosSinAsignar(trabajosData.trabajos);

        // Contar asignaciones por trabajo
        const conteos = {};
        trabajosData.trabajos.forEach(trabajo => {
          conteos[trabajo.id] = trabajo._count?.asignaciones || 0;
        });
        setAsignacionesPorTrabajo(conteos);
      } else {
        setError(trabajosData.error);
        setErrorLoading(true);
      }

      // Obtener revisores con carga de trabajo
      const revisoresResponse = await fetch('/api/assignments/users-reviewers');
      const revisoresData = await revisoresResponse.json();

      if (revisoresResponse.ok) {
        setRevisores(revisoresData.revisores);
      } else {
        setError(revisoresData.error);
      }

    } catch (error) {
      console.error('Error al cargar datos:', error);
      setError('Error al cargar los datos del sistema');
      setErrorLoading(true);
    } finally {
      setLoading(false);
    }
  };

  const handleAsignarClick = () => {
    if (!selectedTrabajo) {
      setError('Debes seleccionar un trabajo');
      setTimeout(() => setError(''), 3000);
      return;
    }

    if (selectedRevisores.length === 0) {
      setError('Debes seleccionar al menos un revisor');
      setTimeout(() => setError(''), 3000);
      return;
    }

    // Verificar que no haya revisores duplicados
    const revisoresUnicos = new Set(selectedRevisores.map(r => r.id));
    if (revisoresUnicos.size !== selectedRevisores.length) {
      setError('Has seleccionado el mismo revisor más de una vez');
      setTimeout(() => setError(''), 3000);
      return;
    }

    setShowConfirmModal(true);
  };

  const handleConfirmAsignacion = async () => {
    try {
      setIsAssigning(true);

      const response = await fetch('/api/assignments/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          trabajoId: selectedTrabajo.id,
          revisoresIds: selectedRevisores.map(r => r.id) // Enviar arreglo de IDs
        })
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(`Asignaciones creadas exitosamente para ${selectedRevisores.length} revisor(es)`);
        setShowConfirmModal(false);
        setSelectedTrabajo(null);
        setSelectedRevisores([]);
        await fetchData();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.error);
        setTimeout(() => setError(''), 5000);
        setShowConfirmModal(false);
      }

    } catch (error) {
      console.error('Error al crear asignaciones:', error);
      setError('Error al crear las asignaciones');
      setTimeout(() => setError(''), 3000);
    } finally {
      setIsAssigning(false);
    }
  };

  const handleSelectRevisor = (revisor) => {
    // No permitir seleccionar revisores indispuestos
    if (revisor.estado === 'INDISPUESTO') return;

    const isSelected = selectedRevisores.some(r => r.id === revisor.id);

    if (isSelected) {
      // Deseleccionar revisor
      setSelectedRevisores(selectedRevisores.filter(r => r.id !== revisor.id));
    } else {
      // Agregar revisor al arreglo
      setSelectedRevisores([...selectedRevisores, revisor]);
    }
  };

  const revisoresDisponibles = revisores.filter(r => r.estado === 'DISPONIBLE');
  const revisoresIndispuestos = revisores.filter(r => r.estado === 'INDISPUESTO');

  if (loading) {
    return <Loading />;
  }

  if (errorLoading) {
    return <LoadError error="Error al cargar los datos." />;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Asignar Revisores
          </h1>
          <p className="text-gray-600">
            Selecciona un trabajo y <strong>uno o más revisores</strong> para crear asignaciones
          </p>
        </div>

        {/* Alertas */}
        <Alert
          type={error ? 'error' : 'success'}
          message={error || success}
          isVisible={error || success}
        />

        {/* Grid Principal */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Trabajos Sin Asignar */}
          <div>
            <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
              <h2 className="text-xl font-bold text-gray-800 mb-2 flex items-center">
                <FileText className="mr-2 text-blue-600" size={24} />
                Trabajos Pendientes
              </h2>
              <p className="text-sm text-gray-600">
                Selecciona un trabajo para asignar revisores
              </p>
            </div>

            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
              {trabajosSinAsignar.length === 0 ? (
                <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                  <FileText className="mx-auto mb-4 text-gray-400" size={48} />
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    No hay trabajos pendientes
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Todos los trabajos tienen sus revisores asignados
                  </p>
                </div>
              ) : (
                trabajosSinAsignar.map((trabajo) => (
                  <CardNotAssignment
                    key={trabajo.id}
                    trabajo={trabajo}
                    isSelected={selectedTrabajo?.id === trabajo.id}
                    onSelect={setSelectedTrabajo}
                    asignacionesCount={asignacionesPorTrabajo[trabajo.id] || 0}
                  />
                ))
              )}
            </div>
          </div>

          {/* Revisores */}
          <div>
            <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
              <h2 className="text-xl font-bold text-gray-800 mb-2 flex items-center">
                <Users className="mr-2 text-green-600" size={24} />
                Seleccionar Revisores ({selectedRevisores.length} seleccionados)
              </h2>
              <p className="text-sm text-gray-600">
                Selecciona uno o más revisores diferentes para el trabajo
              </p>
            </div>

            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
              {/* Revisores Disponibles */}
              {revisoresDisponibles.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-green-700 mb-2 px-2">
                    Disponibles ({revisoresDisponibles.length})
                  </h3>
                  <div className="space-y-3">
                    {revisoresDisponibles.map((revisor) => (
                      <CardReviewer
                        key={revisor.id}
                        revisor={revisor}
                        isSelected={selectedRevisores.some(r => r.id === revisor.id)}
                        onSelect={handleSelectRevisor}
                        disabled={false}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Revisores Indispuestos */}
              {revisoresIndispuestos.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-sm font-semibold text-red-700 mb-2 px-2">
                    Indispuestos - Límite alcanzado ({revisoresIndispuestos.length})
                  </h3>
                  <div className="space-y-3">
                    {revisoresIndispuestos.map((revisor) => (
                      <CardReviewer
                        key={revisor.id}
                        revisor={revisor}
                        isSelected={false}
                        onSelect={() => { }}
                        disabled={true}
                      />
                    ))}
                  </div>
                </div>
              )}

              {revisores.length === 0 && (
                <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                  <User className="mx-auto mb-4 text-gray-400" size={48} />
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    No hay revisores disponibles
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Registra revisores en el sistema para poder asignar trabajos
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Panel de Asignación */}
        {trabajosSinAsignar.length > 0 && revisores.length > 0 && (
          <div className="p-6">
            <div className="flex flex-col lg:flex-row items-center justify-end gap-4">
              <button
                onClick={handleAsignarClick}
                disabled={!selectedTrabajo || selectedRevisores.length === 0}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold py-4 px-8 rounded-lg transition-colors flex items-center gap-2"
              >
                <UserCheck size={20} />
                Asignar {selectedRevisores.length > 0 ? selectedRevisores.length : ''} Revisor{selectedRevisores.length !== 1 ? 'es' : ''}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal de Confirmación */}
      {showConfirmModal && selectedTrabajo && selectedRevisores.length > 0 && (
        <ModalComfirm
          txt={`¿Confirmas asignar el trabajo "${selectedTrabajo.titulo}" a ${selectedRevisores.length} revisor${selectedRevisores.length !== 1 ? 'es' : ''}? (${selectedRevisores.map(r => r.nombre).join(', ')})`}
          onConfirm={handleConfirmAsignacion}
          onCancel={() => setShowConfirmModal(false)}
          isLoading={isAssigning}
        />
      )}
    </div>
  );
}