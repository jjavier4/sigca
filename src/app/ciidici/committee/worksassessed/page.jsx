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

    const handleAceptar = (trabajoId) => {
        const trabajo = trabajos.find(t => t.id === trabajoId);
        console.log('Aceptar trabajo:', trabajoId);
        console.log('Presencial:', trabajo.presencial);
        // TODO: Implementar lógica de aceptación con el dato presencial
        setSuccess(`Trabajo ${trabajoId} marcado para aceptación`);
        setTimeout(() => setSuccess(''), 3000);
    };

    const handleRechazar = (trabajoId) => {
        console.log('Rechazar trabajo:', trabajoId);
        // TODO: Implementar lógica de rechazo
        setError(`Trabajo ${trabajoId} marcado para rechazo`);
        setTimeout(() => setError(''), 3000);
    };

    if (loading) {
        return <Loading />;
    }

    if (errorLoading) {
        return <LoadingError error="Error al cargar los trabajos calificados." />;
    }

    return (
        <div>
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
                                        onAceptar={() => handleAceptar(trabajo.id)}
                                        onRechazar={() => handleRechazar(trabajo.id)}
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