import React, { useEffect, useState } from 'react';
import { FileText, Calendar, RefreshCw, CheckCircle, XCircle, Clock, AlertCircle, Eye,Settings } from 'lucide-react';

// Componente Card de Trabajo
export default function CardWork({ trabajo,numWork }) {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getEstadoConfig = (estado) => {
    const configs = {
      EN_REVISION: {
        color: 'bg-blue-100 text-blue-800 border-blue-200',
        icon: <Clock size={18} />,
        texto: 'En Revisión'
      },
      ACEPTADO: {
        color: 'bg-green-100 text-green-800 border-green-200',
        icon: <CheckCircle size={18} />,
        texto: 'Aceptado'
      },
      CAMBIOS_SOLICITADOS: {
        color: 'bg-orange-100 text-orange-800 border-orange-200',
        icon: <AlertCircle size={18} />,
        texto: 'Cambios Solicitados'
      },
      RECHAZADO: {
        color: 'bg-red-100 text-red-800 border-red-200',
        icon: <XCircle size={18} />,
        texto: 'Rechazado'
      }
    };
    return configs[estado] || configs.EN_REVISION;
  };

  const estadoConfig = getEstadoConfig(trabajo.estado);

  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r bg-gray-900 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-white">
            <FileText size={20} />
            <span className="font-semibold">Trabajo # {numWork}</span>
          </div>
          <div className={`flex items-center space-x-2 px-3 py-1 rounded-full ${estadoConfig.color}`}>
            {estadoConfig.icon}
            <span className="text-sm font-semibold">{estadoConfig.texto}</span>
          </div>
        </div>
      </div>

      {/* Contenido */}
      <div className="p-6 space-y-4">
        {/* Título de la Convocatoria */}
        <div>
          <h3 className="text-lg font-bold text-gray-800 mb-1">
            {trabajo.convocatoria.titulo}
          </h3>
          <p className="text-sm text-gray-600">
            Convocatoria asociada
          </p>
        </div>

        {/* Información del trabajo */}
        <div className="space-y-3 pt-3 border-t border-gray-200">
          {/* Versión/Intentos */}
          <div className="flex items-center text-gray-700">
            <RefreshCw className="mr-3 text-purple-600" size={18} />
            <div className="flex-1">
              <span className="text-sm font-medium">Intento:</span>
              <span className="ml-2 text-sm">{trabajo.version}</span>
            </div>
          </div>

          {/* Fecha de creación */}
          <div className="flex items-center text-gray-700">
            <Calendar className="mr-3 text-green-600" size={18} />
            <div className="flex-1">
              <span className="text-sm font-medium">Creado:</span>
              <span className="ml-2 text-sm">{formatDate(trabajo.createdAt)}</span>
            </div>
          </div>

          {/* Última actualización */}
          <div className="flex items-center text-gray-700">
            <Calendar className="mr-3 text-orange-600" size={18} />
            <div className="flex-1">
              <span className="text-sm font-medium">Actualizado:</span>
              <span className="ml-2 text-sm">{formatDate(trabajo.updatedAt)}</span>
            </div>
          </div>
        </div>

        {/* Botón ver detalles */}
        <div className="pt-4 border-t border-gray-200">
          <button
            onClick={() => onViewDetails(trabajo)}
            className="w-full flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition-colors group"
          >
            <Settings className="mr-2" size={18} />
            Modificar Trabajo
          </button>
        </div>
      </div>
    </div>
  );
}

