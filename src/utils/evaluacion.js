export const umbralIaPlagio = 30;
export const maxAsignacionesRevisor = 4;

export function superaUmbral(valor) {
  return valor !== null && valor !== undefined && valor >= umbralIaPlagio;
}
