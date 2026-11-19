"use client";
import React, { useState } from 'react';
import { FileText, User, Mail, Pen, PlusCircle, MinusCircleIcon, Trash2, CheckCircle, CircleX, AlertCircle, Loader2, Users, X } from 'lucide-react';
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
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-900 to-blue-800 px-6 py-4 sticky top-0 z-10 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="shrink-0 p-2 rounded-lg bg-white/10 text-blue-200">
              <Pen size={18} />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-medium uppercase tracking-wider text-blue-200">
                Edición
              </p>
              <h2 className="text-white font-semibold leading-snug truncate" title={trabajo.titulo}>
                {trabajo.titulo}
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="shrink-0 p-2 rounded-lg text-blue-100 hover:text-white hover:bg-white/10 cursor-pointer transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
            aria-label="Cerrar"
            title="Cerrar"
          >
            <X size={20} />
          </button>
        </div>

        {/* Contenido */}
        <div className="p-6 space-y-6">
          {/* Descripción completa */}
          {trabajo.convocatoria.descripcion && (
            <div className=" bg-blue-50 rounded-lg px-4 py-3">
              <p className="text-sm text-gray-600">
                Edita los campos que quieras actualizar de tu propuesta para la convocatoria:
              </p>
              <h3 className="text-base font-semibold text-gray-900 mt-1">
                {trabajo.convocatoria.titulo}
              </h3>
            </div>
          )}

          {/* Botones de acción */}
          <div className="flex flex-col gap-3">

            <div className="flex-1 border border-gray-200 rounded-xl p-5">
              {errorLocal && (
                <div className="mb-5 bg-red-50 border border-red-200 border-l-4 border-l-red-600 rounded-lg p-3 flex items-start gap-2" role="alert">
                  <AlertCircle className="text-red-600 shrink-0 mt-0.5" size={18} />
                  <p className="text-red-800 text-sm">{errorLocal}</p>
                </div>
              )}
              <form className="space-y-6" onSubmit={handleSubmit}> {/**handleSubmit */}

                {/* Datos generales */}
                <section className="space-y-4">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                    Datos de la propuesta
                  </p>

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
                      className="w-full pl-3 pr-4 py-3 border border-gray-300 bg-white text-black rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all cursor-pointer"
                    >
                      <option value="DIVULGACION">Divulgacion</option>
                      <option value="DIFUSION">Difusion</option>
                    </select>
                  </div>
                </section>

                {/* Coautores */}
                <section className="space-y-4 pt-6 border-t border-gray-100">
                  <div className="flex items-center gap-2">
                    <Users size={16} className="text-gray-500" />
                    <label className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                      Control de Coautores
                    </label>
                    {currentCoauthors.length > 0 && (
                      <span className="ml-auto text-[11px] font-semibold text-blue-700 bg-blue-50 border border-blue-100 rounded-full px-2 py-0.5">
                        {currentCoauthors.length} registrados
                      </span>
                    )}
                  </div>

                  {currentCoauthors.length > 0 ? (
                    <div className="w-full overflow-x-auto rounded-lg border border-gray-200">
                      <table className="w-full table-fixed">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600">Nombre</th>
                            <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600">Email</th>
                            <th className="px-3 py-2 text-center text-xs font-semibold text-gray-600 w-24">Acciones</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {currentCoauthors.map((coautor, index) => (
                            <tr
                              key={index}
                              className={`transition-colors ${updateCoauthors.state && updateCoauthors.index === index ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
                            >
                              <td className="px-3 py-2 text-sm text-gray-800 break-words">{coautor.nombre}</td>
                              <td className="px-3 py-2 text-sm text-gray-600 break-all">{coautor.email}</td>
                              <td className="px-3 py-2">
                                <div className="flex items-center justify-center gap-1">
                                  <button
                                    type="button"
                                    title="Editar coautor"
                                    aria-label="Editar coautor"
                                    onClick={() => {
                                      setUpdateCoauthors({
                                        state: true,
                                        index: index,
                                        coautor: { ...coautor }
                                      });
                                    }}
                                    className="p-1.5 rounded-md text-blue-600 hover:text-blue-800 hover:bg-blue-50 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
                                  >
                                    <Pen size={16} />
                                  </button>
                                  <button
                                    type="button"
                                    title="Eliminar coautor"
                                    aria-label="Eliminar coautor"
                                    onClick={() => {
                                      const nuevosCoautores = [...currentCoauthors]
                                      nuevosCoautores.splice(index, 1)
                                      setCurrentCoauthors(nuevosCoautores)
                                    }}
                                    className="p-1.5 rounded-md text-red-600 hover:text-red-800 hover:bg-red-50 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 italic bg-gray-50 border border-dashed border-gray-200 rounded-lg px-3 py-2">
                      No hay coautores asociados a este trabajo.
                    </p>
                  )}

                  {
                    updateCoauthors.state && (
                      <div className="border border-blue-200 bg-blue-50/60 rounded-lg p-4 space-y-3">
                        <p className="text-xs font-semibold text-blue-800 flex items-center gap-1.5">
                          <Pen size={14} />
                          Editando coautor
                        </p>
                        <div className="flex flex-col md:flex-row gap-4">
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
                            children={<Mail className="absolute left-3 top-3 text-black" size={20} />}
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
                        </div>
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            title="Cancelar edición"
                            className="inline-flex items-center gap-1.5 bg-white border border-red-200 text-red-700 hover:bg-red-50 text-sm font-medium px-3 py-2 rounded-lg transition-colors"
                            onClick={() => {
                              setUpdateCoauthors({ state: false, index: null, coautor: { nombre: '', email: '' } });
                            }}
                          >
                            <CircleX size={16} />
                            Cancelar
                          </button>
                          <button
                            type="button"
                            title="Guardar cambios"
                            className="inline-flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white text-sm font-medium px-3 py-2 rounded-lg transition-colors"
                            onClick={() => {
                              const nuevosCoautores = [...currentCoauthors];
                              nuevosCoautores[updateCoauthors.index] = { ...updateCoauthors.coautor, update: true };
                              setCurrentCoauthors(nuevosCoautores);
                              setUpdateCoauthors({ state: false, index: null, coautor: { nombre: '', email: '' } });
                            }}
                          >
                            <CheckCircle size={16} />
                            Aplicar
                          </button>
                        </div>
                      </div>
                    )
                  }

                  {Array.from({ length: countCoauthors }).map((_, index) => {
                    return (
                      <div key={index} className="relative border border-gray-200 rounded-lg p-4 pt-5">
                        <span className="absolute -top-2.5 left-3 bg-white px-2 text-[11px] font-semibold uppercase tracking-wider text-blue-700">
                          Nuevo coautor {index + 1}
                        </span>
                        <div className="flex flex-col md:flex-row gap-4">
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
                            children={<Mail className="absolute left-3 top-3 text-black" size={20} />}
                            type="text"
                            required={true}
                            value={dataConvocatoria.coautores[index]?.email || ''}
                            change={(e) => manageCoauthors(index, 'email', e.target.value)}
                            placeholder="Ingresa el correo"
                            disabled={pendiente}
                          />
                        </div>
                      </div>
                    );
                  })}

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      title="Agregar coautor"
                      className="inline-flex items-center gap-2 border border-blue-600 text-blue-700 hover:bg-blue-50 text-sm font-semibold px-4 py-2 rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
                      onClick={() => setCountCoauthors(countCoauthors + 1)}>
                      <PlusCircle size={18} />
                      Agregar coautor
                    </button>
                    {countCoauthors >= 1 && (
                      <button
                        type="button"
                        title="Eliminar coautor"
                        className="inline-flex items-center gap-2 border border-red-200 text-red-700 hover:bg-red-50 text-sm font-semibold px-4 py-2 rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
                        onClick={() => {
                          setCountCoauthors(countCoauthors - 1);
                          setDataConvocatoria({
                            ...dataConvocatoria,
                            coautores: dataConvocatoria.coautores.slice(0, countCoauthors - 1)
                          });
                        }}>
                        <MinusCircleIcon size={18} />
                        Quitar último
                      </button>
                    )}
                  </div>
                </section>

                {/* Archivo */}
                <section className="space-y-2 pt-6 border-t border-gray-100">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                    Documento
                  </p>
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
                  <p className="text-xs text-gray-500">
                    {file ? <>Seleccionado: <span className="font-medium text-gray-700">{file.name}</span></> : 'Opcional. Solo PDF, máximo 10 MB. Si no eliges uno se conserva el actual.'}
                  </p>
                </section>

                <button className="w-full inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold rounded-lg shadow-sm transition-colors p-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2">
                  {pendiente ? <><Loader2 className="animate-spin" size={18} /> Guardando</> : 'Guardar Cambios'}
                </button>
              </form>
            </div>
            <button
              onClick={onClose}
              className="w-full bg-white border border-gray-300 hover:bg-gray-100 text-gray-700 font-semibold py-3 rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}