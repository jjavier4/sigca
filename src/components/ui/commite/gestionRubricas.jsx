'use client';
import React, { useState } from 'react';
import { FileText, Loader2 } from 'lucide-react';
import Alert from '@/components/ui/utils/alert';
import ModalConfirm from '@/components/ui/utils/modalConfirm';
import FormLabelInput from '@/components/ui/form/FormLabelInput';
import TablaCriterios from '@/components/ui/commite/TablaCriterios';
import useAccion from '@/hooks/useAccion';
import { crearCriterio, eliminarCriterio } from '@/actions/rubricas';

const TITULOS_GRUPO = {
  DIFUSION: 'Difusión',
  DIVULGACION: 'Divulgación',
};

const CRITERIO_VACIO = {
  nombre: '',
  descripcion: '',
  puntaje10: '',
  puntaje8: '',
  puntaje6: '',
  puntaje0: '',
};

const CAMPOS_PUNTAJE = [
  { campo: 'puntaje10', etiqueta: 'Descripción 10 puntos', placeholder: 'Cumple totalmente...' },
  { campo: 'puntaje8', etiqueta: 'Descripción 8 puntos', placeholder: 'Cumple parcialmente...' },
  { campo: 'puntaje6', etiqueta: 'Descripción 6 puntos', placeholder: 'Cumple mínimamente...' },
  { campo: 'puntaje0', etiqueta: 'Descripción 0 puntos', placeholder: 'No cumple...' },
];

function mensajeEliminacion(criterio, rubricas) {
  if (!criterio) return '';
  const activas = rubricas[criterio.grupo]?.asignacionesActivas ?? 0;
  const base = `Se eliminará definitivamente el criterio "${criterio.nombre}" de ${TITULOS_GRUPO[criterio.grupo]}. Esta acción no se puede deshacer.`;
  if (activas === 0) return base;
  return `${base} Hay ${activas} asignación(es) activa(s) de ${TITULOS_GRUPO[criterio.grupo]}: los revisores que tengan la evaluación abierta deberán recargarla para enviarla.`;
}

export default function GestionRubricas({ rubricas }) {
  const [modalGrupo, setModalGrupo] = useState(null);
  const [formData, setFormData] = useState(CRITERIO_VACIO);
  const [criterioAEliminar, setCriterioAEliminar] = useState(null);
  const { ejecutar, pendiente, alerta } = useAccion();

  const handleAbrirModal = (grupo) => {
    setFormData(CRITERIO_VACIO);
    setModalGrupo(grupo);
  };

  const handleCerrarModal = () => {
    setModalGrupo(null);
    setFormData(CRITERIO_VACIO);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const resultado = await ejecutar(() =>
      crearCriterio({
        nombre: formData.nombre,
        descripcion: formData.descripcion,
        grupo: modalGrupo,
        descripcion_puntaje: CAMPOS_PUNTAJE.map(({ campo }) => formData[campo]),
      })
    );

    if (resultado?.ok) handleCerrarModal();
  };

  const confirmarEliminacion = async () => {
    await ejecutar(() => eliminarCriterio(criterioAEliminar.id));
    setCriterioAEliminar(null);
  };

  return (
    <div>
      <Alert {...alerta} />

      <ModalConfirm
        abierto={criterioAEliminar !== null}
        titulo="Eliminar criterio"
        mensaje={mensajeEliminacion(criterioAEliminar, rubricas)}
        textoConfirmar="Eliminar"
        cargando={pendiente}
        onConfirmar={confirmarEliminacion}
        onCancelar={() => setCriterioAEliminar(null)}
      />

      <h2 className="text-3xl font-bold text-gray-800 mb-6">
        Gestión de Criterios de Evaluación
      </h2>

      {Object.entries(TITULOS_GRUPO).map(([grupo, titulo]) => (
        <TablaCriterios
          key={grupo}
          criterios={rubricas[grupo]?.criterios ?? []}
          grupo={grupo}
          titulo={titulo}
          handleEliminar={setCriterioAEliminar}
          handleAbrirModal={handleAbrirModal}
        />
      ))}

      {modalGrupo && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="sticky top-0 bg-white border-b px-6 py-4">
              <h3 className="text-xl font-bold text-gray-900">
                Nuevo Criterio - {TITULOS_GRUPO[modalGrupo]}
              </h3>
            </div>

            <div className="p-6 space-y-4">
              <FormLabelInput
                title="Nombre del Criterio"
                children={<FileText className="absolute left-3 top-3 text-black" size={20} />}
                type="text"
                value={formData.nombre}
                change={(e) => setFormData({ ...formData, nombre: e.target.value })}
                placeholder="Ej: Organización y estructura"
                required={true}
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descripción
                </label>
                <textarea
                  value={formData.descripcion}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                  className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows="3"
                  placeholder="Descripción detallada del criterio..."
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {CAMPOS_PUNTAJE.map(({ campo, etiqueta, placeholder }) => (
                  <div key={campo}>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {etiqueta}
                    </label>
                    <textarea
                      value={formData[campo]}
                      onChange={(e) => setFormData({ ...formData, [campo]: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows="3"
                      placeholder={placeholder}
                      required
                    />
                  </div>
                ))}
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={pendiente}
                  className="flex-1 bg-blue-600 cursor-pointer hover:bg-blue-700 disabled:bg-blue-400 text-white inline-flex items-center justify-center gap-2 font-semibold py-3 rounded-lg transition-all duration-300"
                >
                  {pendiente ? (
                    <>
                      <Loader2 size={16} className=" text-white  animate-spin " />
                      Guardando...
                    </>
                  ) : (
                    'Guardar Criterio'
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleCerrarModal}
                  disabled={pendiente}
                  className="flex-1 bg-gray-600 cursor-pointer hover:bg-gray-700 text-white font-semibold py-3 rounded-lg transition-all duration-300"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
