import React from 'react'
import { Clock,CircleCheck,CircleXIcon} from 'lucide-react';

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
            className={`w-full text-left p-4 rounded-lg border-2 transition-all  ${!asignacion.activa
                ? 'border-blue-600 bg-blue-50'
                : 'border-gray-200 hover:border-blue-300 bg-white'
                }`}
            disabled={!asignacion.activa}
        >
            <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-sm line-clamp-2 flex-1 text-black">
                    {asignacion.trabajo.convocatoria.titulo}
                </h3>
                <span className={`text-xs px-2 py-1 rounded-full ml-2 ${asignacion.activa ? 'text-blue-800 bg-blue-100 ' : 'text-green-800 bg-green-100 '}`}>
                    {asignacion.activa ? <CircleXIcon size={12} className="inline mr-1" /> : <CircleCheck size={12} className="inline mr-1" />}
                    {asignacion.activa ? 'Activa' : 'Evaluada'}
                </span>
            </div>
            <div className="flex items-center text-xs text-gray-600">
                <Clock size={12} className="mr-1" />
                <span>{formatDate(asignacion.createdAt)}</span>
            </div>
        </button>
    );
}
