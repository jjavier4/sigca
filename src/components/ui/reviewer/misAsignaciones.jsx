'use client';
import React, { useState } from 'react';
import { FileText, Eye } from 'lucide-react';
import Alert from '@/components/ui/utils/alert';
import CardInfo from '@/components/ui/cards/cardInfo';
import CardAssigment from '@/components/ui/reviewer/cardAssigment';
import CardRubric from '@/components/ui/reviewer/cardRubric';
import useAccion from '@/hooks/useAccion';
import { evaluarAsignacion } from '@/actions/asignaciones';
import { basePath } from '@/utils/basePath.mjs';

export default function MisAsignaciones({ asignaciones, criteriosPorGrupo }) {
  const [filtroEstado, setFiltroEstado] = useState('TODAS');
  const [seleccionada, setSeleccionada] = useState(null);
  const { ejecutar, pendiente, alerta } = useAccion();

  const enviarEvaluacion = async (evaluacion) => {
    const resultado = await ejecutar(() => evaluarAsignacion(evaluacion));
    if (resultado.ok) setSeleccionada(null);
  };

  const asignacionesFiltradas = asignaciones.filter((asignacion) => {
    if (filtroEstado === 'ACTIVAS') return asignacion.activa;
    if (filtroEstado === 'EVALUADAS') return !asignacion.activa;
    return true;
  });

  const stats = {
    total: asignaciones.length,
    activas: asignaciones.filter((asignacion) => asignacion.activa).length,
    evaluadas: asignaciones.filter((asignacion) => !asignacion.activa).length,
  };

  if (seleccionada) {
    return (
      <div className="h-screen bg-gray-100 flex flex-col">
        <Alert {...alerta} />

        <div className="w-full px-4 pt-4 bg-gray-50">
          <a
            href={`${basePath}/api/works/${seleccionada.trabajo.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg transition-all duration-300 inline-flex items-center gap-2"
          >
            <Eye size={16} />
            Ver PDF del trabajo
          </a>
        </div>
        <div className="min-h-[500px] w-full p-4 bg-gray-50">
          <CardRubric
            key={seleccionada.id}
            asignacion={seleccionada}
            criterios={criteriosPorGrupo[seleccionada.trabajo.tipo] ?? []}
            onSubmit={enviarEvaluacion}
            isLoading={pendiente}
            onCancel={() => setSeleccionada(null)}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Mis Asignaciones</h1>
          <p className="text-gray-600">Trabajos asignados para revisión</p>
        </div>

        <Alert {...alerta} />

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <CardInfo title="Total de Trabajos" stats={stats.total} classN="border-gray-400" onclick={() => setFiltroEstado('TODAS')} select={filtroEstado === 'TODAS'} />
          <CardInfo title="Activas" stats={stats.activas} classN="border-blue-400" onclick={() => setFiltroEstado('ACTIVAS')} select={filtroEstado === 'ACTIVAS'} />
          <CardInfo title="Evaluadas" stats={stats.evaluadas} classN="border-orange-400" onclick={() => setFiltroEstado('EVALUADAS')} select={filtroEstado === 'EVALUADAS'} />
        </div>

        {asignacionesFiltradas.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <FileText className="mx-auto mb-4 text-gray-400" size={64} />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No hay asignaciones</h3>
            <p className="text-gray-600">No tienes trabajos asignados en este momento</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {asignacionesFiltradas.map((asignacion) => (
              <CardAssigment
                key={asignacion.id}
                asignacion={asignacion}
                onSelect={setSeleccionada}
                isSelected={seleccionada?.id === asignacion.id}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
