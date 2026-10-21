import 'server-only';
import { getSession } from './auth-utils';

export function resultadoOk(message, extra = {}) {
  return { ok: true, message, ...extra };
}

export function resultadoError(error) {
  return { ok: false, error };
}

export async function autorizarAccion(roles) {
  const session = await getSession();

  if (!session?.user?.id) {
    return { error: resultadoError('No autenticado') };
  }

  if (roles && !roles.includes(session.user.rol)) {
    return { error: resultadoError('No autorizado') };
  }

  return { session };
}

export function validarDatos(schema, datos) {
  const resultado = schema.safeParse(datos);

  if (!resultado.success) {
    return { error: resultadoError(resultado.error.issues[0]?.message ?? 'Datos inválidos') };
  }

  return { data: resultado.data };
}
