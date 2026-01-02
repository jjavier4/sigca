"use client"
import React from 'react'
import {  Plus, ListChecks } from 'lucide-react';
export default function TablaCriterios({ criterios, grupo, titulo,deleteLoading, handleEliminar, handleAbrirModal }) {
    return (
        <>
            <div className="bg-white text-gray-600 rounded-lg shadow-md overflow-hidden mb-8">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-2xl font-bold text-gray-800">
                        Criterios de Evaluación - {titulo}
                    </h2>
                </div>

                {criterios.length === 0 ? (
                    <div className="text-center py-12 px-6">
                        <ListChecks className="mx-auto mb-4 h-16 w-16 text-gray-400" />
                        <p className="text-gray-500 text-lg">
                            No hay criterios registrados para {titulo.toLowerCase()}
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Criterio
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        10 puntos
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        8 puntos
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        6 puntos
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        0 puntos
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Acción
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {criterios.map((criterio) => (
                                    <tr key={criterio.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div>
                                                <p className="font-semibold text-gray-800">{criterio.nombre}</p>
                                                <p className="text-sm text-gray-600 mt-1">{criterio.descripcion}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm">
                                            {criterio.descripcion_puntaje[0] || '-'}
                                        </td>
                                        <td className="px-6 py-4 text-sm">
                                            {criterio.descripcion_puntaje[1] || '-'}
                                        </td>
                                        <td className="px-6 py-4 text-sm">
                                            {criterio.descripcion_puntaje[2] || '-'}
                                        </td>
                                        <td className="px-6 py-4 text-sm">
                                            {criterio.descripcion_puntaje[3] || '-'}
                                        </td>
                                        <td className="px-6 py-4">
                                            <button
                                                onClick={() => handleEliminar(criterio.id, grupo)}
                                                disabled={deleteLoading === criterio.id}
                                                className="bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-semibold px-4 py-2 rounded-lg transition-all duration-300"
                                            >
                                                {deleteLoading === criterio.id ? 'Eliminando...' : 'Eliminar'}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                <div className="px-6 py-4 border-t border-gray-200">
                    <button
                        onClick={() => handleAbrirModal(grupo)}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg transition-all duration-300 inline-flex items-center gap-2"
                    >
                        <Plus size={20} />
                        Agregar Criterio
                    </button>
                </div>
            </div>
        </>
    )
}
