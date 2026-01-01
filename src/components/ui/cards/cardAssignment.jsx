import { FileText, User, UserCheck, Calendar, CheckCircle, XCircle, AlertCircle, Users } from 'lucide-react';

// Componente Card de Trabajo Sin Asignar
export function CardNotAssignment({ trabajo, isSelected, onSelect, asignacionesCount }) {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const yaAsignado = asignacionesCount > 0;
  const autorPrincipal = trabajo.autores?.find(a => a.esAutorPrincipal);
  const nombreAutor = autorPrincipal?.usuario?.nombre || 'Sin autor principal';

  return (
    <div
      onClick={() => !yaAsignado && onSelect(trabajo)}
      className={`bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer border-2 ${isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300'
        } ${yaAsignado ? 'opacity-50 cursor-not-allowed bg-gray-50' : ''}`}
    >
      <div className="p-4 space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-2 flex-1">
            <FileText className="text-blue-600" size={20} />
            <div className="flex-1">
              <h3 className="font-bold text-gray-800 text-sm line-clamp-2">
                {trabajo.titulo || 'Sin título'}
              </h3>
              <p className="text-xs text-gray-500">{nombreAutor}</p>
            </div>
          </div>
          {isSelected && !yaAsignado && (
            <CheckCircle className="text-blue-600 flex-shrink-0" size={20} />
          )}
          {yaAsignado && (
            <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded">
              Asignado
            </span>
          )}
        </div>

        {/* Convocatoria */}
        <div className="bg-gray-50 rounded-lg p-2">
          <p className="text-xs text-gray-800">
            {trabajo.convocatoria?.titulo || 'Sin convocatoria'}
          </p>
        </div>

        {/* Fecha */}
        <div className="flex items-center text-gray-600 text-xs">
          <Calendar className="mr-2" size={14} />
          <span>Enviado: {formatDate(trabajo.createdAt)}</span>
        </div>

        {/* Estado de asignación */}
        <div className="flex items-center justify-between">
          <div className={`flex items-center ${yaAsignado ? 'text-green-600' : 'text-orange-600'} text-xs`}>
            {yaAsignado ? (
              <>
                <CheckCircle size={14} className="mr-1" />
                <span className="font-semibold">Completo</span>
              </>
            ) : (
              <>
                <AlertCircle size={14} className="mr-1" />
                <span className="font-semibold">Pendiente</span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Componente Card de Revisor
export function CardReviewer({ revisor, isSelected, onSelect, disabled }) {
  const estadoColor = revisor.estado === 'DISPONIBLE'
    ? 'bg-green-100 text-green-800'
    : 'bg-red-100 text-red-800';

  return (
    <div
      onClick={() => !disabled && onSelect(revisor)}
      className={`bg-white rounded-lg shadow-md transition-all duration-300 border-2 ${!disabled && 'cursor-pointer hover:shadow-lg'
        } ${isSelected ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-green-300'
        } ${disabled ? 'opacity-50 cursor-not-allowed bg-gray-50' : ''
        }`}
    >
      <div className="p-4 space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3 flex-1">
            <div className={`${revisor.estado === 'DISPONIBLE' ? 'bg-green-100' : 'bg-red-100'} rounded-full p-2`}>
              <User className={`${revisor.estado === 'DISPONIBLE' ? 'text-green-600' : 'text-red-600'}`} size={20} />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-gray-800 text-sm">
                {revisor.nombre}
              </h3>
              <p className="text-xs text-gray-500">{revisor.email}</p>
            </div>
          </div>
          {isSelected && (
            <UserCheck className="text-green-600 flex-shrink-0" size={20} />
          )}
        </div>



        {/* Estadísticas */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-200">
          <div className="text-center flex-1">
            <p className="text-xs text-gray-600">Trabajos Activos</p>
            <p className="text-lg font-bold text-blue-600">{revisor.trabajosActivos}/4</p>
          </div>
          <div className="text-center flex-1 border-l border-gray-200">
            {/* Estado Badge */}
            <span className={`text-xs px-3 py-1 rounded-full font-medium ${estadoColor}`}>
              {revisor.estado}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}