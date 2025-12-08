'use client';

import { useState, useEffect } from 'react';
import { Plus, Trash2, ChevronLeft, X } from 'lucide-react';
import Loading from '@/components/ui/utils/loading';
import LoadingError from '@/components/ui/utils/loadingError';
import Alert from '@/components/ui/utils/alert';
import ModalComfirm from '@/components/ui/utils/modalComfirm';

export default function RubricasPage() {
  const [rubricas, setRubricas] = useState({ inactivas: [], activas: [] });
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showModalDelete, setShowModalDelete] = useState(false);
  const [currentDeleteId, setCurrentDeleteId] = useState(null);
  const [formData, setFormData] = useState({ nombre: '', descripcion: '' });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  // Cargar rúbricas
  useEffect(() => {
    fetchRubricas();
  }, []);

  const fetchRubricas = async () => {
    try {
      const response = await fetch('/api/rubric/findall');
      if (response.ok) {
        const result = await response.json();
        setRubricas(result.data);
      } else {
        setError('Error al cargar los criterios');
      }
    } catch (error) {
      console.error('Error al cargar rúbricas:', error);
      setError('Error al cargar los criterios');
    } finally {
      setLoading(false);
    }
  };

  // Cambiar estado (activar/desactivar)
  const cambiarEstado = async (id, nuevoEstado) => {
    try {
      const response = await fetch('/api/rubric/update_state', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, estado: nuevoEstado })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        fetchRubricas();
        setSuccess(data.message);
      } else {
        setError(data.error || 'Error al cambiar estado');
      }
      
      setTimeout(() => { 
        setError('');
        setSuccess('');
      }, 3000);
    } catch (error) {
      console.error('Error:', error);
      setError('Error al cambiar estado');
      setTimeout(() => setError(''), 3000);
    }
  };

  // Eliminar rúbrica
  const eliminarRubrica = async () => {
    try {
      const response = await fetch('/api/rubric/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: currentDeleteId })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setShowModalDelete(false);
        setCurrentDeleteId(null);
        fetchRubricas();
        setSuccess(data.message);
      } else {
        setError(data.error || 'Error al eliminar');
      }
      
      setTimeout(() => { 
        setError('');
        setSuccess('');
      }, 3000);
    } catch (error) {
      console.error('Error:', error);
      setError('Error al eliminar criterio');
      setTimeout(() => setError(''), 3000);
    }
  };

  // Crear nueva rúbrica
  const crearRubrica = async () => {
    // Validaciones
    if (!formData.nombre || formData.nombre.trim().length < 3) {
      setError('El nombre debe tener al menos 3 caracteres');
      setTimeout(() => setError(''), 3000);
      return;
    }
    if (!formData.descripcion || formData.descripcion.trim().length < 10) {
      setError('La descripción debe tener al menos 10 caracteres');
      setTimeout(() => setError(''), 3000);
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch('/api/rubric/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        setShowModal(false);
        setFormData({ nombre: '', descripcion: '' });
        fetchRubricas();
        setSuccess(data.message);
      } else {
        setError(data.error || 'Error al crear criterio');
      }
      
      setTimeout(() => { 
        setError('');
        setSuccess('');
      }, 3000);
    } catch (error) {
      console.error('Error:', error);
      setError('Error al crear criterio');
      setTimeout(() => setError(''), 3000);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <Loading />;
  }

  if (!rubricas) {
    return (
      <LoadingError error="Error al cargar los criterios de evaluación." />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <Alert
          type={error ? 'error' : 'success'}
          message={error || success}
          isVisible={!!(error || success)}
        />

        {showModalDelete && (
          <ModalComfirm
            txt="¿Estás seguro de eliminar este criterio de evaluación?"
            onConfirm={eliminarRubrica}
            onCancel={() => {
              setShowModalDelete(false);
              setCurrentDeleteId(null);
            }}
            isLoading={false}
          />
        )}

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Gestión de Criterios de Evaluación
          </h1>
          <p className="text-gray-600 mt-2">
            Administra los criterios que se utilizarán para evaluar los trabajos
          </p>
        </div>

        {/* Grid de dos columnas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Columna Izquierda - Criterios Inactivos */}
          <div className="bg-white rounded-lg shadow-md">
            <div className="bg-gray-100 px-6 py-4 border-b">
              <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-gray-400"></div>
                Criterios Inactivos
                <span className="text-sm font-normal text-gray-500">
                  ({rubricas.inactivas.length})
                </span>
              </h2>
            </div>
            <div className="p-6 space-y-4 max-h-[600px] overflow-y-auto">
              {rubricas.inactivas.length === 0 ? (
                <p className="text-gray-400 text-center py-8">
                  No hay criterios inactivos
                </p>
              ) : (
                rubricas.inactivas.map((rubrica) => (
                  <div
                    key={rubrica.id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <h3 className="font-semibold text-gray-900 mb-2">
                      {rubrica.nombre}
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">
                      {rubrica.descripcion}
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => cambiarEstado(rubrica.id, true)}
                        className="flex-1 flex items-center justify-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                        Activar
                      </button>
                      <button
                        onClick={() => {
                          setShowModalDelete(true);
                          setCurrentDeleteId(rubrica.id);
                        }}
                        className="flex items-center justify-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Columna Derecha - Criterios Activos */}
          <div className="bg-white rounded-lg shadow-md">
            <div className="bg-green-100 px-6 py-4 border-b">
              <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-600"></div>
                Criterios Activos
                <span className="text-sm font-normal text-gray-500">
                  ({rubricas.activas.length})
                </span>
              </h2>
            </div>
            <div className="p-6 space-y-4 max-h-[600px] overflow-y-auto">
              {rubricas.activas.length === 0 ? (
                <p className="text-gray-400 text-center py-8">
                  No hay criterios activos
                </p>
              ) : (
                rubricas.activas.map((rubrica) => (
                  <div
                    key={rubrica.id}
                    className="border border-green-200 bg-green-50 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <h3 className="font-semibold text-gray-900 mb-2">
                      {rubrica.nombre}
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">
                      {rubrica.descripcion}
                    </p>
                    <button
                      onClick={() => cambiarEstado(rubrica.id, false)}
                      className="w-full flex items-center justify-center gap-2 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Desactivar
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Botón Agregar Criterio */}
        <div className="flex justify-center">
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl"
          >
            <Plus className="w-5 h-5" />
            Agregar Criterio de Evaluación
          </button>
        </div>

        {/* Modal Crear */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
              <div className="flex justify-between items-center p-6 border-b">
                <h3 className="text-xl font-semibold text-gray-900">
                  Nuevo Criterio de Evaluación
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre del Criterio *
                  </label>
                  <input
                    type="text"
                    value={formData.nombre}
                    onChange={(e) =>
                      setFormData({ ...formData, nombre: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Ej: Claridad y coherencia"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descripción *
                  </label>
                  <textarea
                    value={formData.descripcion}
                    onChange={(e) =>
                      setFormData({ ...formData, descripcion: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    placeholder="Describe el criterio de evaluación..."
                    rows={4}
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setShowModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    disabled={submitting}
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={crearRubrica}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                    disabled={submitting}
                  >
                    {submitting ? 'Creando...' : 'Crear Criterio'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}