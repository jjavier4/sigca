'use server';
import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/db';
import { autorizarAccion, validarDatos, resultadoOk, resultadoError } from '@/lib/actions';
import { evaluarAsignacionSchema, crearAsignacionesSchema } from '@/lib/validation';
import { calcularPorcentaje } from '@/lib/rubrica';
import { filtroCargaActiva } from '@/lib/evaluacion';
import { umbralIaPlagio, maxAsignacionesRevisor } from '@/utils/evaluacion';

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

function revalidarAsignaciones() {
  revalidatePath('/committee/assignconvocatorie');
  revalidatePath('/committee/manageassessed');
  revalidatePath('/committee/worksassessed');
  revalidatePath('/reviewer');
}

export async function crearAsignaciones(datos) {
  const { error: errorAutorizacion } = await autorizarAccion(['COMITE', 'ADMIN']);
  if (errorAutorizacion) return errorAutorizacion;

  const { data, error: errorDatos } = validarDatos(crearAsignacionesSchema, datos);
  if (errorDatos) return errorDatos;

  const { trabajoId, revisoresIds } = data;

  const error = await prisma.$transaction(async (tx) => {
    const trabajo = await tx.trabajos.findFirst({
      where: {
        id: trabajoId,
        estado: 'EN_REVISION',
        convocatoria: { activa: true },
        nvl_ia: { lt: umbralIaPlagio },
        nvl_plagio: { lt: umbralIaPlagio },
      },
      select: { id: true },
    });
    if (!trabajo) return 'El trabajo no existe o no se puede asignar';

    const revisores = await tx.usuarios.findMany({
      where: { id: { in: revisoresIds }, rol: 'REVISOR', activa: true, bloqueada: false },
      select: {
        id: true,
        nombre: true,
        apellidoP: true,
        _count: { select: { asignacionesComoRevisor: { where: filtroCargaActiva } } },
      },
    });
    if (revisores.length !== revisoresIds.length) {
      return 'Alguno de los revisores no existe, no está verificado o está bloqueado';
    }

    const saturado = revisores.find(
      (revisor) => revisor._count.asignacionesComoRevisor >= maxAsignacionesRevisor
    );
    if (saturado) {
      return `El revisor ${saturado.nombre} ${saturado.apellidoP} ha alcanzado su límite de ${maxAsignacionesRevisor} trabajos activos`;
    }

    const yaAsignado = await tx.asignaciones.findFirst({
      where: { trabajoId, revisorId: { in: revisoresIds } },
      select: { revisor: { select: { nombre: true, apellidoP: true } } },
    });
    if (yaAsignado) {
      return `El revisor ${yaAsignado.revisor.nombre} ${yaAsignado.revisor.apellidoP} ya está asignado a este trabajo`;
    }

    for (const revisorId of revisoresIds) {
      await tx.$executeRaw`
        INSERT INTO "Asignaciones" (id, "trabajoId", "revisorId")
        VALUES (generar_asignacion_id(), ${trabajoId}, ${revisorId})
      `;
    }

    return null;
  });

  if (error) return resultadoError(error);

  revalidarAsignaciones();
  return resultadoOk(`Asignaciones creadas exitosamente para ${revisoresIds.length} revisor(es)`);
}

export async function eliminarAsignacion(asignacionId) {
  const { error: errorAutorizacion } = await autorizarAccion(['COMITE', 'ADMIN']);
  if (errorAutorizacion) return errorAutorizacion;

  if (typeof asignacionId !== 'string' || !asignacionId) {
    return resultadoError('ID de asignación requerido');
  }

  const { count } = await prisma.asignaciones.deleteMany({
    where: { id: asignacionId, trabajo: { convocatoria: { activa: true }, estado: 'EN_REVISION' } },
  });

  if (count === 0) return resultadoError('La asignación no existe o el proceso de evaluación ya ha finalizado');

  revalidarAsignaciones();
  return resultadoOk('Asignación eliminada exitosamente');
}
