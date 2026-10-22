'use server';
import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/db';
import { autorizarAccion, validarDatos, resultadoOk, resultadoError } from '@/lib/actions';
import { analisisIASchema } from '@/lib/validation';
import { getAsignacionesDeTrabajo } from '@/lib/data/asignaciones';

async function guardarAnalisis(datos, mensajeExito) {
  const { error: errorAutorizacion } = await autorizarAccion(['COMITE', 'ADMIN']);
  if (errorAutorizacion) return errorAutorizacion;

  const { data, error: errorDatos } = validarDatos(analisisIASchema, datos);
  if (errorDatos) return errorDatos;

  const countAsignaciones = await getAsignacionesDeTrabajo(data.trabajoId);
  if (countAsignaciones > 0) {
    return resultadoError('No se puede actualizar el análisis: primero elimina las asignaciones de este trabajo');
  }

  const { count } = await prisma.trabajos.updateMany({
    where: {
      id: data.trabajoId,
      estado: { in: ['REGISTRADO', 'EN_REVISION'] },
      convocatoria: { activa: true },
      asignaciones: { none: {} },
    },
    data: {
      nvl_ia: data.nvl_ia,
      nvl_plagio: data.nvl_plagio,
      estado: 'EN_REVISION',
      updatedAt: new Date(),
    },
  });

  if (count === 0) return resultadoError('Trabajo no encontrado, ya resuelto o con asignaciones');

  revalidatePath('/committee/assessed-ia');
  revalidatePath('/committee/assignconvocatorie');
  revalidatePath('/committee/worksassessed');
  revalidatePath('/author');
  return resultadoOk(mensajeExito);
}

export async function registrarAnalisis(datos) {
  return guardarAnalisis(datos, 'Análisis registrado exitosamente');
}

export async function actualizarAnalisis(datos) {
  return guardarAnalisis(datos, 'Análisis actualizado exitosamente');
}
