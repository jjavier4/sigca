import { FileText, User, UserCheck, Calendar, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
// Componente Card de Trabajo Sin Asignar
export function CardNotAssignmet({ trabajo, isSelected, onSelect }) {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div
      onClick={() => onSelect(trabajo)}
      className={`bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer border-2 ${
        isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300'
      }`}
    >
      <div className="p-4 space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-2 flex-1">
            <FileText className="text-blue-600" size={20} />
            <div className="flex-1">
              <h3 className="font-bold text-gray-800 text-sm line-clamp-1">
                {trabajo.convocatoria.titulo}
              </h3>
              <p className="text-xs text-gray-500">v{trabajo.version}</p>
            </div>
          </div>
          {isSelected && (
            <CheckCircle className="text-blue-600 flex-shrink-0" size={20} />
          )}
        </div>

        

        {/* Fecha */}
        <div className="flex items-center text-gray-600 text-xs">
          <Calendar className="mr-2" size={14} />
          <span>Enviado: {formatDate(trabajo.createdAt)}</span>
        </div>

        {/* Estado */}
        <div className="flex items-center justify-center bg-orange-100 text-orange-800 rounded-lg py-2">
          <AlertCircle size={16} className="mr-2" />
          <span className="text-xs font-semibold">Sin Revisor Asignado</span>
        </div>
      </div>
    </div>
  );
}

// Componente Card de Revisor
export function CardReviewer({ revisor, isSelected, onSelect, trabajosAsignados }) {
  return (
    <div
      onClick={() => onSelect(revisor)}
      className={`bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer border-2 ${
        isSelected ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-green-300'
      }`}
    >
      <div className="p-4 space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3 flex-1">
            <div className="bg-green-100 rounded-full p-2">
              <User className="text-green-600" size={20} />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-gray-800 text-sm">
                {revisor.nombre} {revisor.apellidoP}
              </h3>
              <p className="text-xs text-gray-500">{revisor.apellidoM}</p>
            </div>
          </div>
          {isSelected && (
            <UserCheck className="text-green-600 flex-shrink-0" size={20} />
          )}
        </div>

        {/* Email */}
        <div className="bg-gray-50 rounded-lg p-2">
          <p className="text-xs text-gray-800 truncate">{revisor.email}</p>
        </div>

        {/* Estadísticas */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-200">
          <div className="text-center flex-1">
            <p className="text-xs text-gray-600">Trabajos Activos</p>
            <p className="text-lg font-bold text-blue-600">{trabajosAsignados}</p>
          </div>
          <div className="text-center flex-1 border-l border-gray-200">
            <p className="text-xs text-gray-600">Estado</p>
            <p className="text-xs font-semibold text-green-600">Disponible</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Modal de Confirmación
export function ConfirmacionModal({ trabajo, revisor, onConfirm, onCancel, isLoading }) {
  if (!trabajo || !revisor) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-md w-full">
        <div className="bg-gradient-to-r from-blue-600 to-green-600 p-6 rounded-t-2xl">
          <h2 className="text-2xl font-bold text-white">Confirmar Asignación</h2>
        </div>

        <div className="p-6 space-y-4">
          {/* Trabajo */}
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <p className="text-xs text-blue-600 font-semibold mb-2">TRABAJO A ASIGNAR</p>
            <p className="font-bold text-gray-800 mb-1">{trabajo.convocatoria.titulo}</p>
            <p className="text-sm text-gray-600">
              Autor: {trabajo.usuario.nombre} {trabajo.usuario.apellidoP}
            </p>
            <p className="text-xs text-gray-500 mt-1">Versión: {trabajo.version}</p>
          </div>

          {/* Revisor */}
          <div className="bg-green-50 rounded-lg p-4 border border-green-200">
            <p className="text-xs text-green-600 font-semibold mb-2">REVISOR ASIGNADO</p>
            <p className="font-bold text-gray-800 mb-1">
              {revisor.nombre} {revisor.apellidoP} {revisor.apellidoM}
            </p>
            <p className="text-sm text-gray-600">{revisor.email}</p>
          </div>

          {/* Información adicional */}
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-xs text-gray-600 mb-2">
              <strong>Plazo de revisión:</strong> 10 días a partir de hoy
            </p>
            <p className="text-xs text-gray-600">
              El revisor tendrá acceso al archivo PDF y podrá evaluar el trabajo.
            </p>
          </div>

          {/* Botones */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={onCancel}
              disabled={isLoading}
              className="flex-1 bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 text-gray-800 font-semibold py-3 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={onConfirm}
              disabled={isLoading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 rounded-lg transition-colors"
            >
              {isLoading ? 'Asignando...' : 'Confirmar Asignación'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}