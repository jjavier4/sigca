"use client";
import React, { useState } from 'react';
import { FileText, User, Pen, PlusCircle, MinusCircleIcon, Trash2, CheckCircle, CircleX, AlertCircle } from 'lucide-react';
import FormLabelInput from '@/components/ui/form/FormLabelInput';

const TAMANO_MAXIMO = 10 * 1024 * 1024;


export function EditWork({ trabajo, onClose, onGuardar, pendiente }) {
  const [file, setFile] = useState(null);
  const [countCoauthors, setCountCoauthors] = useState(0);
  const [dataConvocatoria, setDataConvocatoria] = useState({
    tituloPropuesta: trabajo.titulo,
    tipo: trabajo.tipo,
    coautores: []
  });
  const [currentCoauthors, setCurrentCoauthors] = useState(trabajo.coautores || []);
  const [updateCoauthors, setUpdateCoauthors] = useState({
    state: false,
    index: null,
    coautor: {
      nombre: '',
      email: ''
    }
  });
  const [errorLocal, setErrorLocal] = useState('');
  if (!trabajo) return null;

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
    if (currentCoauthors.some(coautor => !emailRegex.test(coautor.email))) {
      setErrorLocal('Por favor, ingresa correos electrónicos válidos para los coautores');
      return;
    }
    if (file && file.size > TAMANO_MAXIMO) {
      setErrorLocal('El archivo excede el tamaño máximo permitido (10MB)');
      return;
    }

    const coautores = [
      ...currentCoauthors.map(({ id, nombre, email }) => ({ id, nombre, email })),
      ...dataConvocatoria.coautores
    ];

    const formData = new FormData();
    formData.append('dataConvocatoria', JSON.stringify({ ...dataConvocatoria, coautores }));
    formData.append('trabajoId', trabajo.id);
    if (file) formData.append('file', file);

    const resultado = await onGuardar(formData);
    if (resultado.ok) onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r bg-blue-600 p-6 sticky top-0 flex justify-end">
          <button
            onClick={onClose}
            className="text-white cursor-pointer"
          >
            ✕
          </button>

        </div>

        {/* Contenido */}
        <div className="p-6 space-y-6">
          {/* Descripción completa */}
          {trabajo.convocatoria.descripcion && (
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2 flex items-center">

                Edita los campos que quieras actualizar de tu propuesta para la convocatoria: {trabajo.convocatoria.titulo}
              </h3>
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
                {currentCoauthors.length > 0 ? (
                  <div className="w-full overflow-x-auto">
                    <p className="text-xs font-medium text-gray8700 mb-2">Coautores Registrados:</p>
                    <table className="w-full mt-2 border border-gray-200 rounded-lg table-fixed">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="px-2 py-2 text-left text-sm font-medium text-gray-700">Nombre</th>
                          <th className="px-2 py-2 text-left text-sm font-medium text-gray-700">Email</th>
                          <th className="px-2 py-2 text-left text-sm font-medium text-gray-700 w-1/6">Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {currentCoauthors.map((coautor, index) => (
                          <tr key={index} className="border-b border-gray-200">
                            <td className="px-2 py-2 text-sm text-gray-700 break-words">{coautor.nombre}</td>
                            <td className="px-2 py-2 text-sm text-gray-700 break-all">{coautor.email}</td>
                            <td className="px-2 py-2 text-sm text-gray-700 justify-items-center gap-4 flex  w-1/6">
                              <button
                                type="button"
                                title="Editar coautor"
                                onClick={() => {
                                  setUpdateCoauthors({
                                    state: true,
                                    index: index,
                                    coautor: { ...coautor }
                                  });
                                }}
                                className="text-blue-600 hover:text-blue-800 transition-colors"
                              >
                                <Pen size={18} />
                              </button>
                              <button
                                type="button"
                                title="Eliminar coautor"
                                onClick={() => {
                                  const nuevosCoautores = [...currentCoauthors]
                                  nuevosCoautores.splice(index, 1)
                                  setCurrentCoauthors(nuevosCoautores)
                                }}
                                className="text-red-600 hover:text-red-800 transition-colors"
                              >
                                <Trash2 size={18} />
                              </button>

                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) :
                  (
                    <div>
                      <strong>Coautores:</strong>
                      <p className="text-sm text-gray-600">No hay coautores asociados a este trabajo.</p>
                    </div>

                  )
                }
                {
                  updateCoauthors.state && (
                    <div className="flex flex-col md:flex-row gap-4 mb-4 border p-4 rounded-lg bg-gray-50">
                      <FormLabelInput
                        title="Editar Nombre Coautor"
                        children={<User className="absolute left-3 top-3 text-black" size={20} />}
                        type="text"
                        required={true}
                        value={updateCoauthors.coautor.nombre}
                        change={(e) => setUpdateCoauthors({
                          ...updateCoauthors,
                          coautor: {
                            ...updateCoauthors.coautor,
                            nombre: e.target.value
                          }
                        })}
                        placeholder="Ingresa el nombre"
                      />
                      <FormLabelInput
                        title="Editar Correo Coautor"
                        children={<User className="absolute left-3 top-3 text-black" size={20} />}
                        type="text"
                        required={true}
                        value={updateCoauthors.coautor.email}
                        change={(e) => setUpdateCoauthors({
                          ...updateCoauthors,
                          coautor: {
                            ...updateCoauthors.coautor,
                            email: e.target.value
                          }
                        })}
                        placeholder="Ingresa el correo"
                      />
                      <div className="flex flex-col justify-center items-center gap-2">
                        <button
                          type="button"
                          title="Guardar cambios"
                          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white p-2 rounded-lg transition-colors"
                          onClick={() => {
                            const nuevosCoautores = [...currentCoauthors];
                            nuevosCoautores[updateCoauthors.index] = { ...updateCoauthors.coautor, update: true };
                            setCurrentCoauthors(nuevosCoautores);
                            setUpdateCoauthors({ state: false, index: null, coautor: { nombre: '', email: '' } });
                          }}
                        >
                          <CheckCircle className="text-white" size={20} />
                        </button>

                        <button
                          type="button"
                          title="Cancelar edición"
                          className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white p-2 rounded-lg transition-colors"
                          onClick={() => {
                            setUpdateCoauthors({ state: false, index: null, coautor: { nombre: '', email: '' } });
                          }}
                        >
                          <CircleX className="text-white" size={20} />
                        </button>
                      </div>
                    </div>
                  )
                }

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
                    title="Agregar coautor"
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors" onClick={() => setCountCoauthors(countCoauthors + 1)}>
                    <PlusCircle className="text-white" size={25} />

                  </button>
                  {countCoauthors >= 1 && (
                    <button
                      type="button"
                      title="Eliminar coautor"
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
                  title="Actualizar PDF de tu propuesta"
                  children={<FileText className="absolute left-3 top-3 text-black" size={20} />}
                  type="file"
                  required={false}
                  change={(e) => setFile(e.target.files[0])}
                  placeholder="Selecciona tu archivo"
                  accept=".pdf"
                  multiple={false}
                  disabled={pendiente} />


                <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors p-3">
                  {pendiente ? 'Guardando...' : 'Guardar Cambios'}
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
      </div>
    </div>
  );
}