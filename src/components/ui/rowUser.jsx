import React from 'react'
import Link from 'next/link'
export default function RowUser({name, email, role, onEdit, onDelete}) {
    return (
        <tr>
            <td className="px-6 py-4 whitespace-nowrap">{name}</td>
            <td className="px-6 py-4 whitespace-nowrap">{email}</td>
            <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 ${role === "AUTOR" ? "text-green-800" :"text-blue-800"}`}>
                    {role}
                </span>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
                <button  onClick={onEdit} className="text-blue-600 hover:text-blue-800 mr-3">Editar</button>
                <button onClick={onDelete} className="text-red-600 hover:text-red-800">Eliminar</button>
            </td>
        </tr>
    )
}
