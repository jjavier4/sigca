import React from 'react';
import { FileText, Calendar, CheckCircle, XCircle, Clock, Coins, Trash2, FileCheckIcon, Edit2, Eye, Users } from 'lucide-react';
import { formatearFechaHora } from '@/utils/fechas';
import { basePath } from '@/utils/basePath.mjs';

// Componente Card de Trabajo
export default function CardWork({ trabajo, getReferenciaPagoPDF, onDelete, onEdit, ocupado = false }) {
  const formatDate = formatearFechaHora;

  const getEstadoConfig = (estado) => {
    const configs = {
      REGISTRADO: {
        color: 'bg-blue-100 text-blue-800 border-blue-200',
        acento: 'bg-blue-500',
        icon: <FileCheckIcon size={14} />,
        texto: 'Registrado'
      },
      EN_REVISION: {
        color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        acento: 'bg-yellow-400',
        icon: <Clock size={14} />,
        texto: 'En Revisión'
      },
      ACEPTADO: {
        color: 'bg-green-100 text-green-800 border-green-200',
        acento: 'bg-green-500',
        icon: <CheckCircle size={14} />,
        texto: 'Aceptado'
      },
      RECHAZADO: {
        color: 'bg-red-100 text-red-800 border-red-200',
        acento: 'bg-red-500',
        icon: <XCircle size={14} />,
        texto: 'Rechazado'
      }
    };
    return configs[estado] || configs.EN_REVISION;
  };

  const getEstadoPago = (estadoPago) => {
    if (estadoPago) return {
      color: 'bg-green-100 text-green-800 border-green-200',
      icon: <CheckCircle size={14} />
    }
    return {
      color: 'bg-red-100 text-red-800 border-red-200',
      icon: <XCircle size={14} />
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
    <div className="h-full flex flex-col bg-white rounded-xl shadow-sm ring-1 ring-gray-200 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 overflow-hidden">
      {/* Franja de acento según estado */}
      <div />

      {/* Header */}
      <div className="bg-gray-900 px-5 py-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0">
            <div className="shrink-0 p-2 rounded-lg bg-white/10 text-blue-300">
              <FileText size={18} />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-medium uppercase tracking-wider text-gray-400">
                Trabajo
              </p>
              <h2
                className="text-white font-semibold leading-snug line-clamp-2 break-words"
                title={trabajo.titulo}
              >
                {trabajo.titulo}
              </h2>
            </div>
          </div>

          {/* Acciones */}
          {
            trabajo.estado === 'REGISTRADO' &&
            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={() => onEdit(trabajo)}
                className="p-2 rounded-lg text-gray-300 hover:text-blue-300 hover:bg-white/10 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
                title="Editar trabajo"
                aria-label="Editar trabajo"
              >
                <Edit2 size={16} />
              </button>
              <button
                onClick={() => onDelete(trabajo)}
                className="p-2 rounded-lg text-gray-300 hover:text-red-400 hover:bg-red-500/10 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
                title="Eliminar trabajo"
                aria-label="Eliminar trabajo"
              >
                <Trash2 size={16} />
              </button>
            </div>
          }
        </div>

        {/* Badges */}
        <div className="flex flex-wrap items-center gap-2 mt-4">
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-semibold ${estadoConfig.color}`}>
            {estadoConfig.icon}
            {estadoConfig.texto}
          </span>
          {
            trabajo.estado === 'ACEPTADO' && (
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-semibold ${estadoPagoConfig.color}`}>
                {estadoPagoConfig.icon}
                Pagado
              </span>
            )
          }
        </div>
      </div>

      {/* Contenido */}
      <div className="flex-1 flex flex-col p-5 gap-5">
        {/* Convocatoria */}
        <section>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-500 mb-1.5">
            Convocatoria asociada
          </p>
          <div className=" bg-gray-50 rounded-lg px-3 py-2">
            <h3 className="text-sm text-gray-800 font-medium leading-relaxed">
              {trabajo.convocatoria.titulo}
            </h3>
          </div>
        </section>

        {/* Coautores */}
        <section>
          <div className="flex items-center gap-2 mb-1.5">
            <Users size={14} className="text-gray-500" />
            <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">
              {trabajo.coautores.length > 0 ? 'Coautores registrados' : 'Coautores'}
            </p>
            {trabajo.coautores.length > 0 && (
              <span className="ml-auto text-[11px] font-semibold text-blue-700 bg-blue-50 border border-blue-100 rounded-full px-2 py-0.5">
                {trabajo.coautores.length}
              </span>
            )}
          </div>

          {trabajo.coautores.length > 0 ? (
            <div className="w-full overflow-x-auto rounded-lg border border-gray-200">
              <table className="w-full table-fixed">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600">Nombre</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600">Email</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {trabajo.coautores.map((coautor, index) => (
                    <tr key={index} className="hover:bg-gray-50 transition-colors">
                      <td className="px-3 py-2 text-sm text-gray-800 break-words">{coautor.nombre}</td>
                      <td className="px-3 py-2 text-sm text-gray-600 break-all">{coautor.email}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-gray-500 italic bg-gray-50 border border-dashed border-gray-200 rounded-lg px-3 py-2">
              No hay coautores asociados a este trabajo.
            </p>
          )}
        </section>

        {/* Consulta de PDF */}
        <a
          href={`${basePath}/api/works/${trabajo.id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="self-start inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-blue-600 text-blue-700 text-sm font-semibold hover:bg-blue-50 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2"
        >
          <Eye size={16} />
          Ver PDF
        </a>

        {/* Fechas */}
        <div className="mt-auto grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4 border-t border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-md bg-green-50">
              <Calendar className="text-green-600" size={16} />
            </div>
            <div className="leading-tight">
              <p className="text-[11px] font-medium uppercase tracking-wider text-gray-500">Creado</p>
              <p className="text-sm text-gray-800">{formatDate(trabajo.createdAt)}</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-md bg-orange-50">
              <Calendar className="text-orange-600" size={16} />
            </div>
            <div className="leading-tight">
              <p className="text-[11px] font-medium uppercase tracking-wider text-gray-500">Actualizado</p>
              <p className="text-sm text-gray-800">{formatDate(trabajo.updatedAt)}</p>
            </div>
          </div>
        </div>
      </div>

      {
        trabajo.estado === 'ACEPTADO' && (
          <div className="px-5 pb-5">
            <button
              onClick={() => getReferenciaPagoPDF(trabajo.id)}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 cursor-pointer disabled:bg-blue-300 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg shadow-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2"
              disabled={estadoBotonRefPago() || ocupado}
            >
              <Coins size={18} />
              Generar referencia de pago
            </button>
          </div>
        )}
    </div>
  );
}