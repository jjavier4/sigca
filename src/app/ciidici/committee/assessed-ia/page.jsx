'use client'
import React, { useState, useEffect } from 'react';
import { FileText } from 'lucide-react';
import { useSession } from 'next-auth/react';
import Alert from '@/components/ui/utils/alert';
import Loading from '@/components/ui/utils/loading';
import LoadingError from '@/components/ui/utils/loadingError';
import RowAssessedIA from '@/components/ui/commite/rowAssessedIA';
import RowUpdateIA from '@/components/ui/commite/rowUpdateIA';

export default function EvaluacionIAPlagio() {
  const { data: session } = useSession();

  const [loading, setLoading] = useState(false);
  const [errorLoading, setErrorLoading] = useState(false);
  const [trabajosPendientes, setTrabajosPendientes] = useState([]);
  const [trabajosEvaluados, setTrabajosEvaluados] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loadingStates, setLoadingStates] = useState({});

  const [formDataMap, setFormDataMap] = useState({});

  useEffect(() => {
    fetchTrabajos();
  }, []);

  const fetchTrabajos = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/works/pending-ia-plagio');
      
      if (response.ok) {
        const data = await response.json();
        setTrabajosPendientes(data.pendientes.trabajos);
        setTrabajosEvaluados(data.evaluados.trabajos);
        
        // Inicializar formData solo para trabajos pendientes
        const initialFormData = {};
        data.pendientes.trabajos.forEach(trabajo => {
          initialFormData[trabajo.id] = {
            nvl_ia: trabajo.nvl_ia !== null ? trabajo.nvl_ia.toString() : '',
            nvl_plagio: trabajo.nvl_plagio !== null ? trabajo.nvl_plagio.toString() : ''
          };
        });
        setFormDataMap(initialFormData);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Error al cargar trabajos');
        setTimeout(() => setError(''), 3000);
      }
    } catch (err) {
      console.error('Error al cargar trabajos:', err);
      setErrorLoading(true);
    } finally {
      setLoading(false);
    }
  };

  const handleDescargarPDF = (url, titulo) => {
    window.open(url, '_blank');
  };

  const handleInputChange = (trabajoId, field, value) => {
    setFormDataMap(prev => ({
      ...prev,
      [trabajoId]: {
        ...prev[trabajoId],
        [field]: value
      }
    }));
  };

  const handleGuardar = async (trabajoId) => {
    setLoadingStates(prev => ({ ...prev, [trabajoId]: true }));
    setError('');
    setSuccess('');

    const formData = formDataMap[trabajoId];

    // Validaciones
    if (!formData.nvl_ia || !formData.nvl_plagio) {
      setError('Ambos campos son obligatorios');
      setLoadingStates(prev => ({ ...prev, [trabajoId]: false }));
      setTimeout(() => setError(''), 3000);
      return;
    }

    const nvl_ia = parseFloat(formData.nvl_ia);
    const nvl_plagio = parseFloat(formData.nvl_plagio);

    if (isNaN(nvl_ia) || isNaN(nvl_plagio)) {
      setError('Los valores deben ser números válidos');
      setLoadingStates(prev => ({ ...prev, [trabajoId]: false }));
      setTimeout(() => setError(''), 3000);
      return;
    }

    if (nvl_ia < 0 || nvl_ia > 100 || nvl_plagio < 0 || nvl_plagio > 100) {
      setError('Los valores deben estar entre 0 y 100');
      setLoadingStates(prev => ({ ...prev, [trabajoId]: false }));
      setTimeout(() => setError(''), 3000);
      return;
    }

    try {
      const response = await fetch('/api/works/update-assessed-ia', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          trabajoId,
          nvl_ia,
          nvl_plagio
        })
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(data.message || 'Análisis guardado exitosamente');
        
        // Mover trabajo de pendientes a evaluados
        const trabajoGuardado = trabajosPendientes.find(t => t.id === trabajoId);
        if (trabajoGuardado) {
          trabajoGuardado.nvl_ia = nvl_ia;
          trabajoGuardado.nvl_plagio = nvl_plagio;
          setTrabajosEvaluados(prev => [trabajoGuardado, ...prev]);
        }
        
        setTrabajosPendientes(prev => prev.filter(t => t.id !== trabajoId));
        
        // Limpiar formData del trabajo
        setFormDataMap(prev => {
          const newMap = { ...prev };
          delete newMap[trabajoId];
          return newMap;
        });

        setTimeout(() => {
          setSuccess('');
        }, 3000);
      } else {
        setError(data.error || 'Error al guardar análisis');
        setTimeout(() => setError(''), 3000);
      }
    } catch (err) {
      console.error('Error al guardar análisis:', err);
      setError('Error al guardar el análisis');
      setTimeout(() => setError(''), 3000);
    } finally {
      setLoadingStates(prev => ({ ...prev, [trabajoId]: false }));
    }
  };

  const handleActualizarIA = async (trabajoId, nvl_ia, nvl_plagio) => {
    setLoadingStates(prev => ({ ...prev, [trabajoId]: true }));
    setError('');
    setSuccess('');

    // Validaciones
    if (isNaN(nvl_ia) || isNaN(nvl_plagio)) {
      setError('Los valores deben ser números válidos');
      setLoadingStates(prev => ({ ...prev, [trabajoId]: false }));
      setTimeout(() => setError(''), 3000);
      return;
    }

    if (nvl_ia < 0 || nvl_ia > 100 || nvl_plagio < 0 || nvl_plagio > 100) {
      setError('Los valores deben estar entre 0 y 100');
      setLoadingStates(prev => ({ ...prev, [trabajoId]: false }));
      setTimeout(() => setError(''), 3000);
      return;
    }

    try {
      const response = await fetch('/api/works/update-assessed-ia', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          trabajoId,
          nvl_ia,
          nvl_plagio
        })
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(data.message || 'Análisis actualizado exitosamente');
        
        // Actualizar trabajo en la lista de evaluados
        setTrabajosEvaluados(prev => 
          prev.map(t => 
            t.id === trabajoId 
              ? { ...t, nvl_ia, nvl_plagio }
              : t
          )
        );

        setTimeout(() => {
          setSuccess('');
        }, 3000);
      } else {
        setError(data.error || 'Error al actualizar análisis');
        setTimeout(() => setError(''), 3000);
      }
    } catch (err) {
      console.error('Error al actualizar análisis:', err);
      setError('Error al actualizar el análisis');
      setTimeout(() => setError(''), 3000);
    } finally {
      setLoadingStates(prev => ({ ...prev, [trabajoId]: false }));
    }
  };

  if (loading) {
    return <Loading />;
  }

  if (errorLoading) {
    return <LoadingError error="Error al cargar los trabajos." />;
  }

  return (
    <div>
      <Alert
        type={error ? 'error' : 'success'}
        message={error || success}
        isVisible={error || success}
      />

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
                      handleDescargarPDF={handleDescargarPDF}
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
                      key={trabajo.id}
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