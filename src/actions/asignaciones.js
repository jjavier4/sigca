'use server';
import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/db';
import { autorizarAccion, validarDatos, resultadoOk, resultadoError } from '@/lib/actions';
import { evaluarAsignacionSchema } from '@/lib/validation';
import { calcularPorcentaje } from '@/lib/rubrica';

export async function evaluarAsignacion(datos) {
  const { session, error: errorAutorizacion } = await autorizarAccion(['REVISOR']);
  if (errorAutorizacion) return errorAutorizacion;

  const { data, error: errorDatos } = validarDatos(evaluarAsignacionSchema, datos);
  if (errorDatos) return errorDatos;

  const asignacion = await prisma.asignaciones.findFirst({
    where: {
      id: data.id,
      revisorId: session.user.id,
      trabajo: { convocatoria: { activa: true } },
    },
    select: {
      id: true,
      activa: true,
      trabajo: { select: { tipo: true } },
    },
  });

  if (!asignacion) return resultadoError('Asignación no encontrada');
  if (!asignacion.activa) return resultadoError('Esta asignación ya ha sido evaluada');

  const criterios = await prisma.criteriosEvaluacion.findMany({
    where: { grupo: asignacion.trabajo.tipo },
    select: { id: true },
  });

  if (criterios.length === 0) {
    return resultadoError('No hay criterios de evaluación configurados para este tipo de trabajo');
  }

  const idsRespondidos = Object.keys(data.respuestas);
  const respuestaCompleta =
    idsRespondidos.length === criterios.length &&
    criterios.every((criterio) => idsRespondidos.includes(criterio.id));

  if (!respuestaCompleta) {
    return resultadoError('Debes evaluar todos los criterios antes de enviar');
  }

  const calificacion = parseFloat(
    calcularPorcentaje(criterios.length, Object.values(data.respuestas)).toFixed(2)
  );

  const { count } = await prisma.asignaciones.updateMany({
    where: { id: asignacion.id, activa: true },
    data: {
      activa: false,
      calificacion,
      comentario: data.comentarios,
      closeAt: new Date(),
    },
  });

  if (count === 0) return resultadoError('Esta asignación ya ha sido evaluada');

  revalidatePath('/reviewer');
  return resultadoOk('Evaluación enviada exitosamente');
}
