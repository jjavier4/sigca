'use server';
import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/db';
import { autorizarAccion, validarDatos, resultadoOk, resultadoError } from '@/lib/actions';
import { aceptarTrabajoSchema } from '@/lib/validation';
import { calcularPromedio, asignacionesPendientes } from '@/lib/evaluacion';
import { cargarTrabajoParaDictamen, prepararDictamen, enviarDictamen } from '@/lib/dictamen';
import { superaUmbral } from '@/utils/evaluacion';

const rolesComite = ['COMITE', 'ADMIN'];

function revalidarDictamenes() {
  revalidatePath('/committee/worksassessed');
  revalidatePath('/committee');
  revalidatePath('/author');
}

function validarEnRevision(trabajo) {
  if (!trabajo) return 'Trabajo no encontrado';
  if (trabajo.estado === 'ACEPTADO' || trabajo.estado === 'RECHAZADO') return 'Este trabajo ya fue resuelto';
  if (trabajo.estado !== 'EN_REVISION' || trabajo.nvl_ia === null || trabajo.nvl_plagio === null) {
    return 'El trabajo debe tener niveles de IA y plagio registrados';
  }
  return null;
}

function validarEvaluaciones(trabajo, accion) {
  const pendientes = asignacionesPendientes(trabajo.asignaciones).length;
  if (pendientes > 0) {
    return `Todas las asignaciones deben estar evaluadas antes de ${accion} el trabajo. Faltan ${pendientes} de ${trabajo.asignaciones.length}`;
  }
  return null;
}

async function generarDictamen(trabajo, opciones) {
  try {
    return { dictamen: await prepararDictamen(trabajo, opciones) };
  } catch (error) {
    console.error('Error al generar el dictamen:', error);
    return { error: 'No se pudo generar el dictamen. El trabajo no cambió de estado; inténtalo de nuevo.' };
  }
}

async function resolverTrabajo(trabajo, opciones, datosExtra) {
  const { dictamen, error } = await generarDictamen(trabajo, opciones);
  if (error) return resultadoError(error);

  const { count } = await prisma.trabajos.updateMany({
    where: { id: trabajo.id, estado: 'EN_REVISION' },
    data: {
      estado: opciones.estado,
      calificacion_final: opciones.calificacion,
      updatedAt: new Date(),
      ...datosExtra,
    },
  });
  if (count === 0) return resultadoError('Este trabajo ya fue resuelto');

  const enviado = await enviarDictamen(trabajo, dictamen);
  revalidarDictamenes();

  const verbo = opciones.estado === 'ACEPTADO' ? 'aceptado' : 'rechazado';
  return resultadoOk(
    enviado
      ? `Trabajo ${verbo}. Se ha enviado el dictamen al autor.`
      : `Trabajo ${verbo}, pero no se pudo enviar el correo al autor. Usa "Reenviar dictamen".`
  );
}

export async function aceptarTrabajo(datos) {
  const { error: errorAutorizacion } = await autorizarAccion(rolesComite);
  if (errorAutorizacion) return errorAutorizacion;

  const { data, error: errorDatos } = validarDatos(aceptarTrabajoSchema, datos);
  if (errorDatos) return errorDatos;

  const trabajo = await cargarTrabajoParaDictamen(data.trabajoId);

  const error =
    validarEnRevision(trabajo) ??
    (superaUmbral(trabajo.nvl_ia) || superaUmbral(trabajo.nvl_plagio)
      ? 'El trabajo supera el umbral de IA o plagio; solo puede rechazarse'
      : null) ??
    (trabajo.asignaciones.length === 0
      ? 'El trabajo debe tener al menos una asignación de revisor antes de ser aceptado'
      : null) ??
    validarEvaluaciones(trabajo, 'aceptar');
  if (error) return resultadoError(error);

  const calificacion = calcularPromedio(trabajo.asignaciones);
  return resolverTrabajo(
    trabajo,
    { estado: 'ACEPTADO', calificacion, presencial: data.presencial },
    { presencial: data.presencial }
  );
}

export async function rechazarTrabajo(trabajoId) {
  const { error: errorAutorizacion } = await autorizarAccion(rolesComite);
  if (errorAutorizacion) return errorAutorizacion;

  if (typeof trabajoId !== 'string' || !trabajoId) return resultadoError('ID del trabajo es requerido');

  const trabajo = await cargarTrabajoParaDictamen(trabajoId);

  const error = validarEnRevision(trabajo);
  if (error) return resultadoError(error);

  const tieneAsignaciones = trabajo.asignaciones.length > 0;
  if (tieneAsignaciones) {
    const errorEvaluaciones = validarEvaluaciones(trabajo, 'rechazar');
    if (errorEvaluaciones) return resultadoError(errorEvaluaciones);
  } else if (!superaUmbral(trabajo.nvl_ia) && !superaUmbral(trabajo.nvl_plagio)) {
    return resultadoError(
      'Un trabajo sin asignaciones solo puede rechazarse si supera el umbral de IA o plagio'
    );
  }

  const calificacion = tieneAsignaciones ? calcularPromedio(trabajo.asignaciones) : 0;
  return resolverTrabajo(trabajo, { estado: 'RECHAZADO', calificacion }, {});
}

export async function reenviarDictamen(trabajoId) {
  const { error: errorAutorizacion } = await autorizarAccion(rolesComite);
  if (errorAutorizacion) return errorAutorizacion;

  if (typeof trabajoId !== 'string' || !trabajoId) return resultadoError('ID del trabajo es requerido');

  const trabajo = await cargarTrabajoParaDictamen(trabajoId);
  if (!trabajo) return resultadoError('Trabajo no encontrado');
  if (trabajo.estado !== 'ACEPTADO' && trabajo.estado !== 'RECHAZADO') {
    return resultadoError('Solo se puede reenviar el dictamen de un trabajo aceptado o rechazado');
  }

  const { dictamen, error } = await generarDictamen(trabajo, {
    estado: trabajo.estado,
    calificacion: trabajo.calificacion_final,
    presencial: trabajo.presencial,
  });
  if (error) return resultadoError('No se pudo generar el dictamen. Inténtalo de nuevo.');

  const enviado = await enviarDictamen(trabajo, dictamen);
  if (!enviado) return resultadoError('No se pudo enviar el correo al autor. Inténtalo de nuevo.');

  return resultadoOk('Dictamen reenviado al autor');
}
