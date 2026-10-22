'use server';
import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/db';
import { autorizarAccion, validarDatos, resultadoOk, resultadoError } from '@/lib/actions';
import { crearConvocatoriaSchema, actualizarConvocatoriaSchema } from '@/lib/validation';

const ROLES_COMITE = ['COMITE', 'ADMIN'];

function inicioDelDia(dia) {
  return new Date(`${dia}T00:00:00.000Z`);
}

function cierreDelDia(dia) {
  return new Date(`${dia}T23:59:59.999Z`);
}

function revalidarConvocatorias() {
  revalidatePath('/committee/manageconvocatorie');
  revalidatePath('/convocatories');
}

export async function crearConvocatoria(datos) {
  const { error: errorAutorizacion } = await autorizarAccion(ROLES_COMITE);
  if (errorAutorizacion) return errorAutorizacion;

  const { data, error: errorDatos } = validarDatos(crearConvocatoriaSchema, datos);
  if (errorDatos) return errorDatos;

  const [{ id }] = await prisma.$queryRaw`SELECT generar_convocatoria_id() as id`;

  await prisma.convocatorias.create({
    data: {
      id,
      titulo: data.titulo,
      descripcion: data.descripcion,
      fecha_inicio: inicioDelDia(data.fecha_inicio),
      fecha_cierre: cierreDelDia(data.fecha_cierre),
      archivo_url: '',
    },
  });

  revalidarConvocatorias();
  return resultadoOk('Convocatoria registrada exitosamente');
}

export async function actualizarConvocatoria(datos) {
  const { error: errorAutorizacion } = await autorizarAccion(ROLES_COMITE);
  if (errorAutorizacion) return errorAutorizacion;

  const { data, error: errorDatos } = validarDatos(actualizarConvocatoriaSchema, datos);
  if (errorDatos) return errorDatos;

  const { count } = await prisma.convocatorias.updateMany({
    where: { id: data.id, activa: true },
    data: {
      titulo: data.titulo,
      descripcion: data.descripcion,
      fecha_inicio: inicioDelDia(data.fecha_inicio),
      fecha_cierre: cierreDelDia(data.fecha_cierre),
    },
  });

  if (count === 0) return resultadoError('Convocatoria no encontrada o inactiva');

  revalidarConvocatorias();
  return resultadoOk('Convocatoria actualizada exitosamente');
}

export async function desactivarConvocatoria(convocatoriaId) {
  const { error: errorAutorizacion } = await autorizarAccion(ROLES_COMITE);
  if (errorAutorizacion) return errorAutorizacion;

  if (typeof convocatoriaId !== 'string' || !convocatoriaId) {
    return resultadoError('ID de convocatoria requerido');
  }

  const asignacionesEliminadas = await prisma.$transaction(async (tx) => {
    const { count } = await tx.convocatorias.updateMany({
      where: { id: convocatoriaId, activa: true },
      data: { activa: false },
    });

    if (count === 0) return null;

    const { count: eliminadas } = await tx.asignaciones.deleteMany({
      where: { trabajo: { convocatoriaId } },
    });

    return eliminadas;
  });

  if (asignacionesEliminadas === null) return resultadoError('Convocatoria no encontrada');

  revalidarConvocatorias();
  revalidatePath('/reviewer');
  return resultadoOk(
    `Convocatoria desactivada correctamente. Asignaciones eliminadas: ${asignacionesEliminadas}`
  );
}
