'use client'
import React, { useState, useEffect } from 'react';
import { FileText } from 'lucide-react';
import { useSession } from 'next-auth/react';
import Alert from '@/components/ui/utils/alert';
import Loading from '@/components/ui/utils/loading';
import LoadingError from '@/components/ui/utils/loadingError';
import FormLabelInput from '@/components/ui/form/FormLabelInput';
import TablaCriterios from '@/components/ui/commite/TablaCriterios';
export default function CriteriosEvaluacionManager() {
  const { data: session } = useSession();

  const [loading, setLoading] = useState(false);
  const [errorLoading, setErrorLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [criteriosDifusion, setCriteriosDifusion] = useState([]);
  const [criteriosDivulgacion, setCriteriosDivulgacion] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalGrupo, setModalGrupo] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(null);

  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    puntaje10: '',
    puntaje8: '',
    puntaje6: '',
    puntaje0: ''
  });

  const cargarCriterios = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/rubric/findall');
      
      if (!response.ok) {
        throw new Error('Error al cargar criterios');
      }
      
      const data = await response.json();
      
      const difusion = data.filter(c => c.grupo === 'DIFUSION');
      const divulgacion = data.filter(c => c.grupo === 'DIVULGACION');
      
      setCriteriosDifusion(difusion);
      setCriteriosDivulgacion(divulgacion);
    } catch (err) {
      console.error('Error al traer criterios:', err);
      setErrorLoading(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarCriterios();
  }, []);

  const handleEliminar = async (id, grupo) => {
    
    
    try {
      setDeleteLoading(id);
      const response = await fetch(`/api/rubric/deleteone?id=${id}`, {
        method: 'DELETE'
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(data.message || 'Criterio eliminado exitosamente');
        
        if (grupo === 'DIFUSION') {
          setCriteriosDifusion(prev => prev.filter(c => c.id !== id));
        } else {
          setCriteriosDivulgacion(prev => prev.filter(c => c.id !== id));
        }
      } else {
        setError(data.error || 'Error al eliminar criterio');
      }

      setTimeout(() => {
        setSuccess('');
        setError('');
      }, 3000);

    } catch (err) {
      console.error('Error al eliminar criterio:', err);
      setError('Error al eliminar criterio');
      setTimeout(() => {
        setError('');
      }, 3000);
    } finally {
      setDeleteLoading(null);
    }
  };

  const handleAbrirModal = (grupo) => {
    setModalGrupo(grupo);
    setFormData({
      nombre: '',
      descripcion: '',
      puntaje10: '',
      puntaje8: '',
      puntaje6: '',
      puntaje0: ''
    });
    setShowModal(true);
  };

  const handleCerrarModal = () => {
    setShowModal(false);
    setModalGrupo(null);
    setFormData({
      nombre: '',
      descripcion: '',
      puntaje10: '',
      puntaje8: '',
      puntaje6: '',
      puntaje0: ''
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const payload = {
        nombre: formData.nombre.trim(),
        descripcion: formData.descripcion.trim(),
        grupo: modalGrupo,
        descripcion_puntaje: [
          formData.puntaje10.trim(),
          formData.puntaje8.trim(),
          formData.puntaje6.trim(),
          formData.puntaje0.trim()
        ]
      };

      const response = await fetch('/api/rubric/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(data.message || 'Criterio creado exitosamente');
        
        if (modalGrupo === 'DIFUSION') {
          setCriteriosDifusion(prev => [...prev, data]);
        } else {
          setCriteriosDivulgacion(prev => [...prev, data]);
        }

        setTimeout(() => {
          setSuccess('');
          setShowModal(false);
          handleCerrarModal();
        }, 3000);
      } else {
        setError(data.error || 'Error al crear criterio');
        setTimeout(() => {
          setError('');
        }, 3000);
      }

    } catch (err) {
      console.error('Error al crear criterio:', err);
      setError('Error al crear criterio');
      setTimeout(() => {
        setError('');
      }, 3000);
    } finally {
      setIsLoading(false);
    }
  };


  if (loading) {
    return <Loading />;
  }

  if (errorLoading) {
    return <LoadingError error="Error al cargar los criterios de evaluación." />;
  }

  return (
    <div>
      <Alert
        type={error ? 'error' : 'success'}
        message={error || success}
        isVisible={error || success}
      />

      <h2 className="text-3xl font-bold text-gray-800 mb-6">
        Gestión de Criterios de Evaluación
      </h2>

      <TablaCriterios 
        criterios={criteriosDifusion} 
        grupo="DIFUSION" 
        titulo="Difusión"
        deleteLoading={deleteLoading}
        handleEliminar={handleEliminar}
        handleAbrirModal={handleAbrirModal}
      />
      
      <TablaCriterios 
        criterios={criteriosDivulgacion} 
        grupo="DIVULGACION" 
        titulo="Divulgación"
        deleteLoading={deleteLoading}
        handleEliminar={handleEliminar}
        handleAbrirModal={handleAbrirModal}
      />

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4">
              <h3 className="text-xl font-bold text-gray-900">
                Nuevo Criterio - {modalGrupo === 'DIFUSION' ? 'Difusión' : 'Divulgación'}
              </h3>
            </div>
            
            <div className="p-6 space-y-4">
              <FormLabelInput
                title="Nombre del Criterio"
                children={<FileText className="absolute left-3 top-3 text-black" size={20} />}
                type="text"
                value={formData.nombre}
                change={(e) => setFormData({...formData, nombre: e.target.value})}
                placeholder="Ej: Organización y estructura"
                required={true}
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descripción
                </label>
                <textarea
                  value={formData.descripcion}
                  onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
                  className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows="3"
                  placeholder="Descripción detallada del criterio..."
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descripción 10 puntos
                  </label>
                  <textarea
                    value={formData.puntaje10}
                    onChange={(e) => setFormData({...formData, puntaje10: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows="3"
                    placeholder="Cumple totalmente..."
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descripción 8 puntos
                  </label>
                  <textarea
                    value={formData.puntaje8}
                    onChange={(e) => setFormData({...formData, puntaje8: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows="3"
                    placeholder="Cumple parcialmente..."
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descripción 6 puntos
                  </label>
                  <textarea
                    value={formData.puntaje6}
                    onChange={(e) => setFormData({...formData, puntaje6: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows="3"
                    placeholder="Cumple mínimamente..."
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descripción 0 puntos
                  </label>
                  <textarea
                    value={formData.puntaje0}
                    onChange={(e) => setFormData({...formData, puntaje0: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows="3"
                    placeholder="No cumple..."
                    required
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 rounded-lg transition-all duration-300"
                >
                  {isLoading
                    ? 'Guardando...'
                    : success
                      ? 'Guardado !!!'
                      : 'Guardar Criterio'}
                </button>
                <button
                  onClick={handleCerrarModal}
                  disabled={isLoading}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 rounded-lg transition-all duration-300"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}