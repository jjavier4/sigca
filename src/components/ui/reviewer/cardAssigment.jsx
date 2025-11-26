import React from 'react'
import { Clock } from 'lucide-react';

export default function CardAssigment({ asignacion, onSelect, isSelected }) {
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-MX', {
            month: 'short',
            day: 'numeric'
        });
    };


    return (
        <button
            onClick={() => onSelect(asignacion)}
            className={`w-full text-left p-4 rounded-lg border-2 transition-all ${isSelected
                ? 'border-blue-600 bg-blue-50'
                : 'border-gray-200 hover:border-blue-300 bg-white'
                }`}
        >
            <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-sm line-clamp-2 flex-1">
                    {asignacion.trabajo.convocatoria.titulo}
                </h3>
                <span className={`text-xs px-2 py-1 rounded-full ml-2 bg-blue-100 text-blue-800`}>
                    v{asignacion.trabajo.version}
                </span>
            </div>
            <div className="flex items-center text-xs text-gray-600">
                <Clock size={12} className="mr-1" />
                <span>{formatDate(asignacion.createdAt)}</span>
            </div>
        </button>
    );
}
