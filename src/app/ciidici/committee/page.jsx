// src/app/dashboard/comite/estadisticas/page.jsx
"use client";
import React, { useEffect, useState } from 'react';
import { Users, FileText, Monitor, CheckCircle, BarChart3, BookOpen } from 'lucide-react';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import CardChart from '@/components/ui/cards/cardChart';
import Loading from '@/components/ui/utils/loading';
import LoadError from '@/components/ui/utils/loadingError';
import Alert from '@/components/ui/utils/alert';

// Colores para las gráficas
const COLORS_PIE = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];
const COLORS_BAR = {
  activos: '#10B981',
  inactivos: '#EF4444'
};
function EmptyChart({ message = "No hay datos para mostrar" }) {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <BarChart3 className="text-gray-300 mb-4" size={64} />
      <p className="text-gray-500 text-center font-medium">{message}</p>
    </div>
  );
}

export default function DashboardEstadisticas() {
  const [kpiData, setKpiData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorLoading, setErrorLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchKPIData();
  }, []);

  const fetchKPIData = async () => {
    try {
      setLoading(true);
      setErrorLoading(false);

      const response = await fetch('/api/kpi');
      const data = await response.json();

      if (response.ok) {
        setKpiData(data.data);
      } else {
        setError(data.error || 'Error al cargar los datos');
        setErrorLoading(true);
      }

    } catch (error) {
      console.error('Error al cargar KPIs:', error);
      setError('Error al cargar las estadísticas del sistema');
      setErrorLoading(true);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loading />;
  }

  if (errorLoading) {
    return <LoadError error={error || "Error al cargar los datos."} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Dashboard de Estadísticas
          </h1>
          <p className="text-gray-600">
            Visualización de métricas y KPIs del sistema SIGCA - Año {kpiData?.anoActual}
          </p>
        </div>

        {/* Alertas */}
        <Alert
          type="error"
          message={error}
          isVisible={error}
        />

        {/* Grid de Gráficas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* GRÁFICA 1: Usuarios por Rol */}
          <CardChart
            title="Usuarios por Rol"
            subtitle="Distribución de usuarios activos e inactivos por rol"
            icon={Users}
          >
            {kpiData?.usuariosPorRol && kpiData.usuariosPorRol.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={kpiData.usuariosPorRol}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="rol" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="activos" fill={COLORS_BAR.activos} name="Activos" />
                  <Bar dataKey="inactivos" fill={COLORS_BAR.inactivos} name="Inactivos" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <EmptyChart message="No hay usuarios registrados" />
            )}
          </CardChart>

          {/* GRÁFICA 2: Trabajos por Convocatoria */}
          <CardChart
            title="Trabajos por Convocatoria"
            subtitle={`Número de trabajos recibidos por convocatoria (${kpiData?.anoActual})`}
            icon={FileText}
          >
            {kpiData?.trabajosPorConvocatoria && kpiData.trabajosPorConvocatoria.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={kpiData.trabajosPorConvocatoria}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="convocatoria" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="trabajos" fill="#3B82F6" name="Trabajos" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <EmptyChart message={`No hay convocatorias ni trabajos en ${kpiData?.anoActual}`} />
            )}
          </CardChart>

          {/* GRÁFICA 3: Trabajos por Modalidad */}
          <CardChart
            title="Trabajos por Modalidad"
            subtitle={`Distribución de trabajos según modalidad de presentación (${kpiData?.anoActual})`}
            icon={Monitor}
          >
            {kpiData?.trabajosPorModalidad && kpiData.trabajosPorModalidad.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={kpiData.trabajosPorModalidad}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ modalidad, cantidad, percent }) =>
                      `${modalidad}: ${cantidad} (${(percent * 100).toFixed(0)}%)`
                    }
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="cantidad"
                  >
                    {kpiData.trabajosPorModalidad.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS_PIE[index % COLORS_PIE.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <EmptyChart message={`No hay trabajos registrados en ${kpiData?.anoActual}`} />
            )}
          </CardChart>

          {/* GRÁFICA 4: Trabajos por Estado */}
          <CardChart
            title="Trabajos por Estado"
            subtitle={`Estado actual de los trabajos (${kpiData?.anoActual})`}
            icon={CheckCircle}
          >
            {kpiData?.trabajosPorEstado && kpiData.trabajosPorEstado.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={kpiData.trabajosPorEstado}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ estado, cantidad, percent }) =>
                      `${estado}: ${cantidad} (${(percent * 100).toFixed(0)}%)`
                    }
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="cantidad"
                  >
                    {kpiData.trabajosPorEstado.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS_PIE[index % COLORS_PIE.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <EmptyChart message={`No hay trabajos registrados en ${kpiData?.anoActual}`} />
            )}
          </CardChart>
          {/* GRÁFICA 5: Trabajos por Tipo */}
          <CardChart
            title="Trabajos por Tipo"
            subtitle={`Distribución de trabajos según tipo (${kpiData?.anoActual})`}
            icon={BookOpen}
          >
            {kpiData?.trabajosPorTipo && kpiData.trabajosPorTipo.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={kpiData.trabajosPorTipo}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ tipo, cantidad, percent }) =>
                      `${tipo}: ${cantidad} (${(percent * 100).toFixed(0)}%)`
                    }
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="cantidad"
                  >
                    {kpiData.trabajosPorTipo.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS_PIE[index % COLORS_PIE.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <EmptyChart message={`No hay trabajos registrados en ${kpiData?.anoActual}`} />
            )}
          </CardChart>

        </div>
      </div>
    </div>
  );
}