import React from 'react'
import { CheckCircle, XCircle } from 'lucide-react';
export default function RowWorkAssessed({ trabajo, onAceptar, onRechazar }) {
    return (
        <>
            {
                <tr className="hover:bg-gray-50 transition-colors">

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
                                onClick={() => onAceptar(trabajo.id)}
                                disabled={trabajo.estado !== 'EN_REVISION'}
                                className=" bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white font-semibold px-4 py-2 rounded-lg  inline-flex items-center gap-2 text-sm"
                            >
                                <CheckCircle size={14} />
                                ACEPTAR
                            </button>
                            <button
                                onClick={() => onRechazar(trabajo.id)}
                                disabled={trabajo.estado !== 'EN_REVISION'}
                                className="bg-red-600 hover:bg-red-700 disabled:bg-red-300 text-white font-semibold px-4 py-2 rounded-lg  inline-flex items-center gap-2 text-sm"
                            >
                                <XCircle size={14} />
                                RECHAZAR
                            </button>
                        </div>
                    </td>
                </tr>


            }
        </>
    )
}
