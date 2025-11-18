"use client";
import React, { useEffect, useState } from 'react';
import { FileText, Calendar, Clock, CheckCircle, XCircle, AlertCircle, Eye, MessageSquare, Send } from 'lucide-react';
import { useSession } from 'next-auth/react';
// Componente Card de Asignación
function AsignacionCard({ asignacion, onViewPDF, onUpdateEstado }) {
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-MX', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const getDiasRestantes = () => {
        const now = new Date();
        const cierre = new Date(asignacion.closeAt);
        const diferencia = Math.ceil((cierre - now) / (1000 * 60 * 60 * 24));

        if (diferencia < 0) return { texto: 'Plazo vencido', color: 'text-red-600' };
        if (diferencia === 0) return { texto: 'Último día', color: 'text-orange-600' };
        if (diferencia <= 3) return { texto: `${diferencia} días restantes`, color: 'text-orange-600' };
        return { texto: `${diferencia} días restantes`, color: 'text-green-600' };
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

    const estadoConfig = getEstadoConfig(asignacion.trabajo.estado);
    const diasRestantes = getDiasRestantes();

    return (
        <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 border border-gray-200">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-white flex-1">
                        <FileText size={20} />
                        <div>
                            <h3 className="font-bold text-sm line-clamp-1">
                                {asignacion.trabajo.convocatoria.titulo}
                            </h3>
                            <p className="text-xs text-blue-100">v{asignacion.trabajo.version}</p>
                        </div>
                    </div>
                    <div className={`flex items-center space-x-2 px-3 py-1 rounded-full border ${estadoConfig.color}`}>
                        {estadoConfig.icon}
                        <span className="text-xs font-semibold">{estadoConfig.texto}</span>
                    </div>
                </div>
            </div>

            {/* Contenido */}
            <div className="p-5 space-y-4">
                {/* Información del Autor */}
                

                {/* Fechas */}
                <div className="space-y-2">
                    <div className="flex items-center text-gray-700 text-sm">
                        <Calendar className="mr-2 text-blue-600" size={16} />
                        <span>Asignado: {formatDate(asignacion.createdAt)}</span>
                    </div>
                    <div className="flex items-center text-gray-700 text-sm">
                        <Clock className="mr-2 text-orange-600" size={16} />
                        <span className={`font-medium ${diasRestantes.color}`}>
                            {diasRestantes.texto}
                        </span>
                    </div>
                </div>

                {/* Comentarios anteriores */}
                {asignacion.trabajo.comentarios && asignacion.trabajo.comentarios.length > 0 && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                        <div className="flex items-center mb-2">
                            <MessageSquare className="mr-2 text-yellow-600" size={16} />
                            <span className="text-xs font-semibold text-yellow-800">
                                Comentarios previos ({asignacion.trabajo.comentarios.length})
                            </span>
                        </div>
                    </div>
                )}

                {/* Botones de acción */}
                <div className="space-y-2 pt-3 border-t border-gray-200">
                    <button
                        onClick={() => onViewPDF(asignacion)}
                        className="w-full flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition-colors"
                    >
                        <Eye className="mr-2" size={18} />
                        Ver Documento PDF
                    </button>

                    {asignacion.trabajo.estado === 'EN_REVISION' && (
                        <button
                            onClick={() => onUpdateEstado(asignacion)}
                            className="w-full flex items-center justify-center bg-green-600 hover:bg-green-700 text-white font-medium py-3 rounded-lg transition-colors"
                        >
                            <CheckCircle className="mr-2" size={18} />
                            Evaluar Trabajo
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

// Modal de Evaluación
function EvaluacionModal({ asignacion, onClose, onSubmit, isLoading }) {
    const [estadoSeleccionado, setEstadoSeleccionado] = useState('');
    const [comentario, setComentario] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = () => {
        if (!estadoSeleccionado) {
            setError('Debes seleccionar un estado');
            return;
        }

        if (estadoSeleccionado === 'CAMBIOS_SOLICITADOS' && !comentario.trim()) {
            setError('Debes agregar comentarios si solicitas cambios');
            return;
        }

        onSubmit({
            trabajoId: asignacion.trabajo.id,
            asignacionId: asignacion.id,
            nuevoEstado: estadoSeleccionado,
            comentario: comentario.trim() || null
        });
    };

    if (!asignacion) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="bg-gradient-to-r from-green-600 to-green-700 p-6 sticky top-0">
                    <div className="flex justify-between items-start">
                        <div>
                            <h2 className="text-2xl font-bold text-white mb-2">Evaluar Trabajo</h2>
                            <p className="text-green-100 text-sm">{asignacion.trabajo.convocatoria.titulo}</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-colors"
                        >
                            ✕
                        </button>
                    </div>
                </div>

                {/* Contenido */}
                <div className="p-6 space-y-6">
                    {/* Información del trabajo */}
                    <div className="bg-gray-50 rounded-lg p-4">
                        
                        <p className="text-sm text-gray-600">
                            <strong>Versión:</strong> {asignacion.trabajo.version}
                        </p>
                    </div>

                    {/* Error */}
                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-800 text-sm">
                            {error}
                        </div>
                    )}

                    {/* Selector de Estado */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-800 mb-3">
                            Decisión de Evaluación *
                        </label>
                        <div className="space-y-3">
                            <button
                                onClick={() => setEstadoSeleccionado('ACEPTADO')}
                                className={`w-full flex items-center p-4 rounded-lg border-2 transition-all ${estadoSeleccionado === 'ACEPTADO'
                                        ? 'border-green-500 bg-green-50'
                                        : 'border-gray-200 hover:border-green-300'
                                    }`}
                            >
                                <CheckCircle className={`mr-3 ${estadoSeleccionado === 'ACEPTADO' ? 'text-green-600' : 'text-gray-400'}`} size={24} />
                                <div className="text-left">
                                    <p className="font-semibold text-gray-800">Aceptar</p>
                                    <p className="text-xs text-gray-600">El trabajo cumple con todos los requisitos</p>
                                </div>
                            </button>

                            <button
                                onClick={() => setEstadoSeleccionado('CAMBIOS_SOLICITADOS')}
                                className={`w-full flex items-center p-4 rounded-lg border-2 transition-all ${estadoSeleccionado === 'CAMBIOS_SOLICITADOS'
                                        ? 'border-orange-500 bg-orange-50'
                                        : 'border-gray-200 hover:border-orange-300'
                                    }`}
                            >
                                <AlertCircle className={`mr-3 ${estadoSeleccionado === 'CAMBIOS_SOLICITADOS' ? 'text-orange-600' : 'text-gray-400'}`} size={24} />
                                <div className="text-left">
                                    <p className="font-semibold text-gray-800">Solicitar Cambios</p>
                                    <p className="text-xs text-gray-600">Se requieren modificaciones antes de aceptar</p>
                                </div>
                            </button>

                            <button
                                onClick={() => setEstadoSeleccionado('RECHAZADO')}
                                className={`w-full flex items-center p-4 rounded-lg border-2 transition-all ${estadoSeleccionado === 'RECHAZADO'
                                        ? 'border-red-500 bg-red-50'
                                        : 'border-gray-200 hover:border-red-300'
                                    }`}
                            >
                                <XCircle className={`mr-3 ${estadoSeleccionado === 'RECHAZADO' ? 'text-red-600' : 'text-gray-400'}`} size={24} />
                                <div className="text-left">
                                    <p className="font-semibold text-gray-800">Rechazar</p>
                                    <p className="text-xs text-gray-600">El trabajo no cumple con los requisitos</p>
                                </div>
                            </button>
                        </div>
                    </div>

                    {/* Comentarios */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-800 mb-2">
                            Comentarios {estadoSeleccionado === 'CAMBIOS_SOLICITADOS' && '(Requerido)'}
                        </label>
                        <textarea
                            value={comentario}
                            onChange={(e) => setComentario(e.target.value)}
                            placeholder="Escribe tus observaciones, sugerencias o correcciones necesarias..."
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all min-h-[150px] resize-none"
                            disabled={isLoading}
                        />
                        <p className="text-xs text-gray-500 mt-2">
                            {estadoSeleccionado === 'CAMBIOS_SOLICITADOS'
                                ? 'Especifica claramente qué cambios debe realizar el autor'
                                : 'Opcional: Agrega observaciones adicionales'}
                        </p>
                    </div>

                    {/* Botones */}
                    <div className="flex gap-3 pt-4">
                        <button
                            onClick={onClose}
                            disabled={isLoading}
                            className="flex-1 bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 text-gray-800 font-semibold py-3 rounded-lg transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={isLoading || !estadoSeleccionado}
                            className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center"
                        >
                            {isLoading ? (
                                'Guardando...'
                            ) : (
                                <>
                                    <Send className="mr-2" size={18} />
                                    Enviar Evaluación
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Modal de PDF Viewer
function PDFViewerModal({ asignacion, onClose }) {
    if (!asignacion) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl w-full max-w-6xl h-[90vh] flex flex-col">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-4 rounded-t-2xl flex justify-between items-center">
                    <div className="text-white">
                        <h2 className="text-xl font-bold">{asignacion.trabajo.convocatoria.titulo}</h2>
                        <p className="text-sm text-blue-100">
                            Autor: {asignacion.trabajo.usuario.nombre} {asignacion.trabajo.usuario.apellidoP}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-colors"
                    >
                        ✕
                    </button>
                </div>

                {/* PDF Viewer */}
                <div className="flex-1 p-4 overflow-hidden">
                    <iframe
                        src={`${asignacion.trabajo.archivo_url}`}
                        className="w-full h-full rounded-lg border border-gray-300"
                        title="PDF Viewer"
                    />
                </div>
            </div>
        </div>
    );
}

// Componente Principal
export default function MisAsignaciones() {
    const {  data: session  } = useSession();
    const [asignaciones, setAsignaciones] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [filtroEstado, setFiltroEstado] = useState('TODAS');

    const [selectedAsignacionPDF, setSelectedAsignacionPDF] = useState(null);
    const [selectedAsignacionEvaluar, setSelectedAsignacionEvaluar] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);


    useEffect(() => {
        if (session?.user?.id) {
            fetchAsignaciones();
        }
    }, [session]);

    const fetchAsignaciones = async () => {
        try {
            setLoading(true);
            const response = await fetch(`/api/assignments/assignments-user?revisorId=${session.user.id}`);
            const data = await response.json();

            if (response.ok) {
                setAsignaciones(data.asignaciones);
            } else {
                setError(data.error);
            }
        } catch (error) {
            console.error('Error al cargar asignaciones:', error);
            setError('Error al cargar las asignaciones');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmitEvaluacion = async (evaluacion) => {
        try {
            setIsSubmitting(true);
            setError('');

            const response = await fetch('/api/assignments/assess', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(evaluacion)
            });

            const data = await response.json();

            if (response.ok) {
                setSuccess('Evaluación enviada exitosamente');
                setSelectedAsignacionEvaluar(null);
                await fetchAsignaciones();
                setTimeout(() => setSuccess(''), 3000);
            } else {
                setError(data.error);
                setTimeout(() => setError(''), 3000);
            }
        } catch (error) {
            console.error('Error al enviar evaluación:', error);
            setError('Error al enviar la evaluación');
            setTimeout(() => setError(''), 3000);
        } finally {
            setIsSubmitting(false);
        }
    };

    const asignacionesFiltradas = asignaciones.filter((asig) => {
        if (filtroEstado === 'TODAS') return true;
        if (filtroEstado === 'ACTIVAS') return asig.activa;
        return asig.trabajo.estado === filtroEstado;
    });

    const getEstadisticas = () => {
        return {
            total: asignaciones.length,
            activas: asignaciones.filter(a => a.activa).length,
            enRevision: asignaciones.filter(a => a.trabajo.estado === 'EN_REVISION').length,
            evaluadas: asignaciones.filter(a => a.trabajo.estado !== 'EN_REVISION').length
        };
    };

    const stats = getEstadisticas();

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Cargando asignaciones...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-gray-800 mb-2">Mis Asignaciones</h1>
                    <p className="text-gray-600">Trabajos asignados para revisión</p>
                </div>

                {/* Alertas */}
                {error && (
                    <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center">
                        <XCircle className="text-red-600 mr-3" size={20} />
                        <p className="text-red-800 font-medium">{error}</p>
                    </div>
                )}

                {success && (
                    <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center">
                        <CheckCircle className="text-green-600 mr-3" size={20} />
                        <p className="text-green-800 font-medium">{success}</p>
                    </div>
                )}

                {/* Estadísticas */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-gray-400">
                        <p className="text-gray-600 text-sm mb-1">Total Asignaciones</p>
                        <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-green-400">
                        <p className="text-green-600 text-sm mb-1">Activas</p>
                        <p className="text-2xl font-bold text-green-800">{stats.activas}</p>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-blue-400">
                        <p className="text-blue-600 text-sm mb-1">En Revisión</p>
                        <p className="text-2xl font-bold text-blue-800">{stats.enRevision}</p>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-purple-400">
                        <p className="text-purple-600 text-sm mb-1">Evaluadas</p>
                        <p className="text-2xl font-bold text-purple-800">{stats.evaluadas}</p>
                    </div>
                </div>

                {/* Filtros */}
                <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
                    <div className="flex flex-wrap gap-3">
                        <button
                            onClick={() => setFiltroEstado('TODAS')}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors ${filtroEstado === 'TODAS' ? 'bg-gray-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            Todas ({stats.total})
                        </button>
                        <button
                            onClick={() => setFiltroEstado('ACTIVAS')}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors ${filtroEstado === 'ACTIVAS' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            Activas ({stats.activas})
                        </button>
                        <button
                            onClick={() => setFiltroEstado('EN_REVISION')}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors ${filtroEstado === 'EN_REVISION' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            En Revisión ({stats.enRevision})
                        </button>
                    </div>
                </div>

                {/* Grid de Cards */}
                {asignacionesFiltradas.length === 0 ? (
                    <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                        <FileText className="mx-auto mb-4 text-gray-400" size={64} />
                        <h3 className="text-xl font-semibold text-gray-800 mb-2">No hay asignaciones</h3>
                        <p className="text-gray-600">No tienes trabajos asignados en este momento</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {asignacionesFiltradas.map((asignacion) => (
                            <AsignacionCard
                                key={asignacion.id}
                                asignacion={asignacion}
                                onViewPDF={setSelectedAsignacionPDF}
                                onUpdateEstado={setSelectedAsignacionEvaluar}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Modales */}
            {selectedAsignacionPDF && (
                <PDFViewerModal
                    asignacion={selectedAsignacionPDF}
                    onClose={() => setSelectedAsignacionPDF(null)}
                />
            )}

            {selectedAsignacionEvaluar && (
                <EvaluacionModal
                    asignacion={selectedAsignacionEvaluar}
                    onClose={() => setSelectedAsignacionEvaluar(null)}
                    onSubmit={handleSubmitEvaluacion}
                    isLoading={isSubmitting}
                />
            )}
        </div>
    );
}