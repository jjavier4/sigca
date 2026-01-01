'use client'
import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, FileText } from 'lucide-react';
import { useSession } from 'next-auth/react';
import Alert from '@/components/ui/utils/alert';
import Loading from '@/components/ui/utils/loading';
import LoadingError from '@/components/ui/utils/loadingError';

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

    const handleAceptar = (trabajoId) => {
        console.log('Aceptar trabajo:', trabajoId);
        // TODO: Implementar lógica de aceptación
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
                                        Estado
                                    </th>
                                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                                        Acciones
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {trabajos.map((trabajo) => (
                                    <tr key={trabajo.id} className="hover:bg-gray-50 transition-colors">

                                        <td className="px-6 py-4">
                                            <div className="text-sm font-semibold text-gray-800">
                                                {trabajo.titulo}
                                            </div>
                                            <div className="text-xs text-gray-500 mt-1">
                                                {trabajo.convocatoria}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${trabajo.tipo === 'DIFUSION'
                                                ? 'bg-blue-100 text-blue-800'
                                                : 'bg-yellow-100 text-yellow-800'
                                                }`}>
                                                {trabajo.tipo}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">

                                            <div className="flex flex-col  gap-2 justify-center">

                                                {
                                                    trabajo.calificaciones.length === 0 ? (
                                                        <div className="text-gray-400 text-sm">Sin asignaciones</div>
                                                    ) :
                                                        (
                                                            trabajo.calificaciones.map((cal, index) => (
                                                                <div className="flex gap-2 items-center justify-between">
                                                                    <div
                                                                        key={index}
                                                                        className={`px-3 py-1 rounded-lg text-sm font-semibold  ${cal.calificacion !== null
                                                                            ? 'bg-green-100 text-green-800'
                                                                            : 'bg-gray-100 text-gray-500'
                                                                            }`}
                                                                    >
                                                                        {cal.calificacion !== null
                                                                            ? `${cal.calificacion.toFixed(1)}%`
                                                                            : 'Sin calificar'
                                                                        }
                                                                    </div>
                                                                    <div
                                                                        key={index + 10}
                                                                        className={`px-1 py-1 text-xs border border-gray-300 rounded ${cal.comentario !== null
                                                                            ? 'bg-blue-100 text-blue-800'
                                                                            : 'bg-gray-100 text-gray-500'
                                                                            }`}
                                                                    >
                                                                        {cal.comentario !== null
                                                                            ? `${cal.comentario}`
                                                                            : 'Sin comentario'
                                                                        }
                                                                    </div>
                                                                </div>
                                                            ))
                                                        )
                                                }
                                            </div>
                                            <div className="text-xs text-center text-gray-500 mt-2">
                                                {trabajo.asignacionesCalificadas} de {trabajo.totalAsignaciones} evaluadas
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            {trabajo.promedioCalificacion !== null ? (
                                                <div className="text-lg font-bold text-black">
                                                    {trabajo.promedioCalificacion}%
                                                </div>
                                            ) : (
                                                <span className="text-gray-400 text-sm">-</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${trabajo.estado === 'ACEPTADO'
                                                ? 'bg-green-100 text-green-800'
                                                : trabajo.estado === 'RECHAZADO'
                                                    ? 'bg-red-100 text-red-800'
                                                    : 'bg-yellow-100 text-yellow-800'
                                                }`}>
                                                {trabajo.estado.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-2 items-center">
                                                <button
                                                    onClick={() => handleAceptar(trabajo.id)}
                                                    disabled={trabajo.estado !== 'EN_REVISION'}
                                                    className=" bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white font-semibold px-4 py-2 rounded-lg  inline-flex items-center gap-2 text-sm"
                                                >
                                                    <CheckCircle size={14} />
                                                    ACEPTAR
                                                </button>
                                                <button
                                                    onClick={() => handleRechazar(trabajo.id)}
                                                    disabled={trabajo.estado !== 'EN_REVISION'}
                                                    className="bg-red-600 hover:bg-red-700 disabled:bg-red-300 text-white font-semibold px-4 py-2 rounded-lg  inline-flex items-center gap-2 text-sm"
                                                >
                                                    <XCircle size={14} />
                                                    RECHAZAR
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}