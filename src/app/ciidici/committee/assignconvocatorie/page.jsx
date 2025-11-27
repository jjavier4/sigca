"use client";
import React, { useEffect, useState } from 'react';
import { FileText, User, UserCheck} from 'lucide-react';
import { CardNotAssignmet, CardReviewer } from '@/components/ui/cards/cardAssignment';
import ModalComfirm from '@/components/ui/utils/modalComfirm';
import Alert from '@/components/ui/utils/alert';
// Componente Principal
export default function AsignarRevisores() {
  const [trabajosSinAsignar, setTrabajosSinAsignar] = useState([]);
  const [revisores, setRevisores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showAlert, setShowAlert] = useState(false);
  const [selectedTrabajo, setSelectedTrabajo] = useState(null);
  const [selectedRevisor, setSelectedRevisor] = useState(null);
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
      } else {
        setError(trabajosData.error);
      }

      // Obtener revisores disponibles
      const revisoresResponse = await fetch('/api/assignments/users-reviewers');
      const revisoresData = await revisoresResponse.json();

      if (revisoresResponse.ok) {
        setRevisores(revisoresData.revisores);
      } else {
        setError(revisoresData.error);
      }

    } catch (error) {
      console.error('Error al cargar datos:', error);
      setError('Error al cargar la información');
    } finally {
      setLoading(false);
    }
  };

  const handleAsignarClick = () => {
    if (!selectedTrabajo || !selectedRevisor) {
      setError('Debes seleccionar un trabajo y un revisor');
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
          revisorId: selectedRevisor.id
        })
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Asignación creada exitosamente');
        setShowConfirmModal(false);
        setSelectedTrabajo(null);
        setSelectedRevisor(null);

        // Recargar datos
        await fetchData();

        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.error);
        setTimeout(() => setError(''), 3000);
      }

    } catch (error) {
      console.error('Error al crear asignación:', error);
      setError('Error al crear la asignación');
      setTimeout(() => setError(''), 3000);
    } finally {
      setIsAssigning(false);
    }
  };

  const getRevisorTrabajosCount = (revisorId) => {
    // En una implementación real, esto vendría del backend
    return Math.floor(Math.random() * 5);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando información...</p>
        </div>
      </div>
    );
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
            Selecciona un trabajo y un revisor para crear una nueva asignación
          </p>
        </div>

        {/* Alertas */}

        <Alert
          type={error ? 'error' : 'success'}
          message={error || success}
          isVisible={error || success}
          onClose={() => {
            setTimeout(() => { setShowAlert(!showAlert); }, 300)
          }}
        />


        {/* Grid Principal */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Trabajos Sin Asignar */}
          <div>
            <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
              <h2 className="text-xl font-bold text-gray-800 mb-2 flex items-center">
                <FileText className="mr-2 text-blue-600" size={24} />
                Trabajos Sin Asignar
              </h2>
              <p className="text-sm text-gray-600">
                Selecciona un trabajo para asignar a un revisor
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
                    Todos los trabajos han sido asignados a revisores
                  </p>
                </div>
              ) : (
                trabajosSinAsignar.map((trabajo) => (
                  <CardNotAssignmet
                    key={trabajo.id}
                    trabajo={trabajo}
                    isSelected={selectedTrabajo?.id === trabajo.id}
                    onSelect={setSelectedTrabajo}
                  />
                ))
              )}
            </div>
          </div>

          {/* Revisores Disponibles */}
          <div>
            <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
              <h2 className="text-xl font-bold text-gray-800 mb-2 flex items-center">
                <User className="mr-2 text-green-600" size={24} />
                Revisores Disponibles
              </h2>
              <p className="text-sm text-gray-600">
                Selecciona un revisor para asignar el trabajo
              </p>
            </div>

            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
              {revisores.length === 0 ? (
                <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                  <User className="mx-auto mb-4 text-gray-400" size={48} />
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    No hay revisores disponibles
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Registra revisores en el sistema para poder asignar trabajos
                  </p>
                </div>
              ) : (
                revisores.map((revisor) => (
                  <CardReviewer
                    key={revisor.id}
                    revisor={revisor}
                    isSelected={selectedRevisor?.id === revisor.id}
                    onSelect={setSelectedRevisor}
                    trabajosAsignados={getRevisorTrabajosCount(revisor.id)}
                  />
                ))
              )}
            </div>
          </div>
        </div>

        {/* Botón de Asignación */}
        {(trabajosSinAsignar.length > 0 && revisores.length > 0) && (
          <div className="mt-8 bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-1">
                  Crear Asignación
                </h3>
              </div>
              <button
                onClick={handleAsignarClick}
                disabled={!selectedTrabajo || !selectedRevisor}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold py-4 px-8 rounded-lg transition-colors flex items-center"
              >
                <UserCheck className="mr-2" size={20} />
                Asignar Revisor
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal de Confirmación */}
      {showConfirmModal && (
        <ModalComfirm
          txt={`¿Confirmas asignar el trabajo?`}
          onConfirm={handleConfirmAsignacion}
          onCancel={() => setShowConfirmModal(false)}
          isLoading={isAssigning}
        />
      )}
    </div>
  );
}