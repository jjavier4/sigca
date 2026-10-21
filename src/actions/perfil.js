'use server';
import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/db';
import { autorizarAccion, validarDatos, resultadoOk, resultadoError } from '@/lib/actions';
import { actualizarPerfilSchema } from '@/lib/validation';

export async function actualizarPerfil(datos) {
  const { session, error: errorAutorizacion } = await autorizarAccion(['AUTOR']);
  if (errorAutorizacion) return errorAutorizacion;

  const { data, error: errorDatos } = validarDatos(actualizarPerfilSchema, datos);
  if (errorDatos) return errorDatos;

  try {
    const { count } = await prisma.usuarios.updateMany({
      where: { id: session.user.id },
      data: { numero_control: data.numeroControl },
    });

    if (count === 0) return resultadoError('Usuario no encontrado');
  } catch (error) {
    if (error.code === 'P2002') {
      return resultadoError('El número de control ya está registrado');
    }
    throw error;
  }

  revalidatePath('/author/settings');
  return resultadoOk('Perfil actualizado exitosamente');
}
