import React from 'react'

export default function ManageUsers() {
    return (
        <div>
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Gestionar Usuarios COMITE</h2>
            <div className="bg-white text-gray-600 rounded-lg shadow-md overflow-hidden">
                <div className="p-4 border-b">
                    <input
                        type="text"
                        placeholder="Buscar usuario por nombre o email..."
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    />
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rol</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            <tr>
                                <td className="px-6 py-4 whitespace-nowrap">Dr. Juan Pérez</td>
                                <td className="px-6 py-4 whitespace-nowrap">juan.perez@example.com</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                                        AUTOR
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <button className="text-blue-600 hover:text-blue-800 mr-3">Editar</button>
                                    <button className="text-red-600 hover:text-red-800">Eliminar</button>
                                </td>
                            </tr>
                            <tr>
                                <td className="px-6 py-4 whitespace-nowrap">Dra. María López</td>
                                <td className="px-6 py-4 whitespace-nowrap">maria.lopez@example.com</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                                        REVISOR
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <button className="text-blue-600 hover:text-blue-800 mr-3">Editar</button>
                                    <button className="text-red-600 hover:text-red-800">Eliminar</button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
