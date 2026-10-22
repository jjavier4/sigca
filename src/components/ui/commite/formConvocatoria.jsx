'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, FileText, AlertCircle, Edit2Icon } from 'lucide-react';
import Alert from '@/components/ui/utils/alert';
import FormLabelInput from '@/components/ui/form/FormLabelInput';
import FormTextArea from '@/components/ui/form/FormTextArea';
import useAccion from '@/hooks/useAccion';
import { crearConvocatoria } from '@/actions/convocatorias';

const CONVOCATORIA_VACIA = {
  titulo: '',
  descripcion: '',
  fecha_inicio: '',
  fecha_cierre: '',
};

function validarFormulario(datos) {
  const errores = {};

  if (!datos.titulo.trim()) errores.titulo = 'El título es obligatorio';
  if (!datos.descripcion.trim()) errores.descripcion = 'La descripción es obligatoria';
  if (!datos.fecha_inicio) errores.fecha_inicio = 'La fecha de inicio es obligatoria';
  if (!datos.fecha_cierre) errores.fecha_cierre = 'La fecha de cierre es obligatoria';

  if (datos.fecha_inicio && datos.fecha_cierre && datos.fecha_cierre < datos.fecha_inicio) {
    errores.fecha_cierre = 'La fecha de cierre no puede ser anterior a la fecha de inicio';
  }

  return errores;
}

export default function FormConvocatoria({ rutaPanel }) {
  const router = useRouter();
  const [datos, setDatos] = useState(CONVOCATORIA_VACIA);
  const [errores, setErrores] = useState({});
  const { ejecutar, pendiente, alerta } = useAccion();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const nuevosErrores = validarFormulario(datos);
    setErrores(nuevosErrores);
    if (Object.keys(nuevosErrores).length > 0) return;

    const resultado = await ejecutar(() => crearConvocatoria(datos));
    if (resultado?.ok) setDatos(CONVOCATORIA_VACIA);
  };

  return (
    <div className="max-w-1/2 mx-auto">
      <Alert {...alerta} />

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm p-6 space-y-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            Información Básica
          </h2>

          <div className="space-y-4">
            <div>
              <FormLabelInput
                title="Título de la Convocatoria"
                children={<Edit2Icon className="absolute left-3 top-3 text-black" size={20} />}
                type="text"
                value={datos.titulo}
                change={(e) => setDatos({ ...datos, titulo: e.target.value })}
                placeholder="Ej: CIIDiCI 2026 - Convocatoria para Ponencias"
                required={true}
              />
            </div>

            <div>
              <FormTextArea
                title="Descripción General"
                children={<Edit2Icon className="absolute left-3 top-3 text-black" size={20} />}
                formData={datos.descripcion}
                change={(e) => setDatos({ ...datos, descripcion: e.target.value })}
                rows={4}
                placeholder="Describa los objetivos y alcance de la convocatoria..."
                requiered={true}
              />
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            Fechas Importantes
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-black mb-2">
                Fecha de Inicio
              </label>
              <input
                type="date"
                name="fecha_inicio"
                value={datos.fecha_inicio}
                onChange={(e) => setDatos({ ...datos, fecha_inicio: e.target.value })}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errores.fecha_inicio ? 'border-red-500' : 'border-gray-300'
                  }`}
              />
              {errores.fecha_inicio && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errores.fecha_inicio}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-black mb-2">
                Fecha de Cierre
              </label>
              <input
                type="date"
                name="fecha_cierre"
                value={datos.fecha_cierre}
                onChange={(e) => setDatos({ ...datos, fecha_cierre: e.target.value })}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errores.fecha_cierre ? 'border-red-500' : 'border-gray-300'
                  }`}
              />
              {errores.fecha_cierre && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errores.fecha_cierre}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => router.push(rutaPanel)}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={pendiente}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <FileText className="w-4 h-4" />
            {pendiente ? 'Guardando...' : 'Guardar Convocatoria'}
          </button>
        </div>
      </form>
    </div>
  );
}
