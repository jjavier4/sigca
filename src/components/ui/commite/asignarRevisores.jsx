'use client';
import React, { useState } from 'react';
import { FileText, User, UserCheck, Users } from 'lucide-react';
import { CardNotAssignment, CardReviewer } from '@/components/ui/cards/cardAssignment';
import Alert from '@/components/ui/utils/alert';
import useAccion from '@/hooks/useAccion';
import { crearAsignaciones } from '@/actions/asignaciones';

export default function AsignarRevisores({ trabajosSinAsignar, revisores }) {
  const [selectedTrabajo, setSelectedTrabajo] = useState(null);
  const [selectedRevisores, setSelectedRevisores] = useState([]);
  const { ejecutar, pendiente, alerta } = useAccion();

  const handleAsignacion = async () => {
    const resultado = await ejecutar(() =>
      crearAsignaciones({
        trabajoId: selectedTrabajo.id,
        revisoresIds: selectedRevisores.map(r => r.id)
      })
    );

    if (resultado?.ok) {
      setSelectedTrabajo(null);
      setSelectedRevisores([]);
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
        <Alert {...alerta} />

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
                <div className="grid grid-cols-2 gap-4">
                  {
                    trabajosSinAsignar.map((trabajo) => (
                      <CardNotAssignment
                        key={trabajo.id}
                        trabajo={trabajo}
                        isSelected={selectedTrabajo?.id === trabajo.id}
                        onSelect={() => {
                          selectedTrabajo?.id === trabajo.id ? setSelectedTrabajo(null) : setSelectedTrabajo(trabajo);
                        }}
                        asignacionesCount={0}
                      />
                    ))
                  }
                </div>
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
                onClick={handleAsignacion}
                disabled={pendiente || !selectedTrabajo || selectedRevisores.length === 0}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold py-4 px-8 rounded-lg transition-colors flex items-center gap-2"
              >
                <UserCheck size={20} />
                Asignar {selectedRevisores.length > 0 ? selectedRevisores.length : ''} Revisor{selectedRevisores.length !== 1 ? 'es' : ''}
              </button>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}