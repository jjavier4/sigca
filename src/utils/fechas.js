const ZONA_INSTITUCION = 'America/Mexico_City';

export function formatearDiaCalendario(valor) {
  return new Date(valor).toLocaleDateString('es-MX', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  });
}

export function formatearFechaHora(valor) {
  return new Date(valor).toLocaleDateString('es-MX', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: ZONA_INSTITUCION,
  });
}

export function formatearDiaCorto(valor) {
  return new Date(valor).toLocaleDateString('es-MX', {
    month: 'short',
    day: 'numeric',
    timeZone: ZONA_INSTITUCION,
  });
}
