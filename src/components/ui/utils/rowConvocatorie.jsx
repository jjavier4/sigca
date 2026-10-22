import React from 'react'
import { formatearDiaISO } from '@/utils/fechas'
export default function RowConvocatorie({titulo, fecha_inicio, fecha_cierre, activa = true, totalTrabajos = 0, onEdit, onDelete}) {
    return (
        <tr className={activa ? '' : 'bg-gray-50 text-gray-400'}>
            <td className="px-6 py-4 whitespace-nowrap">{titulo}</td>
            <td className="px-6 py-4 whitespace-nowrap">{formatearDiaISO(fecha_inicio)}</td>
            <td className="px-6 py-4 whitespace-nowrap">{formatearDiaISO(fecha_cierre)}</td>
            <td className="px-6 py-4 whitespace-nowrap">{totalTrabajos}</td>
            <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${activa ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-600'}`}>
                    {activa ? 'Activa' : 'Inactiva'}
                </span>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
                {activa ? (
                    <>
                        <button  onClick={onEdit} className="text-blue-600 hover:text-blue-800 mr-3">Editar</button>
                        <button onClick={onDelete} className="text-red-600 hover:text-red-800">Desactivar</button>
                    </>
                ) : (
                    <span className="text-xs">Sin acciones</span>
                )}
            </td>
        </tr>
    )
}
