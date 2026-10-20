'use client'
import React, { useState, useEffect } from 'react';
import { FileText } from 'lucide-react';
import { useSession } from 'next-auth/react';
import Alert from '@/components/ui/utils/alert';
import Loading from '@/components/ui/utils/loading';
import LoadingError from '@/components/ui/utils/loadingError';
import RowWorkAssessed from '@/components/ui/commite/rowWorkAssessed';
import CardInfo from '@/components/ui/cards/cardInfo';

export default function TrabajosCalificados() {
    const { data: session } = useSession();

    const [loading, setLoading] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [errorLoading, setErrorLoading] = useState(false);
    const [trabajos, setTrabajos] = useState([]);
    const [anio, setAnio] = useState(null);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [filtroEstado, setFiltroEstado] = useState('TODOS');

    useEffect(() => {
        fetchTrabajosCalificados();
    }, []);

    const fetchTrabajosCalificados = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/works/assessed`);

            if (response.ok) {
                const data = await response.json();
                setTrabajos(data.trabajos);
                setAnio(data.anio);
            } else {
                const errorData = await response.json();
                setErrorLoading(true);
            }
        } catch (err) {
            console.error('Error al cargar trabajos calificados:', err);
        } finally {
            setLoading(false);
        }
    };

    const handlePresencialChange = (trabajoId, presencial) => {
        setTrabajos(prevTrabajos =>
            prevTrabajos.map(trabajo =>
                trabajo.id === trabajoId
                    ? { ...trabajo, presencial }
                    : trabajo
            )
        );
    };

    const handleAceptar = async (trabajo) => {
        // Validación 1: Debe existir nivel de plagio e IA
        if (trabajo.nvl_ia === null || trabajo.nvl_plagio === null) {
            setError('El trabajo debe tener niveles de IA y plagio registrados antes de ser aceptado');
            setTimeout(() => setError(''), 3000);
            return;
        }

        // Validación 2: Debe tener asignaciones
        if (!trabajo.calificaciones || trabajo.calificaciones.length === 0) {
            setError('El trabajo debe tener al menos una asignación de revisor antes de ser aceptado');
            setTimeout(() => setError(''), 3000);
            return;
        }

        // Validación 3: Todas las asignaciones deben estar calificadas
        const asignacionesSinCalificar = trabajo.calificaciones.filter(
            cal => cal.calificacion === null
        );

        if (asignacionesSinCalificar.length > 0) {
            setError(`Todas las asignaciones deben estar calificadas. Faltan ${asignacionesSinCalificar.length} de ${trabajo.totalAsignaciones} evaluaciones`);
            setTimeout(() => setError(''), 3000);
            return;
        }

        setIsLoading(true);
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/works/accept`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    trabajoId: trabajo.id,
                    presencial: trabajo.presencial
                })
            });

            if (response.ok) {
                const data = await response.json();
                setSuccess(`Trabajo aceptado exitosamente. Se ha enviado el dictamen al autor.`);
                setTimeout(() => setSuccess(''), 3000);

                await fetchTrabajosCalificados();
            } else {
                const errorData = await response.json();
                setError(errorData.error || 'Error al aceptar el trabajo');
                setTimeout(() => setError(''), 3000);
            }
        } catch (err) {
            console.error('Error al aceptar trabajo:', err);
            setError('Error al procesar la solicitud');
            setTimeout(() => setError(''), 3000);
        } finally {
            setIsLoading(false);
        }
    };

    const handleRechazar = async (trabajo) => {
        if (trabajo.nvl_ia === null || trabajo.nvl_plagio === null) {
            setError('El trabajo debe tener niveles de IA y plagio registrados antes de ser rechazado');
            setTimeout(() => setError(''), 3000);
            return;
        }

        const tieneAsignaciones = trabajo.calificaciones && trabajo.calificaciones.length > 0;

        if (tieneAsignaciones) {
            const asignacionesSinCalificar = trabajo.calificaciones.filter(
                cal => cal.calificacion === null
            );

            if (asignacionesSinCalificar.length > 0) {
                setError(`Todas las asignaciones deben estar calificadas antes de rechazar. Faltan ${asignacionesSinCalificar.length} de ${trabajo.totalAsignaciones} evaluaciones`);
                setTimeout(() => setError(''), 3000);
                return;
            }
        }

        setIsLoading(true);
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/works/reject`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    trabajoId: trabajo.id
                })
            });

            if (response.ok) {
                const data = await response.json();
                setSuccess(`Trabajo rechazado. Se ha enviado el dictamen al autor.`);
                setTimeout(() => setSuccess(''), 3000);

                await fetchTrabajosCalificados();
            } else {
                const errorData = await response.json();
                setError(errorData.error || 'Error al rechazar el trabajo');
                setTimeout(() => setError(''), 3000);
            }
        } catch (err) {
            console.error('Error al rechazar trabajo:', err);
            setError('Error al procesar la solicitud');
            setTimeout(() => setError(''), 3000);
        } finally {
            setIsLoading(false);
        }
    };

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

    if (loading) {
        return <Loading />;
    }

    if (errorLoading) {
        return <LoadingError error="Error al cargar los trabajos calificados." />;
    }

    return (
        <div>
            {isLoading && <Loading />}

            <Alert
                type={error ? 'error' : 'success'}
                message={error || success}
                isVisible={error || success}
            />

            <div className="mb-4 sm:mb-6">
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-1 sm:mb-2">
                    Trabajos Calificados - {anio}
                </h2>
            </div>

            {/* Estadísticas */}
            <div className="flex flex-wrap flex-row  gap-4 mb-6">

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
                                        trabajo={trabajo}
                                        onAceptar={() => handleAceptar(trabajo)}
                                        onRechazar={() => handleRechazar(trabajo)}
                                        onPresencialChange={handlePresencialChange}
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