import React from 'react'
import Link from 'next/link'
export default function RowConvocatorie({titulo, fecha_inicio, fecha_cierre, onEdit, onDelete}) {
    return (
        <tr>
            <td className="px-6 py-4 whitespace-nowrap">{titulo}</td>
            <td className="px-6 py-4 whitespace-nowrap">{fecha_inicio.substr(0,10)}</td>
            <td className="px-6 py-4 whitespace-nowrap">{fecha_cierre.substr(0,10)}</td>
            <td className="px-6 py-4 whitespace-nowrap">
                <button  onClick={onEdit} className="text-blue-600 hover:text-blue-800 mr-3">Editar</button>
                <button onClick={onDelete} className="text-red-600 hover:text-red-800">Eliminar</button>
            </td>
        </tr>
    )
}
