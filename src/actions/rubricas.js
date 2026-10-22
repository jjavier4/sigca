'use server';
import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/db';
import { autorizarAccion, validarDatos, resultadoOk, resultadoError } from '@/lib/actions';
import { crearCriterioSchema } from '@/lib/validation';

const ROLES_COMITE = ['COMITE', 'ADMIN'];

function revalidarRubricas() {
  revalidatePath('/committee/rubric');
  revalidatePath('/reviewer');
}

export async function crearCriterio(datos) {
  const { error: errorAutorizacion } = await autorizarAccion(ROLES_COMITE);
  if (errorAutorizacion) return errorAutorizacion;

  const { data, error: errorDatos } = validarDatos(crearCriterioSchema, datos);
  if (errorDatos) return errorDatos;

  await prisma.criteriosEvaluacion.create({
    data: {
      nombre: data.nombre,
      descripcion: data.descripcion,
      grupo: data.grupo,
      descripcion_puntaje: data.descripcion_puntaje,
    },
  });

  revalidarRubricas();
  return resultadoOk('Criterio creado exitosamente');
}

export async function eliminarCriterio(criterioId) {
  const { error: errorAutorizacion } = await autorizarAccion(ROLES_COMITE);
  if (errorAutorizacion) return errorAutorizacion;

  if (typeof criterioId !== 'string' || !criterioId) {
    return resultadoError('ID del criterio es requerido');
  }

  const { count } = await prisma.criteriosEvaluacion.deleteMany({
    where: { id: criterioId },
  });

  if (count === 0) return resultadoError('Criterio no encontrado');

  revalidarRubricas();
  return resultadoOk('Criterio eliminado exitosamente');
}
