'use client';
import React, { useState } from 'react';
import { FileText, Calendar, ListChecks } from 'lucide-react';
import RowConvocatorie from '@/components/ui/utils/rowConvocatorie';
import Alert from '@/components/ui/utils/alert';
import ModalConfirm from '@/components/ui/utils/modalConfirm';
import FormLabelInput from '@/components/ui/form/FormLabelInput';
import FormTextArea from '@/components/ui/form/FormTextArea';
import useAccion from '@/hooks/useAccion';
import { formatearDiaISO } from '@/utils/fechas';
import { actualizarConvocatoria, desactivarConvocatoria } from '@/actions/convocatorias';

function mensajeDesactivacion(convocatoria) {
  if (!convocatoria) return '';
  const total = convocatoria._count?.trabajos ?? 0;
  if (total === 0) {
    return `Se desactivará la convocatoria "${convocatoria.titulo}". Esta acción no se puede deshacer desde la aplicación.`;
  }
  return `Se desactivará la convocatoria "${convocatoria.titulo}". Sus ${total} trabajo(s) se conservan, pero se eliminarán sus asignaciones de revisión, con sus calificaciones y comentarios. Esta acción no se puede deshacer desde la aplicación.`;
}

function aEdicion(convocatoria) {
  return {
    id: convocatoria.id,
    titulo: convocatoria.titulo,
    descripcion: convocatoria.descripcion ?? '',
    fecha_inicio: formatearDiaISO(convocatoria.fecha_inicio),
    fecha_cierre: formatearDiaISO(convocatoria.fecha_cierre),
  };
}

export default function GestionConvocatorias({ convocatorias }) {
  const [enEdicion, setEnEdicion] = useState(null);
  const [convocatoriaADesactivar, setConvocatoriaADesactivar] = useState(null);
  const { ejecutar, pendiente, alerta } = useAccion();

  const guardarEdicion = async (e) => {
    e.preventDefault();
    const resultado = await ejecutar(() => actualizarConvocatoria(enEdicion));
    if (resultado?.ok) setEnEdicion(null);
  };

  const confirmarDesactivacion = async () => {
    await ejecutar(() => desactivarConvocatoria(convocatoriaADesactivar.id));
    setConvocatoriaADesactivar(null);
  };

  return (
    <div>
      <ModalConfirm
        abierto={convocatoriaADesactivar !== null}
        titulo="Desactivar convocatoria"
        mensaje={mensajeDesactivacion(convocatoriaADesactivar)}
        textoConfirmar="Desactivar"
        cargando={pendiente}
        onConfirmar={confirmarDesactivacion}
        onCancelar={() => setConvocatoriaADesactivar(null)}
      />
      <Alert {...alerta} />
      <h2 className="text-3xl font-bold text-gray-800 mb-6">
        Gestionar Convocatorias
      </h2>
      {enEdicion ? (
        <>
          <h2 className="text-3xl font-bold text-gray-800 mb-6">
            Actualizar Convocatoria: {enEdicion.titulo}
          </h2>
          <form onSubmit={guardarEdicion} className="space-y-4">
            <FormLabelInput
              title="Título"
              children={<FileText className="absolute left-3 top-3 text-black" size={20} />}
              type="text"
              value={enEdicion.titulo}
              change={(e) => setEnEdicion({ ...enEdicion, titulo: e.target.value })}
              placeholder="Título de la convocatoria"
              required={true}
            />
            <FormTextArea
              title="Descripción"
              children={<FileText className="absolute left-3 top-3 text-black" size={20} />}
              formData={enEdicion.descripcion}
              change={(e) => setEnEdicion({ ...enEdicion, descripcion: e.target.value })}
              rows={5}
              placeholder="Descripción de la convocatoria"
              requiered={true}
            />

            <FormLabelInput
              title="Fecha de Inicio"
              children={<Calendar className="absolute left-3 top-3 text-black" size={20} />}
              type="date"
              value={enEdicion.fecha_inicio}
              change={(e) => setEnEdicion({ ...enEdicion, fecha_inicio: e.target.value })}
              placeholder=""
              required={true}
            />

            <FormLabelInput
              title="Fecha de Cierre"
              children={<Calendar className="absolute left-3 top-3 text-black" size={20} />}
              type="date"
              value={enEdicion.fecha_cierre}
              change={(e) => setEnEdicion({ ...enEdicion, fecha_cierre: e.target.value })}
              placeholder=""
              min={enEdicion.fecha_inicio}
              required={true}
            />

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={pendiente}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 rounded-lg transition-all duration-300"
              >
                {pendiente ? 'Actualizando...' : 'Actualizar'}
              </button>
              <button
                type="button"
                disabled={pendiente}
                onClick={() => setEnEdicion(null)}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 rounded-lg transition-all duration-300"
              >
                Cancelar
              </button>
            </div>
          </form>
        </>
      ) : convocatorias.length === 0 ? (
        <div className="bg-white text-gray-600 rounded-lg shadow-md overflow-hidden">
          <div className="text-center py-12 px-6">
            <ListChecks className="mx-auto mb-4 h-16 w-16 text-gray-400" />
            <p className="text-gray-500 text-lg">
              No hay convocatorias registradas.
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-white text-gray-600 rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Título
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Fecha Inicio
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Fecha Fin
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Trabajos
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {convocatorias.map((convocatoria) => (
                  <RowConvocatorie
                    key={convocatoria.id}
                    titulo={convocatoria.titulo}
                    fecha_inicio={convocatoria.fecha_inicio}
                    fecha_cierre={convocatoria.fecha_cierre}
                    activa={convocatoria.activa}
                    totalTrabajos={convocatoria._count?.trabajos ?? 0}
                    onEdit={() => setEnEdicion(aEdicion(convocatoria))}
                    onDelete={() => setConvocatoriaADesactivar(convocatoria)}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
