'use client';
import React, { useState } from 'react';
import { FileText } from 'lucide-react';
import Alert from '@/components/ui/utils/alert';
import RowAssessedIA from '@/components/ui/commite/rowAssessedIA';
import RowUpdateIA from '@/components/ui/commite/rowUpdateIA';
import useAccion from '@/hooks/useAccion';
import { registrarAnalisis, actualizarAnalisis } from '@/actions/analisis';

function errorDeNiveles(nvl_ia, nvl_plagio) {
  if (Number.isNaN(nvl_ia) || Number.isNaN(nvl_plagio)) return 'Los valores deben ser números válidos';
  if (nvl_ia < 0 || nvl_ia > 100 || nvl_plagio < 0 || nvl_plagio > 100) {
    return 'Los valores deben estar entre 0 y 100';
  }
  return null;
}

export default function GestionAnalisis({ trabajosPendientes, trabajosEvaluados }) {
  const [formDataMap, setFormDataMap] = useState({});
  const [trabajoEnProceso, setTrabajoEnProceso] = useState(null);
  const { ejecutar, pendiente, alerta } = useAccion();

  const loadingStates = pendiente && trabajoEnProceso ? { [trabajoEnProceso]: true } : {};

  const handleInputChange = (trabajoId, field, value) => {
    setFormDataMap(prev => ({
      ...prev,
      [trabajoId]: {
        ...prev[trabajoId],
        [field]: value
      }
    }));
  };

  const guardarNiveles = async (trabajoId, nvl_ia, nvl_plagio) => {
    const error = errorDeNiveles(nvl_ia, nvl_plagio);
    if (error) {
      await ejecutar(async () => ({ ok: false, error }));
      return null;
    }

    setTrabajoEnProceso(trabajoId);
    const resultado = await ejecutar(() => registrarAnalisis({ trabajoId, nvl_ia, nvl_plagio }));
    setTrabajoEnProceso(null);
    return resultado;
  };

  const handleGuardar = async (trabajoId) => {
    const formData = formDataMap[trabajoId] ?? {};

    if (!formData.nvl_ia || !formData.nvl_plagio) {
      await ejecutar(async () => ({ ok: false, error: 'Ambos campos son obligatorios' }));
      return;
    }

    const resultado = await guardarNiveles(trabajoId, parseFloat(formData.nvl_ia), parseFloat(formData.nvl_plagio));
    if (resultado?.ok) {
      setFormDataMap(prev => {
        const newMap = { ...prev };
        delete newMap[trabajoId];
        return newMap;
      });
    }
  };

  const actualizarNiveles = async (trabajoId, nvl_ia, nvl_plagio) => {
    const error = errorDeNiveles(nvl_ia, nvl_plagio);
    if (error) {
      await ejecutar(async () => ({ ok: false, error }));
      return null;
    }

    setTrabajoEnProceso(trabajoId);
    const resultado = await ejecutar(() => actualizarAnalisis({ trabajoId, nvl_ia, nvl_plagio }));
    setTrabajoEnProceso(null);
    return resultado;
  };

  const handleActualizarIA = async (trabajoId, nvl_ia, nvl_plagio) => {
    const resultado = await actualizarNiveles(trabajoId, nvl_ia, nvl_plagio);
    return resultado?.ok;
  };

  return (
    <div>
      <Alert {...alerta} />

      <div className="mb-6">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">
          Evaluación de IA y Plagio
        </h2>
        <p className="text-gray-600">
          Trabajos pendientes: {trabajosPendientes.length} | Trabajos evaluados: {trabajosEvaluados.length}
        </p>
      </div>

      {/* Sección de trabajos pendientes */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">
          Trabajos Pendientes de Análisis
        </h3>
        {trabajosPendientes.length === 0 ? (
          <div className="bg-white text-gray-600 rounded-lg shadow-md p-8 text-center">
            <FileText className="mx-auto mb-4 h-12 w-12 text-gray-400" />
            <p className="text-gray-500">
              No hay trabajos pendientes de análisis
            </p>
          </div>
        ) : (
          <div className="bg-white text-gray-600 rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Trabajo / Convocatoria
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                      PDF
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                      Nivel IA (%)
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                      Nivel Plagio (%)
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                      Acción
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {trabajosPendientes.map((trabajo) => (
                    <RowAssessedIA
                      key={trabajo.id}
                      trabajo={trabajo}
                      handleInputChange={handleInputChange}
                      formDataMap={formDataMap}
                      handleGuardar={handleGuardar}
                      loadingStates={loadingStates}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Sección de trabajos evaluados */}
      <div>
        <h3 className="text-xl font-semibold text-gray-800 mb-4">
          Trabajos Evaluados
        </h3>
        {trabajosEvaluados.length === 0 ? (
          <div className="bg-white text-gray-600 rounded-lg shadow-md p-8 text-center">
            <FileText className="mx-auto mb-4 h-12 w-12 text-gray-400" />
            <p className="text-gray-500">
              No hay trabajos evaluados
            </p>
          </div>
        ) : (
          <div className="bg-white text-gray-600 rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Trabajo / Convocatoria
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                      Nivel IA (%)
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                      Nivel Plagio (%)
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {trabajosEvaluados.map((trabajo) => (
                    <RowUpdateIA
                      key={`${trabajo.id}-${trabajo.nvl_ia}-${trabajo.nvl_plagio}`}
                      trabajo={trabajo}
                      handleActualizarIA={handleActualizarIA}
                      loadingStates={loadingStates}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}