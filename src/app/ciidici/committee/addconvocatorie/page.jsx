'use client';
import { useEffect, useState } from 'react';
import { Calendar, FileText, Users, Tag, AlertCircle, CheckCircle, Edit2Icon } from 'lucide-react';
import Alert from '@/components/ui/alert';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import FormLabelInput from '@/components/ui/FormLabelInput';
import FormTextArea from '@/components/ui/FormTextArea';
import { href } from '@/utils/route';
export default function ConvocatoriaForm() {
  const router = useRouter();
  const { data: session } = useSession();
  const [registerData, setRegisterData] = useState({
    titulo: '',
    descripcion: '',
    fecha_inicio: '',
    fecha_cierre: '',
    areas_tematicas: '',
    requisitos: '',
  });

  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false)


  const validateForm = () => {
    const newErrors = {};

    if (!registerData.titulo) {
      newErrors.titulo = 'El título es obligatorio';
    }

    if (!registerData.descripcion) {
      newErrors.descripcion = 'La descripción es obligatoria';
    }

    if (!registerData.fecha_inicio) {
      newErrors.fecha_inicio = 'La fecha de inicio es obligatoria';
    }

    if (!registerData.fecha_cierre) {
      newErrors.fecha_cierre = 'La fecha de cierre es obligatoria';
    }

    if (registerData.fecha_inicio && registerData.fecha_cierre) {
      if (new Date(registerData.fecha_cierre) <= new Date(registerData.fecha_inicio)) {
        newErrors.fecha_cierre = 'La fecha de cierre debe ser posterior a la fecha de inicio';
      }
    }


    if (!registerData.areas_tematicas) {
      newErrors.areas_tematicas = 'Debe especificar al menos un área temática';
    }

    return newErrors;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    const newErrors = validateForm();

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
    } else {
      setIsLoading(true);
      try {
        const response = await fetch('/api/convocatories/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(registerData),
        });

        const data = await response.json();

        if (response.ok) {
          setSuccess(data.message);
        } else {
          setError(data.error);
        }
        setTimeout(() => {
          setSuccess('');
          setError('');
          handleCancel()
        }, 3000);

      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    }

  };



  const handleCancel = () => {
    setRegisterData({
      titulo: '',
      descripcion: '',
      fecha_inicio: '',
      fecha_cierre: '',
      areas_tematicas: '',
      requisitos: '',
    });
    setErrors({});
    router.push(href(session?.user?.rol || '/'));

  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Nueva Convocatoria CIIDiCI
          </h1>
          <p className="text-gray-600">
            Complete el formulario para crear una nueva convocatoria para el Congreso Internacional de Investigación y Divulgación de la Ciencia y la Ingeniería
          </p>
        </div>

        <Alert
          type={error ? 'error' : 'success'}
          message={error || success}
          isVisible={error || success}
          onClose={() => {
            setTimeout(() => { setShowAlert(!showAlert); }, 3000)
          }}
        />

        <form onSubmit={handleRegister} className="bg-white rounded-lg shadow-sm p-6 space-y-6">

          <div >
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              Información Básica
            </h2>

            <div className="space-y-4">
              <div>
                <FormLabelInput
                  title={"Título de la Convocatoria"}
                  children={<Edit2Icon className="absolute left-3 top-3 text-black" size={20} />}
                  type={"text"} value={registerData.titulo}
                  change={(e) => setRegisterData({ ...registerData, titulo: e.target.value })}
                  placeholder={"Ej: CIIDiCI 2026 - Convocatoria para Ponencias"}
                  required={true}
                />

                {errors.titulo && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.titulo}
                  </p>
                )}
              </div>

              <div>
                <FormTextArea
                  title={"Descripción General"}
                  children={<Edit2Icon className="absolute left-3 top-3 text-black" size={20} />}
                  value={registerData.descripcion}
                  change={(e) => setRegisterData({ ...registerData, descripcion: e.target.value })}
                  rows={4}
                  placeholder={"Describa los objetivos y alcance de la convocatoria..."}
                  required={true}
                />
                {errors.descripcion && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.descripcion}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div >
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
                  value={registerData.fecha_inicio}
                  onChange={(e) => setRegisterData({ ...registerData, fecha_inicio: e.target.value })}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.fecha_inicio ? 'border-red-500' : 'border-gray-300'
                    }`}
                />
                {errors.fecha_inicio && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.fecha_inicio}
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
                  value={registerData.fecha_cierre}
                  onChange={(e) => setRegisterData({ ...registerData, fecha_cierre: e.target.value })}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.fecha_cierre ? 'border-red-500' : 'border-gray-300'
                    }`}
                />
                {errors.fecha_cierre && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.fecha_cierre}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div >
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Tag className="w-5 h-5 text-blue-600" />
              Áreas Temáticas
            </h2>

            <div>
              <FormTextArea
                title={"Áreas Temáticas Aceptadas"}
                children={<Edit2Icon className="absolute left-3 top-3 text-black" size={20} />}
                value={registerData.areas_tematicas}
                change={(e) => setRegisterData({ ...registerData, areas_tematicas: e.target.value })}
                rows={4}
                placeholder={"Ingrese las áreas temáticas separadas por líneas"}
                required={true}
              />
              {errors.areas_tematicas && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.areas_tematicas}
                </p>
              )}
            </div>
          </div>

          <div >
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" />
              Requisitos y Documentos
            </h2>

            <div className="space-y-4">
              <FormTextArea
                title={"Requisitos de Participación"}
                children={<Edit2Icon className="absolute left-3 top-3 text-black" size={20} />}
                value={registerData.requisitos}
                change={(e) => setRegisterData({ ...registerData, requisitos: e.target.value })}
                rows={4}
                placeholder={"Describa los requisitos que deben cumplir los participantes..."}
                required={true}
              />
              <FormTextArea
                title={"Criterios de Evaluación"}
                children={<Edit2Icon className="absolute left-3 top-3 text-black" size={20} />}
                value={registerData.criteriosEvaluacion}
                change={(e) => setRegisterData({ ...registerData, criteriosEvaluacion: e.target.value })}
                rows={4}
                placeholder={"Describa los criterios que se utilizarán para evaluar las propuestas..."}
                required={true}
              />
            </div>
          </div>


          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={handleCancel}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <FileText className="w-4 h-4" />
              {
                isLoading ? 'Guardando...' : 'Guardar Convocatoria'
              }
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}