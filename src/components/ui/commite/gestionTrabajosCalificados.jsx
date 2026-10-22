'use client';
import React, { useState } from 'react';
import { FileText } from 'lucide-react';
import Alert from '@/components/ui/utils/alert';
import Loading from '@/components/ui/utils/loading';
import RowWorkAssessed from '@/components/ui/commite/rowWorkAssessed';
import CardInfo from '@/components/ui/cards/cardInfo';
import useAccion from '@/hooks/useAccion';
import { aceptarTrabajo, rechazarTrabajo, reenviarDictamen } from '@/actions/dictamenes';

export default function GestionTrabajosCalificados({ trabajos, anio }) {
    const [filtroEstado, setFiltroEstado] = useState('TODOS');
    const [presencialPorTrabajo, setPresencialPorTrabajo] = useState({});
    const { ejecutar, pendiente, alerta } = useAccion();

    const handlePresencialChange = (trabajoId, presencial) => {
        setPresencialPorTrabajo(prev => ({ ...prev, [trabajoId]: presencial }));
    };

    const handleAceptar = (trabajoId) => {
        const trabajo = trabajos.find(t => t.id === trabajoId);
        const presencial = presencialPorTrabajo[trabajoId] ?? trabajo?.presencial ?? false;
        return ejecutar(() => aceptarTrabajo({ trabajoId, presencial }));
    };

    const handleRechazar = (trabajoId) => ejecutar(() => rechazarTrabajo(trabajoId));

    const handleReenviar = (trabajo) => ejecutar(() => reenviarDictamen(trabajo.id));

    const trabajosFiltrados = trabajos.filter((trabajo) => {
        if (filtroEstado === 'TODOS') return true;
        return trabajo.estado === filtroEstado;
    });

    const getEstadisticas = () => {
        return {
            total: trabajos.length,
            registrados: trabajos.filter(t => t.estado === 'REGISTRADO').length,
            enRevision: trabajos.filter(t => t.estado === 'EN_REVISION').length,
            aceptados: trabajos.filter(t => t.estado === 'ACEPTADO').length,
            rechazados: trabajos.filter(t => t.estado === 'RECHAZADO').length
        };
    };

    const stats = getEstadisticas();

    return (
        <div>
            {pendiente && <Loading />}

            <Alert {...alerta} />

            <div className="mb-4 sm:mb-6">
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-1 sm:mb-2">
                    Trabajos Calificados - {anio}
                </h2>
            </div>

            {/* Estadísticas */}
            <div className="grid grid-cols-3 lg:grid-cols-5  gap-4 mb-6">

                <CardInfo title="Total de Trabajos" stats={stats.total} classN="border-gray-400" onclick={() => setFiltroEstado('TODOS')} select={filtroEstado === 'TODOS'} />
                <CardInfo title="Registrados" stats={stats.registrados} classN="border-blue-400" onclick={() => setFiltroEstado('REGISTRADO')} select={filtroEstado === 'REGISTRADO'} />
                <CardInfo title="En Revisión" stats={stats.enRevision} classN="border-purple-400" onclick={() => setFiltroEstado('EN_REVISION')} select={filtroEstado === 'EN_REVISION'} />
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

                <div className="bg-white text-gray-600 rounded-lg shadow-md overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Trabajo
                                    </th>
                                    <th className="px-2 sm:px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase w-24">
                                        Promedio
                                    </th>
                                    <th className="hidden sm:table-cell px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase w-32">
                                        Plagio · IA
                                    </th>
                                    <th className="hidden md:table-cell px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase w-36">
                                        Estado
                                    </th>
                                    <th className="px-2 sm:px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase w-20 xl:w-64">
                                        Acciones
                                    </th>
                                    <th className="w-10" aria-label="Detalle"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {trabajosFiltrados.map((trabajo) => (
                                    <RowWorkAssessed
                                        key={trabajo.id}
                                        trabajo={{ ...trabajo, presencial: presencialPorTrabajo[trabajo.id] ?? trabajo.presencial }}
                                        onAceptar={() => handleAceptar(trabajo.id)}
                                        onRechazar={() => handleRechazar(trabajo.id)}
                                        onPresencialChange={handlePresencialChange}
                                        onReenviar={() => handleReenviar(trabajo)}
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