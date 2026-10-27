'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FileText } from 'lucide-react';
import CardWork from '@/components/ui/cards/cardWork';
import CardInfo from '@/components/ui/cards/cardInfo';
import Alert from '@/components/ui/utils/alert';
import ModalConfirm from '@/components/ui/utils/modalConfirm';
import { EditWork } from '@/components/ui/autor/editWork';
import useAccion from '@/hooks/useAccion';
import { actualizarTrabajo, eliminarTrabajo } from '@/actions/trabajos';
import { basePath } from '@/utils/basePath.mjs';

export default function MisTrabajos({ trabajos }) {
  const router = useRouter();
  const [filtroEstado, setFiltroEstado] = useState('TODOS');
  const [trabajoAEditar, setTrabajoAEditar] = useState(null);
  const [trabajoAEliminar, setTrabajoAEliminar] = useState(null);
  const { ejecutar, pendiente, alerta } = useAccion();

  const generarReferenciaPago = async (trabajoId) => {
    await ejecutar(async () => {
      const respuesta = await fetch(`${basePath}/api/user/ref-pay`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trabajoid: trabajoId }),
      });

      if (!respuesta.ok) {
        return { ok: false, error: 'Error al generar la referencia de pago.' };
      }

      const blob = await respuesta.blob();
      const url = window.URL.createObjectURL(blob);
      const enlace = document.createElement('a');
      enlace.href = url;
      enlace.download = `Referencia_Pago_CIIDICI_${new Date().getFullYear()}.pdf`;
      document.body.appendChild(enlace);
      enlace.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(enlace);

      return { ok: true, message: 'Referencia de pago generada' };
    });
    router.refresh();
  };

  const confirmarEliminacion = async () => {
    await ejecutar(() => eliminarTrabajo(trabajoAEliminar.id));
    setTrabajoAEliminar(null);
  };

  const guardarEdicion = (formData) => ejecutar(() => actualizarTrabajo(formData));

  const trabajosFiltrados = trabajos.filter((trabajo) => {
    if (filtroEstado === 'TODOS') return true;
    return trabajo.estado === filtroEstado;
  });

  const stats = {
    total: trabajos.length,
    enRevision: trabajos.filter((trabajo) => trabajo.estado === 'EN_REVISION').length,
    aceptados: trabajos.filter((trabajo) => trabajo.estado === 'ACEPTADO').length,
    rechazados: trabajos.filter((trabajo) => trabajo.estado === 'RECHAZADO').length,
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <Alert {...alerta} />

        <ModalConfirm
          abierto={trabajoAEliminar !== null}
          titulo="Eliminar trabajo"
          mensaje={`Se eliminará definitivamente el trabajo "${trabajoAEliminar?.titulo ?? ''}" y su archivo PDF. Esta acción no se puede deshacer.`}
          textoConfirmar="Eliminar"
          cargando={pendiente}
          onConfirmar={confirmarEliminacion}
          onCancelar={() => setTrabajoAEliminar(null)}
        />

        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Mis Trabajos
          </h1>
        </div>

        <div className="grid grid-cols-3 lg:grid-cols-5  gap-4 mb-6">
          <CardInfo title="Total de Trabajos" stats={stats.total} classN="border-gray-400" onclick={() => setFiltroEstado('TODOS')} select={filtroEstado === 'TODOS'} />
          <CardInfo title="En Revisión" stats={stats.enRevision} classN="border-blue-400" onclick={() => setFiltroEstado('EN_REVISION')} select={filtroEstado === 'EN_REVISION'} />
          <CardInfo title="Aceptados" stats={stats.aceptados} classN="border-green-400" onclick={() => setFiltroEstado('ACEPTADO')} select={filtroEstado === 'ACEPTADO'} />
          <CardInfo title="Rechazados" stats={stats.rechazados} classN="border-red-400" onclick={() => setFiltroEstado('RECHAZADO')} select={filtroEstado === 'RECHAZADO'} />
        </div>

        {trabajosFiltrados.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <FileText className="mx-auto mb-4 text-gray-400" size={64} />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              No hay trabajos para mostrar
            </h3>
            <p className="text-gray-600">
              {filtroEstado === 'TODOS'
                ? 'Aún no has enviado ningún trabajo a una convocatoria'
                : `No tienes trabajos con estado: ${filtroEstado.replace('_', ' ')}`}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trabajosFiltrados.map((trabajo) => (
              <CardWork
                key={trabajo.id}
                trabajo={trabajo}
                getReferenciaPagoPDF={generarReferenciaPago}
                onDelete={setTrabajoAEliminar}
                onEdit={setTrabajoAEditar}
                ocupado={pendiente}
              />
            ))}
          </div>
        )}

        {trabajoAEditar && (
          <EditWork
            key={trabajoAEditar.id}
            trabajo={trabajoAEditar}
            onClose={() => setTrabajoAEditar(null)}
            onGuardar={guardarEdicion}
            pendiente={pendiente}
          />
        )}
      </div>
    </div>
  );
}
