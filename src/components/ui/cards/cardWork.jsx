import React from 'react';
import { FileText, Calendar, CheckCircle, XCircle, Clock, Coins, Trash2, FileCheckIcon, Edit2,Eye } from 'lucide-react';

// Componente Card de Trabajo
export default function CardWork({ trabajo, getReferenciaPagoPDF, onDelete, onEdit }) {
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
      REGISTRADO: {
        color: 'bg-blue-100 text-blue-800 border-blue-200',
        icon: <FileCheckIcon size={18} />,
        texto: 'Registrado'
      },
      EN_REVISION: {
        color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        icon: <Clock size={18} />,
        texto: 'En Revisión'
      },
      ACEPTADO: {
        color: 'bg-green-100 text-green-800 border-green-200',
        icon: <CheckCircle size={18} />,
        texto: 'Aceptado'
      },
      RECHAZADO: {
        color: 'bg-red-100 text-red-800 border-red-200',
        icon: <XCircle size={18} />,
        texto: 'Rechazado'
      }
    };
    return configs[estado] || configs.EN_REVISION;
  };

  const getEstadoPago = (estadoPago) => {
    if (estadoPago) return {
      color: 'bg-green-100 text-green-800 border-green-200',
      icon: <CheckCircle size={18} />
    }
    return {
      color: 'bg-red-100 text-red-800 border-red-200',
      icon: <XCircle size={18} />
    };
  }

  const estadoBotonRefPago = () => {
    if (trabajo.referencia_pago) {
      if (trabajo.estado_pago === true) {
        return true;
      }
    }
    return false;
  }

  const estadoConfig = getEstadoConfig(trabajo.estado);
  const estadoPagoConfig = getEstadoPago(trabajo.estado_pago);

  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r bg-gray-900 p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2 text-white">
            <FileText size={20} />
            <span className="font-semibold">Trabajo: {trabajo.titulo}</span>
          </div>

          {/* Botón de eliminar */}
          {
            trabajo.estado === 'REGISTRADO' &&
            <div className="flex items-center space-x-2">
              <button
                onClick={() => onEdit(trabajo)}
                className="text-blue-400 hover:text-blue-300 transition-colors p-1 rounded-lg hover:bg-blue-900/20"
                title="Editar trabajo"
              >
                <Edit2 size={18} />
              </button>
              <button
                onClick={() => onDelete(trabajo.id)}
                className="text-red-400 hover:text-red-300 transition-colors p-1 rounded-lg hover:bg-red-900/20"
                title="Eliminar trabajo"
              >
                <Trash2 size={18} />
              </button>

            </div>
          }
        </div>

        <div className="flex items-center justify-between">
          <div className={`flex items-center space-x-2 px-3 py-1 rounded-full ${estadoConfig.color}`}>
            {estadoConfig.icon}
            <span className="text-sm font-semibold">{estadoConfig.texto}</span>
          </div>
          {
            trabajo.estado === 'ACEPTADO' && (
              <div className={`flex items-center space-x-2 px-3 py-1 rounded-full ${estadoPagoConfig.color}`}>
                {estadoPagoConfig.icon}
                <span className="text-sm font-semibold">Pagado</span>
              </div>
            )
          }
        </div>
      </div>

      {/* Contenido */}
      <div className="p-6 space-y-4">
        {/* Título de la Convocatoria */}
        <div className="space-y-3 pt-3">
          <strong>Convocatoria asociada:</strong>

          <h3 className="text-sm">
            {trabajo.convocatoria.titulo}
          </h3>

        </div>

        {/* Información del trabajo */}
        <div className="space-y-3 pt-3 ">
          {/* coautores*/}
          {trabajo.coautores.length > 0 ? (
            <div className="w-full overflow-x-auto">
              <strong>Coautores Registrados:</strong>
              <table className="w-full mt-2 border border-gray-200 rounded-lg table-fixed">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-2 py-2 text-left text-sm font-medium text-gray-700">Nombre</th>
                    <th className="px-2 py-2 text-left text-sm font-medium text-gray-700">Email</th>
                  </tr>
                </thead>
                <tbody>
                  {trabajo.coautores.map((coautor, index) => (
                    <tr key={index} className="border-b border-gray-200">
                      <td className="px-2 py-2 text-sm text-gray-700 break-words">{coautor.nombre}</td>
                      <td className="px-2 py-2 text-sm text-gray-700 break-all">{coautor.email}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) :
            (
              <div>
                <strong>Coautores:</strong>
                <p className="text-sm text-gray-600">No hay coautores asociados a este trabajo.</p>
              </div>

            )
          }
          {/*Consulta de PDF */}
          <a
            href={`/ciidici/api/works/${trabajo.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-blue-600 hover:bg-blue-700  text-white font-semibold px-4 py-2 rounded-lg transition-all duration-300 inline-flex items-center gap-2"
          >
            <Eye size={16} />
            Ver PDF
          </a>

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

        {
          trabajo.estado === 'ACEPTADO' && (
            <div className="pt-4 border-t border-gray-200">
              <button
                onClick={() => getReferenciaPagoPDF(trabajo.id)}
                className="w-full flex items-center justify-center bg-blue-600 hover:bg-blue-700 cursor-pointer disabled:bg-blue-300 disabled:cursor-not-allowed text-white font-medium py-3 rounded-lg transition-colors group"
                disabled={estadoBotonRefPago()}
              >
                <Coins className="mr-2" size={18} />
                Generar referencia de pago
              </button>
            </div>
          )}
      </div>
    </div>
  );
}