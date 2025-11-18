import React from 'react'

export default function CardInfo({ title, stats, classN, onclick,select=false }) {
    return (
        <button
            className={`bg-white rounded-lg shadow-sm p-4  pointer-cursor hover:shadow-md transition-all duration-300 
            ${select ? 'border-4' : 'border-l-4'} 
            ${classN}`}
            onClick={onclick}>
            <p className="text-gray-600 text-sm mb-1">{title}</p>
            <p className="text-2xl font-bold text-gray-800">{stats}</p>
        </button>

    )
}
