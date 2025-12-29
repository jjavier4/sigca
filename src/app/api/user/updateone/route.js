import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function PATCH(request) {
  try {
    // Verificar autenticación
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      );
    }
    const body = await request.json();
    const {id,email, rol } = body;

    // Verificar que el usuario existe
    const usuarioExistente = await prisma.usuarios.findUnique({
      where: { id }
    });

    if (!usuarioExistente) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }


  
    // Si se cambia el email, verificar que no exista
    if (email && email !== usuarioExistente.email) {
      const emailExiste = await prisma.usuarios.findUnique({
        where: { email }
      });

      if (emailExiste) {
        return NextResponse.json(
          { error: 'El email ya está registrado' },
          { status: 400 }
        );
      }
    }

    // Preparar datos para actualizar (solo campos proporcionados)
    const datosActualizar = {};
    if (email !== undefined) datosActualizar.email = email;

    // Actualizar usuario
    const usuarioActualizado = await prisma.usuarios.update({
      where: { id },
      data: datosActualizar,
      select: {
        id: true,
        email: true,
        nombre: true,
        rol: true,
        createdAt: true,
        updatedAt: true
      }
    });

    return NextResponse.json(
      { 
        success: true,
        message: 'Usuario actualizado correctamente',
        usuario: usuarioActualizado
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error al actualizar usuario:', error);
    return NextResponse.json(
      { error: 'Error al actualizar el usuario', details: error.message },
      { status: 500 }
    );
  }
}