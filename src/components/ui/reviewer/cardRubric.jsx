"use client"
import React, { useState, useEffect } from 'react'
import { ArrowLeft, Send, AlertCircle } from 'lucide-react';
import Loading from '../utils/loading';
import LoadingError from '@/components/ui/utils/loadingError';

export default function CardRubric({ asignacion, onSubmit, isLoading, onCancel }) {
    // Nueva estructura de opciones con ponderación 10, 8, 6, 0
    const OPCIONES_RUBRICA = [
        { valor: 10, etiqueta: '10 puntos', indice: 0 },
        { valor: 8, etiqueta: '8 puntos', indice: 1 },
        { valor: 6, etiqueta: '6 puntos', indice: 2 },
        { valor: 0, etiqueta: '0 puntos', indice: 3 }
    ];

    const [criteriosEvaluacion, setCriteriosEvaluacion] = useState([]);
    const [loadingCriterios, setLoadingCriterios] = useState(true);
    const [errorLoadingCriterios, setErrorLoadingCriterios] = useState('');
    const [evaluaciones, setEvaluaciones] = useState({});
    const [comentarios, setComentarios] = useState('');
    const [error, setError] = useState('');

    // Cargar criterios según el tipo de trabajo (DIFUSION o DIVULGACION)
    useEffect(() => {
        if (asignacion?.trabajo?.tipo) {
            fetchCriteriosPorGrupo();
        }
    }, []);

    const fetchCriteriosPorGrupo = async () => {
        try {
            setLoadingCriterios(true);
            const response = await fetch(`/api/rubric/findbygroup?tipo=${asignacion?.trabajo?.tipo}`);
            
            if (response.ok) {
                const result = await response.json();
                
                if (result.criterios.length === 0) {
                    setErrorLoadingCriterios(`No hay criterios de evaluación configurados para ${asignacion?.trabajo?.tipo}. Por favor contacta al administrador.`);
                } else {
                    setCriteriosEvaluacion(result.criterios);
                    // Inicializar evaluaciones vacías
                    const initialEvaluaciones = {};
                    result.criterios.forEach(criterio => {
                        initialEvaluaciones[criterio.id] = null;
                    });
                    setEvaluaciones(initialEvaluaciones);
                }
            } else {
                const errorData = await response.json();
                setErrorLoadingCriterios(errorData.error || 'Error al cargar los criterios de evaluación');
            }
        } catch (error) {
            console.error('Error al cargar criterios:', error);
            setErrorLoadingCriterios('Error de conexión al cargar criterios');
        } finally {
            setLoadingCriterios(false);
        }
    };

    const handleEvaluacionChange = (criterioId, valor) => {
        setEvaluaciones(prev => ({
            ...prev,
            [criterioId]: valor
        }));
        setError('');
    };

    // Calcular puntaje total con nueva ponderación (10, 8, 6, 0)
    const calcularPuntajeTotal = () => {
        const valores = Object.values(evaluaciones).filter(v => v !== null);
        if (valores.length === 0) return 0;
        
        const suma = valores.reduce((acc, val) => acc + val, 0);
        const maximo = criteriosEvaluacion.length * 10; // Máximo ahora es 10 por criterio
        
        return (suma / maximo) * 100;
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

        const puntajeTotal = calcularPuntajeTotal();

        // Solo enviar datos de evaluación, sin estados
        onSubmit({
            id: asignacion.id,
            comentarios: comentarios.trim(),
            calificacion: parseFloat(puntajeTotal.toFixed(2))
        });
    };

    // Mostrar loading mientras se cargan los criterios
    if (loadingCriterios) {
        return <Loading />;
    }

    // Mostrar error si no hay criterios
    if (errorLoadingCriterios) {
        return <LoadingError error={errorLoadingCriterios} />;
    }

    const puntajeTotal = calcularPuntajeTotal();
    const criteriosEvaluados = Object.values(evaluaciones).filter(v => v !== null).length;
    const totalCriterios = criteriosEvaluacion.length;

    return (
        <div className="h-full flex flex-col bg-white">
            {/* Header */}
            <div className="bg-gradient-to-r rounded-t-lg bg-green-700 p-4">
                <div className="flex items-center justify-between mb-2">
                    <h2 className="text-xl font-bold text-white">
                        Rúbrica de Evaluación - {asignacion?.trabajo?.tipo}
                    </h2>
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

                {/* Resumen de Evaluación - SIN estados de decisión */}
                <div className="mb-6 bg-gradient-to-r from-blue-50 to-blue-50 border-2 border-blue-200 rounded-lg p-5">
                    <h3 className="text-lg font-bold text-blue-900 mb-3">Resumen de Evaluación</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm text-gray-600 mb-1">Puntaje Total</p>
                            <p className="text-3xl font-bold text-blue-700">{puntajeTotal.toFixed(1)}%</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600 mb-1">Calificación Numérica</p>
                            <p className="text-3xl font-bold text-blue-700">
                                {(puntajeTotal / 10).toFixed(1)}
                            </p>
                        </div>
                    </div>
                    <div className="mt-3 text-xs text-gray-600">
                        <p>Tipo de trabajo: {asignacion?.trabajo?.tipo}</p>
                    </div>
                </div>
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