import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function PATCH(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { emailActual, email, numeroControl } = body;

    // Validaciones
    if (!emailActual || !email) {
      return NextResponse.json(
        { error: 'Email actual y nuevo email son requeridos' },
        { status: 400 }
      );
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Formato de email inválido' },
        { status: 400 }
      );
    }

    // Validar número de control si se proporciona
    if (numeroControl && !/^\d{8}$/.test(numeroControl)) {
      return NextResponse.json(
        { error: 'El número de control debe tener 8 dígitos' },
        { status: 400 }
      );
    }

    // Verificar permisos: solo ADMIN, COMITE o el mismo usuario pueden actualizar
    const esAdmin = session.user.rol === 'ADMIN';
    const esComite = session.user.rol === 'COMITE';
    const esMismoUsuario = session.user.email === emailActual;

    if (!esAdmin && !esComite && !esMismoUsuario) {
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
      { error: 'Error al actualizar usuario', details: error.message },
      { status: 500 }
    );
  }
}