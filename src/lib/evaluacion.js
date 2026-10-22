import 'server-only';

export const filtroCargaActiva = {
  activa: true,
  trabajo: { convocatoria: { activa: true } },
};

export function anioActualPrefijo() {
  return `${new Date().getFullYear()}-`;
}

export function calcularPromedio(asignaciones) {
  if (asignaciones.length === 0) return null;
  const suma = asignaciones.reduce((total, asignacion) => total + asignacion.calificacion, 0);
  return parseFloat((suma / asignaciones.length).toFixed(2));
}

export function asignacionesPendientes(asignaciones) {
  return asignaciones.filter((asignacion) => asignacion.activa || asignacion.calificacion === null);
}
