export const PUNTAJES_RUBRICA = [10, 8, 6, 0];

export const PUNTAJE_MAXIMO_POR_CRITERIO = 10;

export function calcularPorcentaje(totalCriterios, valores) {
  if (totalCriterios === 0) return 0;
  const suma = valores.reduce((acumulado, valor) => acumulado + valor, 0);
  return (suma / (totalCriterios * PUNTAJE_MAXIMO_POR_CRITERIO)) * 100;
}
