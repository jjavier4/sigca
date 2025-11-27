"use client"
import React, { useState, useEffect } from 'react'
import CardWork from '@/components/ui/cards/cardWork';
import CardInfo from '@/components/ui/cards/cardInfo';
import Loading from '@/components/ui/utils/loading';
import LoadingError from '@/components/ui/utils/loadingError';
import { FileText } from 'lucide-react';
import { useSession } from 'next-auth/react';
export default function DashboardAuthor() {

  const { data: session } = useSession();
  const [trabajos, setTrabajos] = useState([]);
  const [loading, setLoading] = useState(true);// Estado de carga inicial
  const [errorLoading, setErrorLoading] = useState(false) // Estado de error de carga inicial
  const [error, setError] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('TODOS');
  const [itemSelected, setItemSelected] = useState(null);

  useEffect(() => {
    if (session?.user?.id) {
      fetchTrabajos();
    }
  }, [session]);

  const fetchTrabajos = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/works/findbyuser?userId=${session.user.id}`);
      const data = await response.json();

      if (response.ok) {
        setTrabajos(data.trabajos);
      } else {
        setError(data.error);
      }
    } catch (error) {
      console.error('Error al cargar trabajos:', error);
      setErrorLoading(true);
    } finally {
      setLoading(false);
    }
  };

  const trabajosFiltrados = trabajos.filter((trabajo) => {
    if (filtroEstado === 'TODOS') return true;
    return trabajo.estado === filtroEstado;
  });

  const getEstadisticas = () => {
    return {
      total: trabajos.length,
      enRevision: trabajos.filter(t => t.estado === 'EN_REVISION').length,
      aceptados: trabajos.filter(t => t.estado === 'ACEPTADO').length,
      cambios: trabajos.filter(t => t.estado === 'CAMBIOS_SOLICITADOS').length,
      rechazados: trabajos.filter(t => t.estado === 'RECHAZADO').length
    };
  };

  const stats = getEstadisticas();

  if (loading) {
    return (
      <Loading />
    );
  }

  if (errorLoading) {
    return (
      <LoadingError error="Error al cargar los trabajos." />
    );
  }


  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Mis Trabajos
          </h1>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <CardInfo title="Total de Trabajos" stats={stats.total} classN="border-gray-400" onclick={() => setFiltroEstado('TODOS')} select={filtroEstado === 'TODOS'} />
          <CardInfo title="En Revisión" stats={stats.enRevision} classN="border-blue-400" onclick={() => setFiltroEstado('EN_REVISION')} select={filtroEstado === 'EN_REVISION'} />
          <CardInfo title="Aceptados" stats={stats.aceptados} classN="border-green-400" onclick={() => setFiltroEstado('ACEPTADO')} select={filtroEstado === 'ACEPTADO'} />
          <CardInfo title="Con Cambios" stats={stats.cambios} classN="border-orange-400" onclick={() => setFiltroEstado('CAMBIOS_SOLICITADOS')} select={filtroEstado === 'CAMBIOS_SOLICITADOS'} />
          <CardInfo title="Rechazados" stats={stats.rechazados} classN="border-red-400" onclick={() => setFiltroEstado('RECHAZADO')} select={filtroEstado === 'RECHAZADO'} />
        </div>

        {/* Grid de Cards */}
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
            {trabajosFiltrados.map((trabajo, numWork) => (
              <CardWork
                key={trabajo.id}
                numWork={numWork + 1}
                trabajo={trabajo}
              />
            ))}
          </div>
        )}
      </div>


    </div>
  );
}
