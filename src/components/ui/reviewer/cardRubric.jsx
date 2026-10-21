"use client"
import React, { useState } from 'react'
import { ArrowLeft, Send, AlertCircle } from 'lucide-react';
import LoadingError from '@/components/ui/utils/loadingError';
import { calcularPorcentaje } from '@/lib/rubrica';

export default function CardRubric({ asignacion, criterios, onSubmit, isLoading, onCancel }) {
    // Nueva estructura de opciones con ponderación 10, 8, 6, 0
    const OPCIONES_RUBRICA = [
        { valor: 10, etiqueta: '10 puntos', indice: 0 },
        { valor: 8, etiqueta: '8 puntos', indice: 1 },
        { valor: 6, etiqueta: '6 puntos', indice: 2 },
        { valor: 0, etiqueta: '0 puntos', indice: 3 }
    ];

    const criteriosEvaluacion = criterios;
    const [evaluaciones, setEvaluaciones] = useState(() =>
        Object.fromEntries(criterios.map(criterio => [criterio.id, null]))
    );
    const [comentarios, setComentarios] = useState('');
    const [error, setError] = useState('');

    const handleEvaluacionChange = (criterioId, valor) => {
        setEvaluaciones(prev => ({
            ...prev,
            [criterioId]: valor
        }));
        setError('');
    };

    const calcularPuntajeTotal = () => {
        const valores = Object.values(evaluaciones).filter(v => v !== null);
        return calcularPorcentaje(criteriosEvaluacion.length, valores);
    };

    const handleSubmit = () => {
        // Validar que todos los criterios estén evaluados
        const criteriosVacios = criteriosEvaluacion.filter(
            criterio => evaluaciones[criterio.id] === null
        );

        if (criteriosVacios.length > 0) {
            setError('Debes evaluar todos los criterios antes de enviar');
            return;
        }

        if (!comentarios.trim()) {
            setError('Debes agregar comentarios sobre la evaluación');
            return;
        }

        onSubmit({
            id: asignacion.id,
            comentarios: comentarios.trim(),
            respuestas: evaluaciones
        });
    };

    if (criteriosEvaluacion.length === 0) {
        return <LoadingError error={`No hay criterios de evaluación configurados para ${asignacion?.trabajo?.tipo}. Por favor contacta al administrador.`} />;
    }

    const puntajeTotal = calcularPuntajeTotal();
    const criteriosEvaluados = Object.values(evaluaciones).filter(v => v !== null).length;
    const totalCriterios = criteriosEvaluacion.length;

    return (
        <div className="h-full flex flex-col bg-white">
            {/* Header */}
            <header className="rounded-t-lg flex flex-row flex-wrap bg-green-700 p-4">
                <div className="flex flex-col mb-2 w-1/3">
                    <h2 className="text-lg sm:text-xl font-bold text-white break-all">
                        Rúbrica de Evaluaciónes - {asignacion?.trabajo?.tipo}
                    </h2>
                    <p className="text-green-100 text-md md:text-lg break-words">{"Convocatoria asociada: " + asignacion.trabajo.convocatoria.titulo}</p>

                </div>
                <div className="flex flex-col w-3/6   rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-semibold text-white">
                            Progreso: {criteriosEvaluados} de {totalCriterios} criterios evaluados
                        </span>
                        <span className="text-lg font-bold text-white">
                            {puntajeTotal.toFixed(1)}%
                        </span>
                    </div>
                    <div className="w-full bg-white rounded-full h-2">
                        <div
                            className="bg-green-400 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${(criteriosEvaluados / totalCriterios) * 100}%` }}
                        />
                    </div>
                </div>
                <button
                    onClick={onCancel}
                    className="text-white cursor-pointer hover:text-green-200 rounded-lg px-3 py-1 transition-colors flex justify-end items-center w-1/6"
                >
                    <ArrowLeft size={18} className="mr-1" />
                    Volver
                </button>
            </header>

            {/* Contenido con scroll */}
            <div className="flex-1 overflow-y-auto p-6">

                {/* Error */}
                {error && (
                    <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3 flex items-center">
                        <AlertCircle className="text-red-600 mr-2" size={20} />
                        <p className="text-red-800 text-sm">{error}</p>
                    </div>
                )}

                {/* Tabla de Rúbrica con descripciones dinámicas */}
                <div className="mb-6 border border-gray-300 rounded-lg overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-gray-100">
                                    <th className="px-4 py-3 text-left text-sm font-bold text-gray-700 border-b border-r">
                                        Criterio
                                    </th>
                                    {OPCIONES_RUBRICA.map(opcion => (
                                        <th key={opcion.valor} className="px-3 py-3 text-center text-sm font-bold text-gray-700 border-b border-r last:border-r-0">
                                            <div>{opcion.etiqueta}</div>
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {criteriosEvaluacion.map((criterio, index) => (
                                    <tr key={criterio.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                        <td className="px-4 py-4 border-b border-r">
                                            <div className="font-semibold text-sm text-gray-800 mb-1">
                                                {criterio.nombre}
                                            </div>
                                            <div className="text-xs text-gray-600">
                                                {criterio.descripcion}
                                            </div>
                                        </td>
                                        {OPCIONES_RUBRICA.map(opcion => (
                                            <td key={opcion.valor} className="px-3 py-4 border-b border-r last:border-r-0">
                                                <div className="flex flex-col items-center">
                                                    <input
                                                        type="radio"
                                                        name={`criterio-${criterio.id}`}
                                                        value={opcion.valor}
                                                        checked={evaluaciones[criterio.id] === opcion.valor}
                                                        onChange={() => handleEvaluacionChange(criterio.id, opcion.valor)}
                                                        className="w-5 h-5 cursor-pointer mb-2"
                                                        disabled={isLoading}
                                                    />
                                                    {criterio.descripcion_puntaje && criterio.descripcion_puntaje[opcion.indice] && (
                                                        <div className="text-xs text-gray-600 text-center px-2">
                                                            {criterio.descripcion_puntaje[opcion.indice]}
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Apartado de Comentarios */}
                <div className="mb-6">
                    <label className="block text-sm font-bold text-black mb-2">
                        Comentarios y Retroalimentación *
                    </label>
                    <textarea
                        value={comentarios}
                        onChange={(e) => setComentarios(e.target.value)}
                        placeholder="Escribe tus observaciones, sugerencias y comentarios detallados sobre el trabajo evaluado..."
                        className="w-full px-4 py-3 border text-gray-500 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all min-h-[150px] resize-none"
                        disabled={isLoading}
                    />
                    <p className="text-xs text-black mt-2">
                        Proporciona retroalimentación constructiva que ayude al autor a mejorar su trabajo
                    </p>
                </div>
            </div>

            {/* Footer con botones */}
            <div className="border-t border-gray-200 p-4 bg-gray-50">
                <div className="flex gap-3">
                    <button
                        onClick={onCancel}
                        disabled={isLoading}
                        className="flex-1 bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 text-gray-800 font-semibold py-3 rounded-lg transition-colors cursor-pointer"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={isLoading || criteriosEvaluados < totalCriterios}
                        className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-green-400 disabled:cursor-not-allowed cursor-pointer text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center"
                    >
                        {isLoading ? (
                            'Enviando...'
                        ) : (
                            <>
                                <Send className="mr-2" size={18} />
                                Enviar Calificación
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}