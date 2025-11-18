"use client";
import React, { useState } from 'react';
import { Calendar, FileText, Clock, Tag, ChevronRight } from 'lucide-react';
import FormLabelInput from '@/components/ui/FormLabelInput';
import Alert from '@/components/ui/alert';
// Componente Card de Convocatoria
export function CardConvocatorie({ convocatoria, onClick }) {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getEstado = () => {
    const now = new Date();
    const inicio = new Date(convocatoria.fecha_inicio);
    const cierre = new Date(convocatoria.fecha_cierre);

    if (now < inicio) {
      return { txt: 'Próximamente', color: 'bg-blue-100 text-blue-800' };
    } else if (now >= inicio && now <= cierre) {
      return { txt: 'Abierta', color: 'bg-green-100 text-green-800' };
    } else {
      return { txt: 'Cerrada', color: 'bg-red-500 text-gray-800' };
    }
  };

  const getDiasRestantes = () => {
    const now = new Date();
    const cierre = new Date(convocatoria.fecha_cierre);
    const diferencia = Math.ceil((cierre - now) / (1000 * 60 * 60 * 24));

    if (diferencia < 0) return null;
    if (diferencia === 0) return 'Último día';
    if (diferencia === 1) return '1 día restante';
    return `${diferencia} días restantes`;
  };

  const estado = getEstado();
  const diasRestantes = getDiasRestantes();
  const temas = convocatoria.temas ? convocatoria.temas.split(',').map(t => t.trim()) : [];

  return (
    <div
      onClick={() => onClick(convocatoria)}
      className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer border border-gray-200 hover:border-blue-400 transform hover:-translate-y-1"
    >
      {/* Header con estado */}
      <div className="bg-gray-900 p-4">
        <div className="flex justify-between">
          <h3 className="text-xl font-bold text-white flex-1 pr-4">
            {convocatoria.titulo}
          </h3>
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${estado.color}`}>
            {estado.txt}
          </span>
        </div>
      </div>

      {/* Contenido */}
      <div className="p-6 space-y-4">
        {/* Descripción */}
        {convocatoria.descripcion && (
          <p className="text-gray-600 text-sm line-clamp-3">
            {convocatoria.descripcion}
          </p>
        )}

        {/* Fechas */}
        <div className="space-y-2">
          <div className="flex items-center text-gray-700">
            <Calendar className="mr-3 text-green-600" size={18} />
            <div className="text-sm">
              <span className="font-medium">Inicio:</span> {formatDate(convocatoria.fecha_inicio)}
            </div>
          </div>
          <div className="flex items-center text-gray-700">
            <Calendar className="mr-3 text-red-600" size={18} />
            <div className="text-sm">
              <span className="font-medium">Cierre:</span> {formatDate(convocatoria.fecha_cierre)}
            </div>
          </div>
        </div>

        {/* Días restantes */}
        {diasRestantes && (
          <div className="flex items-center text-orange-600 bg-orange-50 px-3 py-2 rounded-lg">
            <Clock className="mr-2" size={18} />
            <span className="text-sm font-medium">{diasRestantes}</span>
          </div>
        )}

        {/* Temas */}
        {temas.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center text-gray-700">
              <Tag className="mr-2 text-purple-600" size={18} />
              <span className="text-sm font-medium">Temas:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {temas.slice(0, 3).map((tema, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-purple-100 text-purple-800 text-xs rounded-full"
                >
                  {tema}
                </span>
              ))}
              {temas.length > 3 && (
                <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                  +{temas.length - 3} más
                </span>
              )}
            </div>
          </div>
        )}

        {/* Botón ver más */}
        <div className="pt-4 border-t border-gray-200">
          <button className="w-full flex items-center justify-center text-blue-600 hover:text-blue-700 font-medium text-sm group">
            Ver detalles completos
            <ChevronRight className="ml-2 group-hover:translate-x-1 transition-transform" size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}

// Modal de Detalle
export function ModalConvocatorie({ convocatoria, onClose, user, sendFile }) {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState('');
  const [visible, setVisible] = useState(false);
  if (!convocatoria) return null;

  const temas = convocatoria.temas ? convocatoria.temas.split(',').map(t => t.trim()) : [];
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file || !user) {
      setUploadError('Debes seleccionar un archivo y estar autenticado');
      return;
    }

    setUploading(true);
    setUploadError('');
    setUploadSuccess('');

    try {
      const data = await sendFile(file, convocatoria.id, user.id);
      
      if (!data) {
        setUploadSuccess('Propuesta enviada exitosamente');
      } else {
        setUploadError(data.error);
      }
      setVisible(true);
      setTimeout(() => {
        setUploadSuccess('')
        setUploadError('')
        setFile(null);
        setVisible(false);
        close();
      }, 2000);
    } catch (error) {
      console.log(error.message || 'Error al enviar la propuesta');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {
          (uploadSuccess || uploadError) &&
          <Alert
            type={uploadSuccess ? 'success' : 'error'}
            message={uploadSuccess ? uploadSuccess : uploadError}
            isVisible={visible}
          />
        }
        {/* Header */}
        <div className="bg-gradient-to-r bg-blue-600 p-6 sticky top-0">
          <div className="flex justify-between items-start">
            <h2 className="text-2xl font-bold text-white pr-4">
              {convocatoria.titulo}
            </h2>
            <button
              onClick={onClose}
              className="text-white cursor-pointer"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Contenido */}
        <div className="p-6 space-y-6">
          {/* Descripción completa */}
          {convocatoria.descripcion && (
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2 flex items-center">
                <FileText className="mr-2 text-blue-600" size={20} />
                Descripción
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {convocatoria.descripcion}
              </p>
            </div>
          )}

          {/* Temas completos */}
          {temas.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                <Tag className="mr-2 text-purple-600" size={20} />
                Áreas Temáticas
              </h3>
              <div className="flex flex-wrap gap-2">
                {temas.map((tema, index) => (
                  <span
                    key={index}
                    className="px-4 py-2 bg-purple-100 text-purple-800 text-sm rounded-full font-medium"
                  >
                    {tema}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Botones de acción */}
          <div className="flex flex-col gap-3 pt-4 ">
            {
               user && user.rol === 'AUTOR' &&
              (
                <div className="flex-1 border border-gray-200 p-2 rounded-lg">
                  <form className="flex gap-3 pt-4 items-center" onSubmit={handleSubmit}>

                    <FormLabelInput
                      title="PDF de tu propuesta"
                      children={<FileText size={10} />}
                      type="file"
                      required={true}
                      change={(e) => setFile(e.target.files[0])}
                      placeholder="Selecciona tu archivo"
                      accept=".pdf"
                      multiple={false}
                      disabled={uploading} />
                    <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors">
                      {uploading ? 'Enviando...' : 'Enviar Propuesta'}
                    </button>
                  </form>
                </div>
              )

            }

            <button
              onClick={onClose}
              className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 rounded-lg transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}