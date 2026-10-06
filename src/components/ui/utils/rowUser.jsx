import React from 'react'
import Link from 'next/link'
export default function RowUser({id, name, email, role, bloqueada, onEdit, onDelete}) {
    return (
        <tr>
            <td className="px-6 py-4 whitespace-nowrap">{id}</td>
            <td className="px-6 py-4 whitespace-nowrap">{name}</td>
            <td className="px-6 py-4 whitespace-nowrap">{email}</td>
            <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 ${role === "AUTOR" ? "text-green-800" :"text-blue-800"}`}>
                    {role}
                </span>
            </td>
            <td className="px-6 py-4 whitespace-nowrap w-1/8 ">
                <button onClick={onDelete} className={`w-full rounded border p-1 inline-flex items-center justify-center ${bloqueada ? 'bg-green-200 text-green-600 hover:text-green-800' : 'bg-red-200 text-red-600 hover:text-red-800'} cursor-pointer`}>
                    {bloqueada ? 'Desbloquear Cuenta' : 'Bloquear Cuenta'}
                </button>
            </td>
        </tr>
    )
}
