import React from 'react'
import { Download, Save } from 'lucide-react';
export default function RowAssessedIA({ trabajo, handleDescargarPDF, handleInputChange, formDataMap, handleGuardar, loadingStates }) {
    return (
        <tr className="hover:bg-gray-50 transition-colors">
            <td className="px-6 py-4">
                <div>
                    <p className="font-semibold text-gray-800 text-sm mb-1">
                        {trabajo.titulo}
                    </p>
                    <p className="text-xs text-gray-600 mb-2">
                        {trabajo.convocatoria.titulo}
                    </p>
                    <div className="flex gap-2 items-center">
                        <span className={`text-xs px-2 py-1 rounded-full ${trabajo.tipo === 'DIFUSION'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-purple-100 text-purple-800'
                            }`}>
                            {trabajo.tipo}
                        </span>
                        <span className="text-xs text-gray-500">
                            {trabajo.autor}
                        </span>
                    </div>
                </div>
            </td>

            <td className="px-6 py-4 text-center">
                <button
                    onClick={() => handleDescargarPDF(trabajo.archivo_url, trabajo.titulo)}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg transition-all duration-300 inline-flex items-center gap-2"
                >
                    <Download size={16} />
                    Descargar
                </button>
            </td>

            <td className="px-6 py-4 text-center">
                <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={formDataMap[trabajo.id]?.nvl_ia || ''}
                    onChange={(e) => handleInputChange(trabajo.id, 'nvl_ia', e.target.value)}
                    placeholder="0-100"
                    className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center"
                />
            </td>

            <td className="px-6 py-4 text-center">
                <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={formDataMap[trabajo.id]?.nvl_plagio || ''}
                    onChange={(e) => handleInputChange(trabajo.id, 'nvl_plagio', e.target.value)}
                    placeholder="0-100"
                    className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center"
                />
            </td>

            <td className="px-6 py-4 text-center">
                <button
                    onClick={() => handleGuardar(trabajo.id)}
                    disabled={loadingStates[trabajo.id]}
                    className="bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-semibold px-4 py-2 rounded-lg transition-all duration-300 inline-flex items-center gap-2"
                >
                    {loadingStates[trabajo.id] ? (
                        'Guardando...'
                    ) : (
                        <>
                            <Save size={16} />
                            Guardar
                        </>
                    )}
                </button>
            </td>
        </tr>
    )
}
