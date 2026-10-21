"use client";
import React, { useState } from 'react';
import { Calendar, FileText, Clock, Tag, User, Pen, PlusCircle, MinusCircleIcon, AlertCircle } from 'lucide-react';
import FormLabelInput from '@/components/ui/form/FormLabelInput';
import { formatearDiaCalendario } from '@/utils/fechas';

const TAMANO_MAXIMO = 10 * 1024 * 1024;
// Componente Card de Convocatoria
export function CardConvocatorie({ convocatoria, onClick, esAutor }) {
  const formatDate = formatearDiaCalendario;

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
      className={`bg-white rounded-xl shadow-md transition-all duration-300 overflow-hidden border border-gray-200  ${esAutor ? 'cursor-pointer hover:shadow-xl hover:border-blue-400 transform hover:-translate-y-1' : ''}`}
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
      </div>
    </div>
  );
}

// Modal de Detalle
export function ModalConvocatorie({ convocatoria, onClose, onEnviar, pendiente }) {
  const [file, setFile] = useState(null);
  const [countCoauthors, setCountCoauthors] = useState(0);
  const [dataConvocatoria, setDataConvocatoria] = useState({
    tituloPropuesta: '',
    tipo: 'DIVULGACION',
    coautores: []
  });
  const [errorLocal, setErrorLocal] = useState('');
  if (!convocatoria) return null;

  const manageCoauthors = (index, key, value) => {
    const nuevosCoautores = [...dataConvocatoria.coautores];

    // Mantenemos lo que ya tenía el coautor (...nuevosCoautores[index])
    // y actualizamos solo la propiedad que cambió [key]
    nuevosCoautores[index] = {
      ...nuevosCoautores[index],
      [key]: value
    };

    setDataConvocatoria({
      ...dataConvocatoria,
      coautores: nuevosCoautores
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorLocal('');
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!dataConvocatoria.tituloPropuesta.trim()) {
      setErrorLocal('El título de la propuesta es obligatorio');
      return;
    }
    if (dataConvocatoria.coautores.some(coautor => !coautor || !emailRegex.test(coautor.email))) {
      setErrorLocal('Por favor, ingresa correos electrónicos válidos para los coautores');
      return;
    }
    if (!file) {
      setErrorLocal('Selecciona el PDF de tu propuesta');
      return;
    }
    if (file.size > TAMANO_MAXIMO) {
      setErrorLocal('El archivo excede el tamaño máximo permitido (10MB)');
      return;
    }

    const formData = new FormData();
    formData.append('dataConvocatoria', JSON.stringify(dataConvocatoria));
    formData.append('file', file);
    formData.append('convocatoriaId', convocatoria.id);

    const resultado = await onEnviar(formData);
    if (resultado.ok) onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
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

          {/* Botones de acción */}
          <div className="flex flex-col gap-3 pt-4 ">

            <div className="flex-1 border border-gray-200 p-2 rounded-lg">
              {errorLocal && (
                <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3 flex items-center">
                  <AlertCircle className="text-red-600 mr-2" size={20} />
                  <p className="text-red-800 text-sm">{errorLocal}</p>
                </div>
              )}
              <form className="space-y-4" onSubmit={handleSubmit}> {/**handleSubmit */}

                <FormLabelInput
                  title="Título de tu propuesta"
                  children={<Pen className="absolute left-3 top-3 text-black" size={20} />}
                  type="text"
                  required={true}
                  value={dataConvocatoria.tituloPropuesta}
                  change={(e) => setDataConvocatoria({ ...dataConvocatoria, tituloPropuesta: e.target.value })}
                  placeholder="Ingresa el título de tu propuesta"
                  disabled={pendiente}
                />
                <div>
                  <label className="block text-sm font-medium text-black mb-2" >
                    Tipo Trabajo
                  </label>

                  <select
                    value={dataConvocatoria.tipo}
                    onChange={(e) => setDataConvocatoria({ ...dataConvocatoria, tipo: e.target.value })}
                    className="w-full pl-2 pr-4 py-3 border text-black rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  >
                    <option value="DIVULGACION">Divulgacion</option>
                    <option value="DIFUSION">Difusion</option>
                  </select>
                </div>


                <label className="block text-sm font-medium text-black mb-2">Control de Coautores</label>
                {Array.from({ length: countCoauthors }).map((_, index) => {
                  return (
                    <div key={index} className="flex flex-col md:flex-row gap-4 mb-4">
                      <FormLabelInput
                        title={`Nombre coautor ${index + 1}`}
                        children={<User className="absolute left-3 top-3 text-black" size={20} />}
                        type="text"
                        required={true}
                        value={dataConvocatoria.coautores[index]?.nombre || ''}
                        change={(e) => manageCoauthors(index, 'nombre', e.target.value)}
                        placeholder="Ingresa el nombre"
                        disabled={pendiente}
                      />
                      <FormLabelInput
                        title={`Correo coautor ${index + 1}`}
                        children={<User className="absolute left-3 top-3 text-black" size={20} />}
                        type="text"
                        required={true}
                        value={dataConvocatoria.coautores[index]?.email || ''}
                        change={(e) => manageCoauthors(index, 'email', e.target.value)}
                        placeholder="Ingresa el correo"
                        disabled={pendiente}
                      />
                    </div>

                  );
                })}

                <div className='flex justify-between w-1/3 mb-4'>
                  <button
                    type="button"
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors" onClick={() => setCountCoauthors(countCoauthors + 1)}>
                    <PlusCircle className="text-white" size={25} />

                  </button>
                  {countCoauthors >= 1 && (
                    <button
                      type="button"
                      className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg transition-colors"
                      onClick={() => {
                        setCountCoauthors(countCoauthors - 1);
                        setDataConvocatoria({
                          ...dataConvocatoria,
                          coautores: dataConvocatoria.coautores.slice(0, countCoauthors - 1)
                        });
                      }}>
                  <MinusCircleIcon className="text-white " size={25} />
                </button>
                  )}
            </div>

            <FormLabelInput
              title="PDF de tu propuesta"
              children={<FileText className="absolute left-3 top-3 text-black" size={20} />}
              type="file"
              required={true}
              change={(e) => setFile(e.target.files[0])}
              placeholder="Selecciona tu archivo"
              accept=".pdf"
              multiple={false}
              disabled={pendiente} />


            <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors p-3">
              {pendiente ? 'Enviando...' : 'Enviar Propuesta'}
            </button>
          </form>
        </div>
        <button
          onClick={onClose}
          className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 rounded-lg transition-colors"
        >
          Cerrar
        </button>
      </div>
    </div>
      </div >
    </div >
  );
}