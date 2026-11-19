import React from 'react'
import { formatearDiaISO } from '@/utils/fechas'
import { Pen,Eraser } from 'lucide-react'
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
            <td className="px-6 py-4 flex justify-around items-center gap-2 whitespace-nowrap">
                {activa ? (
                    <>
                        <button  onClick={onEdit} className="text-white bg-blue-600 hover:bg-blue-800 border border-blue-600 py-1 px-3 rounded cursor-pointer">
                            <Pen size={16} className='sm:hidden'/>
                            <span className=" hidden sm:inline">Editar</span>
                        </button>
                        <button onClick={onDelete} className="text-white bg-red-600 hover:bg-red-800 border border-red-600 py-1 px-3 rounded cursor-pointer ml-2">
                            <Eraser size={16} className='sm:hidden'/>
                            <span className=" hidden sm:inline">Desactivar</span>
                        </button>
                    </>
                ) : (
                    <span className="text-xs">Sin acciones</span>
                )}
            </td>
        </tr>
    )
}
