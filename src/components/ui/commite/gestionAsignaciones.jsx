'use client';
import React, { useState } from 'react';
import { FileText, Users, UserPlus } from 'lucide-react';
import { CardReviewer, CardWorkWithAssignments } from '@/components/ui/cards/cardAssignment';
import Alert from '@/components/ui/utils/alert';
import ModalConfirm from '@/components/ui/utils/modalConfirm';
import useAccion from '@/hooks/useAccion';
import { crearAsignaciones, eliminarAsignacion } from '@/actions/asignaciones';

function mensajeEliminacion(asignacion) {
  if (!asignacion) return '';
  const { nombre, apellidoP, apellidoM } = asignacion.revisor;
  const base = `Se eliminará la asignación de ${nombre} ${apellidoP} ${apellidoM} al trabajo "${asignacion.tituloTrabajo}".`;
  if (asignacion.activa) {
    return `${base} El revisor dejará de verlo en su panel. Esta acción no se puede deshacer.`;
  }
  return `${base} El revisor ya concluyó la evaluación: se perderán su calificación y su comentario. Esta acción no se puede deshacer.`;
}

export default function GestionAsignaciones({ trabajosConAsignaciones, revisores }) {
  const [selectedTrabajo, setSelectedTrabajo] = useState(null);
  const [selectedRevisores, setSelectedRevisores] = useState([]);
  const [asignacionAEliminar, setAsignacionAEliminar] = useState(null);
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

  const confirmarEliminacion = async () => {
    await ejecutar(() => eliminarAsignacion(asignacionAEliminar.id));
    setAsignacionAEliminar(null);
  };

  const handleSelectRevisor = (revisor) => {
    if (revisor.estado === 'INDISPUESTO') return;

    const isSelected = selectedRevisores.some(r => r.id === revisor.id);

    if (isSelected) {
      setSelectedRevisores(selectedRevisores.filter(r => r.id !== revisor.id));
    } else {
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
            Configurar Asignaciones de Revisores
          </h1>
          <p className="text-gray-600">
            Selecciona un trabajo y <strong>uno o más revisores</strong> para crear nuevas asignaciones o eliminar asignaciones existentes.
          </p>
        </div>

        {/* Alertas */}
        <Alert {...alerta} />
        <ModalConfirm
          abierto={asignacionAEliminar !== null}
          titulo="Eliminar asignación"
          mensaje={mensajeEliminacion(asignacionAEliminar)}
          textoConfirmar="Eliminar"
          cargando={pendiente}
          onConfirmar={confirmarEliminacion}
          onCancelar={() => setAsignacionAEliminar(null)}
        />

        {/* Grid Principal */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Trabajos Con Asignaciones */}
          <div>
            <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
              <h2 className="text-xl font-bold text-gray-800 mb-2 flex items-center">
                <FileText className="mr-2 text-blue-600" size={24} />
                Trabajos con Asignaciones
              </h2>
              <p className="text-sm text-gray-600">
                Total: {trabajosConAsignaciones.length} trabajo(s)
              </p>
            </div>

            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
              {trabajosConAsignaciones.length === 0 ? (
                <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                  <FileText className="mx-auto mb-4 text-gray-400" size={48} />
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    No hay trabajos con asignaciones
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Los trabajos aparecerán aquí una vez que tengan revisores asignados
                  </p>
                </div>
              ) : (
                trabajosConAsignaciones.map((trabajo) => (
                  <CardWorkWithAssignments
                    key={trabajo.id}
                    trabajo={trabajo}
                    isSelected={selectedTrabajo?.id === trabajo.id}
                    onSelect={setSelectedTrabajo}
                    onDeleteAssignment={(asignacion) => setAsignacionAEliminar({ ...asignacion, tituloTrabajo: trabajo.titulo })}
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
                  <Users className="mx-auto mb-4 text-gray-400" size={48} />
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
        {trabajosConAsignaciones.length > 0 && revisores.length > 0 && (
          <div className="mt-6 bg-white rounded-lg shadow-sm p-6">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
              <div className="text-sm text-gray-600">
                {selectedTrabajo ? (
                  <p>
                    <span className="font-semibold">Trabajo seleccionado:</span> {selectedTrabajo.titulo}
                  </p>
                ) : (
                  <p className="italic">Selecciona un trabajo para agregar revisores</p>
                )}
              </div>
              <button
                onClick={handleAsignacion}
                disabled={pendiente || !selectedTrabajo || selectedRevisores.length === 0}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-lg transition-colors flex items-center gap-2"
              >
                <UserPlus size={20} />
                Agregar {selectedRevisores.length > 0 ? selectedRevisores.length : ''} Revisor{selectedRevisores.length !== 1 ? 'es' : ''}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}