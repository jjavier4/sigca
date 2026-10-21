import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { authorize } from '@/lib/auth-utils';
import { validar, actualizarUsuarioSchema } from '@/lib/validation';

export async function PATCH(request) {
  try {
    const { session, error } = await authorize();
    if (error) return error;

    const { data, error: errorValidacion } = validar(actualizarUsuarioSchema, await request.json());
    if (errorValidacion) return errorValidacion;
    const { emailActual, email, numeroControl } = data;

    const esAdmin = session.user.rol === 'ADMIN';
    const esComite = session.user.rol === 'COMITE';

    if (!esAdmin && !esComite) {
      return NextResponse.json(
        { error: 'No autorizado para actualizar este usuario' },
        { status: 403 }
      );
    }

    // Verificar que el usuario existe
    const usuarioExistente = await prisma.usuarios.findUnique({
      where: { email: emailActual }
    });

    if (!usuarioExistente) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    // Si se cambió el email, verificar que el nuevo no esté en uso
    if (email !== emailActual) {
      const emailEnUso = await prisma.usuarios.findUnique({
        where: { email }
      });

      if (emailEnUso) {
        return NextResponse.json(
          { error: 'El nuevo email ya está en uso' },
          { status: 409 }
        );
      }
    }

    // Preparar datos para actualizar
    const datosActualizacion = {
      email,
      updatedAt: new Date()
    };

    // Solo actualizar numero_control si se proporciona
    if (numeroControl !== undefined) {
      datosActualizacion.numero_control = numeroControl || null;
    }

    // Actualizar usuario
    const usuarioActualizado = await prisma.usuarios.update({
      where: { email: emailActual },
      data: datosActualizacion,
      select: {
        id: true,
        email: true,
        nombre: true,
        numero_control: true,
        rol: true,
        updatedAt: true
      }
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Perfil actualizado exitosamente',
        usuario: usuarioActualizado
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error al actualizar usuario:', error);
    return NextResponse.json(
      { error: 'Error al actualizar usuario' },
      { status: 500 }
    );
  }
}