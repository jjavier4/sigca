'use client'
import React from 'react'
import { Download, Save, Eye, Circle,Loader2 } from 'lucide-react';
export default function RowAssessedIA({ trabajo, handleInputChange, formDataMap, handleGuardar, loadingStates }) {
    return (
        <tr className="hover:bg-gray-50 transition-colors">
            <td className="px-6 py-4 ">
                <table className="w-full">
                    <tbody>
                        <tr className="border-b border-gray-200 mb-2">
                            <td className=" text-black text-sm font-semibold">
                                Usuario:
                            </td>
                            <td className=" text-black text-sm ">
                                {trabajo.autor.id}
                            </td>
                        </tr>
                        <tr className="border-b border-gray-200 mb-2">
                            <td className=" text-black text-sm font-semibold">
                                Trabajo:
                            </td>
                            <td className=" text-black text-sm ">
                                {trabajo.titulo}
                            </td>
                        </tr>
                        <tr className="border-b border-gray-200 mb-2">
                            <td className=" text-black text-sm font-semibold">
                                Convocatoria:
                            </td>
                            <td className=" text-black text-sm ">
                                {trabajo.convocatoria.titulo}
                            </td>
                        </tr>
                        <tr className="border-b border-gray-200 mb-2">
                            <td className=" text-black text-sm font-semibold">
                                Nombre Documento:
                            </td>
                            <td className=" text-black text-sm ">
                                {trabajo.id}
                            </td>
                        </tr>
                        <tr className="border-b border-gray-200 mb-2">
                            <td className=" text-black text-sm font-semibold">
                                Tipo:
                            </td>
                            <td className=" text-black text-sm ">
                                {trabajo.tipo}
                            </td>
                        </tr>
                    </tbody>
                </table>

                
            </td>

            <td className="px-6 py-4 ">
                <div className="grid grid-row-2 gap-2 items-center justify-center">
                    <a
                        href={`/ciidici/api/works/${trabajo.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-blue-600 hover:bg-blue-700  text-white font-semibold px-4 py-2 rounded-lg transition-all duration-300 inline-flex items-center gap-2"
                    >
                        <Eye size={16} />
                        Ver PDF
                    </a>

                    <a
                        href={`/ciidici/api/works/${trabajo.id}?download=1`}
                        className="bg-blue-600 hover:bg-blue-700  text-white font-semibold px-4 py-2 rounded-lg transition-all duration-300 inline-flex items-center gap-2"
                    >
                        <Download size={16} />
                        Descargar
                    </a>
                </div>
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
                    className="bg-green-600 hover:bg-green-700 disabled:bg-yellow-400 text-white font-semibold px-4 py-2 rounded-lg transition-all duration-300 inline-flex items-center gap-2"
                >
                    {loadingStates[trabajo.id] ? (
                        <>
                            <Loader2 size={16} className=" text-yellow-600  animate-spin" />
                            Guardando
                        </>
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
