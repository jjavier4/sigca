'use client'
import React, { useState, useEffect } from 'react';
import { FileText } from 'lucide-react';
import { useSession } from 'next-auth/react';
import Alert from '@/components/ui/utils/alert';
import Loading from '@/components/ui/utils/loading';
import LoadingError from '@/components/ui/utils/loadingError';
import RowWorkAssessed from '@/components/ui/commite/rowWorkAssessed';

export default function TrabajosCalificados() {
    const { data: session } = useSession();

    const [loading, setLoading] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [errorLoading, setErrorLoading] = useState(false);
    const [trabajos, setTrabajos] = useState([]);
    const [anio, setAnio] = useState(null);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        fetchTrabajosCalificados();
    }, []);

    const fetchTrabajosCalificados = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/works/assessed');

            if (response.ok) {
                const data = await response.json();
                setTrabajos(data.trabajos);
                setAnio(data.anio);
            } else {
                const errorData = await response.json();
                setError(errorData.error || 'Error al cargar trabajos');
                setTimeout(() => setError(''), 3000);
            }
        } catch (err) {
            console.error('Error al cargar trabajos calificados:', err);
            setErrorLoading(true);
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
        const response = await fetch('/api/works/accept', {
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
        const response = await fetch('/api/works/reject', {
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

            <div className="mb-6">
                <h2 className="text-3xl font-bold text-gray-800 mb-2">
                    Trabajos Calificados - {anio}
                </h2>
                <p className="text-gray-600">
                    Total de trabajos: {trabajos.length}
                </p>
            </div>

            {trabajos.length === 0 ? (
                <div className="bg-white text-gray-600 rounded-lg shadow-md p-12 text-center">
                    <FileText className="mx-auto mb-4 h-16 w-16 text-gray-400" />
                    <p className="text-gray-500 text-lg">
                        No hay trabajos registrados para el año {anio}
                    </p>
                </div>
            ) : (
                <div className="bg-white text-gray-600 rounded-lg shadow-md overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Título y Convocatoria
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Tipo
                                    </th>
                                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                                        Calificaciones y Comentarios por Revisor
                                    </th>
                                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                                        Promedio
                                    </th>
                                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                                        Nivel de plagio e IA
                                    </th>
                                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                                        Presencial
                                    </th>
                                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                                        Estado
                                    </th>
                                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                                        Acciones
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {trabajos.map((trabajo) => (
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