'use client'
import React, { useState } from 'react'
import { CheckCircle, XCircle, ChevronDown, Send } from 'lucide-react';
import { superaUmbral } from '@/utils/evaluacion';

const clasesEstado = (estado) =>
    estado === 'ACEPTADO'
        ? 'bg-green-100 text-green-800'
        : estado === 'RECHAZADO'
            ? 'bg-red-100 text-red-800'
            : estado === 'REGISTRADO'
                ? 'bg-blue-100 text-blue-800'
                : 'bg-yellow-100 text-yellow-800';

const clasesTipo = (tipo) =>
    tipo === 'DIFUSION'
        ? 'bg-orange-100 text-orange-800'
        : 'bg-purple-100 text-purple-800';

const formatoPorcentaje = (valor) => (valor !== null ? `${valor}%` : '?');

export default function RowWorkAssessed({ trabajo, onAceptar, onRechazar, onPresencialChange, onReenviar }) {
    const [expandido, setExpandido] = useState(false);

    const deshabilitarAceptar = () => {
        /*
        sea diferente de EN_REVISION o
        no existe nvl_plagio o no existe nvl_ia o
        nvl_plagio > 30% o nvl_ia > 30% o
        no exista el promedio de calificaciones
        */
        if (trabajo.estado !== 'EN_REVISION' ||
            trabajo.nvl_plagio === null || trabajo.nvl_ia === null ||
            superaUmbral(trabajo.nvl_plagio) || superaUmbral(trabajo.nvl_ia) ||
            trabajo.promedioCalificacion === null) {
            return true;
        }
        return false;
    }
    const deshabilitarRechazar = () => {
        /*
        primero verificar que
        sea diferente de EN_REVISION o
        nvl_plagio sea diferente de null o nvl_ia sea diferente de null o
        */
        if (trabajo.estado !== 'EN_REVISION' ||
            trabajo.nvl_plagio === null || trabajo.nvl_ia === null
        ) {
            return true;
        } else {
            if (superaUmbral(trabajo.nvl_plagio) || superaUmbral(trabajo.nvl_ia)) {
                return false;
            } else {
                if (trabajo.promedioCalificacion === null) {
                    return true;
                } else {
                    return false;
                }
            }
        }
    }

    // Variables auxiliares (solo presentación)
    const aceptarDeshabilitado = deshabilitarAceptar();
    const rechazarDeshabilitado = deshabilitarRechazar();
    const enRevision = trabajo.estado === 'EN_REVISION';
    const tieneAsignaciones = trabajo.calificaciones.length > 0;
    const plagioAlto = superaUmbral(trabajo.nvl_plagio);
    const iaAlto = superaUmbral(trabajo.nvl_ia);
    const detalleId = `detalle-trabajo-${trabajo.id}`;

    const toggle = () => setExpandido((prev) => !prev);

    const BadgeEstado = ({ className = '' }) => (
        <span className={`inline-flex px-2.5 py-0.5 text-xs font-semibold rounded-full whitespace-nowrap ${clasesEstado(trabajo.estado)} ${className}`}>
            {trabajo.estado.replace('_', ' ')}
        </span>
    );

    return (
        <>
            {/* Fila principal: solo lo necesario para decidir */}
            <tr
                onClick={toggle}
                className={`cursor-pointer transition-colors ${expandido ? 'bg-gray-200' : 'hover:bg-gray-50'}`}
            >
                {/* Trabajo + tipo + (estado en móvil) */}
                <td className="px-3 sm:px-6 py-3 align-middle">
                    <div className="space-y-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                            <h3 className="font-bold text-gray-800 text-md break-words">
                                {trabajo.titulo || 'Sin título'}
                            </h3>
                            <span className={`inline-flex px-2 py-0.5 text-xs font-semibold rounded-full ${clasesTipo(trabajo.tipo)}`}>
                                {trabajo.tipo}
                            </span>
                        </div>
                        <p className="text-md text-gray-500 break-words">
                            {trabajo.convocatoria} · {trabajo.id}
                        </p>
                        {/* En pantallas chicas, estado y plagio/IA bajo el título */}
                        <div className="flex flex-wrap items-center gap-2 md:hidden">
                            <BadgeEstado />
                            <span className="text-xs font-semibold sm:hidden">
                                <span className={plagioAlto ? 'text-red-600' : ''}>P {formatoPorcentaje(trabajo.nvl_plagio)}</span>
                                {' · '}
                                <span className={iaAlto ? 'text-red-600' : ''}>IA {formatoPorcentaje(trabajo.nvl_ia)}</span>
                            </span>
                        </div>
                    </div>
                </td>

                {/* Promedio + avance de evaluaciones */}
                <td className="px-2 sm:px-4 py-3 text-center align-middle">
                    {trabajo.promedioCalificacion !== null ? (
                        <div className="text-lg font-bold text-black">
                            {trabajo.promedioCalificacion}%
                        </div>
                    ) : (
                        <span className="text-gray-400 font-semibold text-sm">?</span>
                    )}
                    <div className="text-xs text-gray-500 whitespace-nowrap">
                        {tieneAsignaciones
                            ? `${trabajo.asignacionesCalificadas}/${trabajo.totalAsignaciones}`
                            : 'Sin asignar'}
                    </div>
                </td>

                {/* Plagio / IA */}
                <td className="hidden sm:table-cell px-4 py-3 text-center align-middle">
                    <span className="text-xs font-semibold whitespace-nowrap">
                        <span className={plagioAlto ? 'text-red-600' : ''}>{formatoPorcentaje(trabajo.nvl_plagio)}</span>
                        <span className="text-gray-400"> - </span>
                        <span className={iaAlto ? 'text-red-600' : ''}>{formatoPorcentaje(trabajo.nvl_ia)}</span>
                    </span>
                </td>

                {/* Estado */}
                <td className="hidden md:table-cell px-4 py-3 text-center align-middle">
                    <BadgeEstado />
                    {trabajo.presencial && (
                        <div className="text-xs text-gray-500 mt-1">Presencial</div>
                    )}
                </td>

                {/* Acciones */}
                <td className="px-2 sm:px-4 py-3 align-middle" onClick={(e) => e.stopPropagation()}>
                    {enRevision ? (
                        <div className="flex flex-col xl:flex-row gap-1.5 items-center justify-center">
                            <button
                                onClick={() => onAceptar(trabajo.id)}
                                disabled={aceptarDeshabilitado}
                                title="Aceptar"
                                aria-label="Aceptar trabajo"
                                className="bg-green-600 hover:bg-green-700 disabled:bg-green-300 disabled:cursor-not-allowed text-white font-semibold p-2 xl:px-3 xl:py-1.5 rounded-lg inline-flex items-center gap-1.5 text-xs"
                            >
                                <CheckCircle size={16} />
                                <span className="hidden xl:inline">ACEPTAR</span>
                            </button>
                            <button
                                onClick={() => onRechazar(trabajo.id)}
                                disabled={rechazarDeshabilitado}
                                title="Rechazar"
                                aria-label="Rechazar trabajo"
                                className="bg-red-600 hover:bg-red-700 disabled:bg-red-300 disabled:cursor-not-allowed text-white font-semibold p-2 xl:px-3 xl:py-1.5 rounded-lg inline-flex items-center gap-1.5 text-xs"
                            >
                                <XCircle size={16} />
                                <span className="hidden xl:inline">RECHAZAR</span>
                            </button>
                        </div>
                    ) : trabajo.estado === 'ACEPTADO' || trabajo.estado === 'RECHAZADO' ? (
                        <div className="flex justify-center">
                            <button
                                onClick={() => onReenviar(trabajo.id)}
                                title="Reenviar dictamen"
                                aria-label="Reenviar dictamen"
                                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold p-2 xl:px-3 xl:py-1.5 rounded-lg inline-flex items-center gap-1.5 text-xs"
                            >
                                <Send size={16} />
                                <span className="hidden xl:inline">REENVIAR DICTAMEN</span>
                            </button>
                        </div>
                    ) : (
                        <div className="text-center text-gray-400 text-sm">—</div>
                    )}
                </td>

                {/* Expandir */}
                <td className="pr-3 sm:pr-4 py-3 align-middle text-right">
                    <button
                        onClick={(e) => { e.stopPropagation(); toggle(); }}
                        aria-expanded={expandido}
                        aria-controls={detalleId}
                        aria-label={expandido ? 'Ocultar detalle' : 'Ver detalle'}
                        className="p-1 rounded text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                    >
                        <ChevronDown
                            size={18}
                            className={`transition-transform ${expandido ? 'rotate-180' : ''}`}
                        />
                    </button>
                </td>
            </tr>

            {/* Panel de detalle */}
            {expandido && (
                <tr className="bg-gray-200 transition-colors">
                    <td colSpan={6} className="px-3 sm:px-6 pb-4 pt-1">
                        <div  className="grid gap-4 md:grid-cols-3">

                            {/* Revisores */}
                            <div className="md:col-span-2">
                                <p className="text-md font-medium text-gray-500 mb-2">
                                    Calificaciones y comentarios por revisor
                                </p>
                                {!tieneAsignaciones ? (
                                    <div className="text-gray-400 text-sm">Sin asignaciones</div>
                                ) : (
                                    <div className="space-y-2">
                                        {trabajo.calificaciones.map((cal, index) => (
                                            <div
                                                key={index}
                                                className="bg-white border border-gray-200 rounded-lg p-2.5 flex flex-col sm:flex-row sm:items-start gap-2"
                                            >
                                                <div className="flex items-center gap-2 shrink-0">
                                                    <span className="text-sm text-gray-500 w-16">Revisor {index + 1}</span>
                                                    <span
                                                        className={`px-3 py-1 rounded-lg text-sm font-semibold whitespace-nowrap ${cal.calificacion !== null
                                                            ? 'bg-green-100 text-green-800'
                                                            : 'bg-gray-100 text-gray-500'
                                                            }`}
                                                    >
                                                        {cal.calificacion !== null
                                                            ? `${cal.calificacion.toFixed(1)}%`
                                                            : 'Sin calificar'}
                                                    </span>
                                                </div>
                                                <p
                                                    className={`flex-1 px-2 py-1 text-sm border border-gray-300 rounded break-words ${cal.comentario !== null
                                                        ? 'bg-blue-100 text-blue-800'
                                                        : 'bg-gray-100 text-gray-500'
                                                        }`}
                                                >
                                                    {cal.comentario !== null ? cal.comentario : 'Sin comentario'}
                                                </p>
                                            </div>
                                        ))}
                                        <div className="text-xs text-gray-500">
                                            {trabajo.asignacionesCalificadas} de {trabajo.totalAsignaciones} evaluadas
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Detalles */}
                            <div className="flex items-center justify-center gap-2">
                                
                                    <input
                                        type="checkbox"
                                        checked={trabajo.presencial}
                                        onChange={(e) => onPresencialChange(trabajo.id, e.target.checked)}
                                        disabled={aceptarDeshabilitado}
                                        className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                                    />
                                    Presencial
                            </div>
                        </div>
                    </td>
                </tr>
            )}
        </>
    )
}