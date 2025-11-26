"use client"
import React, { useState, useEffect } from 'react'
import { ArrowLeft, Send, AlertCircle } from 'lucide-react';
export default function CardRubric({ asignacion, onSubmit, isLoading, onCancel }) {
    // Criterios de evaluación predefinidos
    const CRITERIOS_EVALUACION = [
        {
            id: 'originalidad',
            nombre: 'Originalidad y aporte científico',
            descripcion: 'El trabajo presenta contribuciones novedosas y relevantes'
        },
        {
            id: 'metodologia',
            nombre: 'Metodología',
            descripcion: 'La metodología es clara, apropiada y bien fundamentada'
        },
        {
            id: 'claridad',
            nombre: 'Claridad y organización',
            descripcion: 'El documento está bien estructurado y es fácil de comprender'
        },
        {
            id: 'fundamentacion',
            nombre: 'Fundamentación teórica',
            descripcion: 'El marco teórico es sólido y las referencias son apropiadas'
        },
        {
            id: 'resultados',
            nombre: 'Resultados y análisis',
            descripcion: 'Los resultados son claros y el análisis es profundo'
        },
        {
            id: 'redaccion',
            nombre: 'Redacción y formato',
            descripcion: 'La redacción es académica y el formato cumple los requisitos'
        }
    ];

    const OPCIONES_RUBRICA = [
        { valor: 5, etiqueta: 'Siempre' },
        { valor: 4, etiqueta: 'Casi siempre' },
        { valor: 3, etiqueta: 'Regularmente' },
        { valor: 2, etiqueta: 'A veces' },
        { valor: 1, etiqueta: 'Nunca' }
    ];
    const [evaluaciones, setEvaluaciones] = useState({});
    const [comentarios, setComentarios] = useState('');
    const [error, setError] = useState('');

    // Inicializar evaluaciones vacías
    useEffect(() => {
        const initialEvaluaciones = {};
        CRITERIOS_EVALUACION.forEach(criterio => {
            initialEvaluaciones[criterio.id] = null;
        });
        setEvaluaciones(initialEvaluaciones);
    }, []);

    const handleEvaluacionChange = (criterioId, valor) => {
        setEvaluaciones(prev => ({
            ...prev,
            [criterioId]: valor
        }));
        setError('');
    };

    const calcularPuntajeTotal = () => {
        const valores = Object.values(evaluaciones).filter(v => v !== null);
        if (valores.length === 0) return 0;
        const suma = valores.reduce((acc, val) => acc + val, 0);
        const maximo = CRITERIOS_EVALUACION.length * 5;
        return (suma / maximo) * 100;
    };

    const handleSubmit = () => {
        // Validar que todos los criterios estén evaluados
        const criteriosVacios = CRITERIOS_EVALUACION.filter(
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

        const puntajeTotal = calcularPuntajeTotal();
        let estadoSugerido;

        if (puntajeTotal >= 80) {
            estadoSugerido = 'ACEPTADO';
        } else if (puntajeTotal >= 60) {
            estadoSugerido = 'CAMBIOS_SOLICITADOS';
        } else {
            estadoSugerido = 'RECHAZADO';
        }

        onSubmit({
            trabajoId: asignacion.trabajo.id,
            asignacionId: asignacion.id,
            evaluaciones,
            comentarios: comentarios.trim(),
            puntajeTotal: puntajeTotal.toFixed(2),
            nuevoEstado: estadoSugerido
        });
    };

    const puntajeTotal = calcularPuntajeTotal();
    const criteriosEvaluados = Object.values(evaluaciones).filter(v => v !== null).length;
    const totalCriterios = CRITERIOS_EVALUACION.length;

    return (
        <div className="h-full flex flex-col bg-white">
            {/* Header */}
            <div className="bg-gradient-to-r rounded-t-lg bg-green-700 p-4 ">
                <div className="flex items-center justify-between mb-2">
                    <h2 className="text-xl font-bold text-white">Rúbrica de Evaluación</h2>
                    <button
                        onClick={onCancel}
                        className="text-white hover:bg-green-950 hover:bg-opacity-20 rounded-lg px-3 py-1 transition-colors flex items-center"
                    >
                        <ArrowLeft size={18} className="mr-1" />
                        Volver
                    </button>
                </div>
                <p className="text-green-100 text-sm">{asignacion.trabajo.convocatoria.titulo}</p>
            </div>

            {/* Contenido con scroll */}
            <div className="flex-1 overflow-y-auto p-6">
                {/* Progreso */}
                <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-semibold text-blue-900">
                            Progreso: {criteriosEvaluados} de {totalCriterios} criterios evaluados
                        </span>
                        <span className="text-lg font-bold text-blue-700">
                            {puntajeTotal.toFixed(1)}%
                        </span>
                    </div>
                    <div className="w-full bg-blue-200 rounded-full h-2">
                        <div
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${(criteriosEvaluados / totalCriterios) * 100}%` }}
                        />
                    </div>
                </div>

                {/* Error */}
                {error && (
                    <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3 flex items-center">
                        <AlertCircle className="text-red-600 mr-2" size={20} />
                        <p className="text-red-800 text-sm">{error}</p>
                    </div>
                )}

                {/* Tabla de Rúbrica */}
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
                                            <div className="text-xs text-gray-500 font-normal">({opcion.valor} pts)</div>
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {CRITERIOS_EVALUACION.map((criterio, index) => (
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
                                            <td key={opcion.valor} className="px-3 py-4 text-center border-b border-r last:border-r-0">
                                                <input
                                                    type="radio"
                                                    name={`criterio-${criterio.id}`}
                                                    value={opcion.valor}
                                                    checked={evaluaciones[criterio.id] === opcion.valor}
                                                    onChange={() => handleEvaluacionChange(criterio.id, opcion.valor)}
                                                    className="w-5 h-5 cursor-pointer"
                                                    disabled={isLoading}
                                                />
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

                {/* Resumen de Puntaje 
                <div className="mb-6 bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-200 rounded-lg p-5">
                    <h3 className="text-lg font-bold text-purple-900 mb-3">Resumen de Evaluación</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm text-gray-600 mb-1">Puntaje Total</p>
                            <p className="text-3xl font-bold text-purple-700">{puntajeTotal.toFixed(1)}%</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600 mb-1">Decisión Sugerida</p>
                            <p className={`text-lg font-bold ${puntajeTotal >= 80 ? 'text-green-600' :
                                puntajeTotal >= 60 ? 'text-orange-600' :
                                    'text-red-600'
                                }`}>
                                {puntajeTotal >= 80 ? 'Aceptar' :
                                    puntajeTotal >= 60 ? 'Solicitar Cambios' :
                                        'Rechazar'}
                            </p>
                        </div>
                    </div>
                    <div className="mt-3 text-xs text-gray-600">
                        <p>• 80-100%: Aceptado</p>
                        <p>• 60-79%: Cambios solicitados</p>
                        <p>• 0-59%: Rechazado</p>
                    </div>
                </div>
                */}
            </div>

            {/* Footer con botones */}
            <div className="border-t border-gray-200 p-4 bg-gray-50">
                <div className="flex gap-3">
                    <button
                        onClick={onCancel}
                        disabled={isLoading}
                        className="flex-1 bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 text-gray-800 font-semibold py-3 rounded-lg transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={isLoading || criteriosEvaluados < totalCriterios}
                        className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center"
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
