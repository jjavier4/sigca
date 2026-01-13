import { FileText, User, UserCheck, Calendar, CheckCircle, XCircle, AlertCircle, Users, Trash2, UserPlus } from 'lucide-react';
export function CardWorkWithAssignments({ trabajo, isSelected, onSelect, onDeleteAssignment }) {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleDeleteAssignment = (asignacionId, e) => {
    e.stopPropagation();
    onDeleteAssignment(asignacionId);
  };

  return (
    <div
      className={`bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 border-2 ${isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
        }`}
    >
      <div className="p-4 space-y-3">
        {/* Header del Trabajo */}
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-2 flex-1">
            <FileText className="text-blue-600" size={20} />
            <div className="flex-1">
              <h3 className="font-bold text-gray-800 text-sm line-clamp-2">
                {trabajo.titulo || 'Sin título'}
              </h3>
            </div>
          </div>
        </div>

        {/* Convocatoria */}
        <div className="bg-gray-50 rounded-lg p-2">
          <p className="text-xs text-gray-800">
            Convocatoria asociada: {trabajo.convocatoria?.titulo || 'Sin convocatoria'}
          </p>
        </div>

        {/* Contador de Asignaciones */}
        <div className="flex items-center justify-between bg-blue-50 rounded-lg p-2">
          <span className="text-xs font-semibold text-blue-800">
            Total de Asignaciones: {trabajo.asignaciones?.length || 0}
          </span>
        </div>

        {/* Lista de Asignaciones */}
        <div className="space-y-2">
          <p className="text-xs font-semibold text-gray-700">Revisores Asignados:</p>
          {trabajo.asignaciones && trabajo.asignaciones.length > 0 ? (
            <div className="space-y-2 max-h-70 overflow-y-auto grid grid-cols-2 gap-2">
              {trabajo.asignaciones.map((asignacion) => (
                <div
                  key={asignacion.id}
                  className="bg-gray-50 rounded-lg p-3 space-y-1 border border-gray-200 "
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-2 flex-1">
                      <User className="text-gray-600" size={14} />
                      <div className="flex-1">
                        <p className="text-xs font-semibold text-gray-800">
                          {asignacion.revisor.nombre} {asignacion.revisor.apellidoP} {asignacion.revisor.apellidoM}
                        </p>
                        <p className="text-xs text-gray-600">
                          {asignacion.revisor.email}
                        </p>
                      </div>
                    </div>
                    {
                      asignacion.activa ?(
                      <button
                        onClick={(e) => handleDeleteAssignment(asignacion.id, e)}
                        className="text-red-600 hover:text-red-800 hover:bg-red-50 p-1 rounded transition-colors "
                        title="Eliminar asignación"
                      >
                        <Trash2 size={16} />
                      </button>
                      ) : (
                        <span className="flex items-center text-green-600 text-xs font-semibold">
                          <CheckCircle className="mr-1" size={14} />
                          Evaluada
                        </span>
                      )
                    }

                  </div>
                  <div className="flex items-center text-gray-500 text-xs pl-6">
                    <Calendar className="mr-1" size={12} />
                    <span>Asignado: {formatDate(asignacion.createdAt)}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-gray-500 italic">Sin asignaciones</p>
          )}
        </div>

        {/* Botón para Agregar Revisor */}
        <button
          onClick={() => onSelect(trabajo)}
          className={`w-full flex items-center justify-center gap-2 py-2 px-4 rounded-lg font-semibold text-sm transition-colors ${isSelected
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
            }`}
        >
          <UserPlus size={16} />
          {isSelected ? 'Trabajo Seleccionado' : 'Agregar Revisor'}
        </button>
      </div>
    </div>
  );
}

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
            </div>
          </div>
          {isSelected && !yaAsignado && (
            <CheckCircle className="text-blue-600 flex-shrink-0" size={20} />
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