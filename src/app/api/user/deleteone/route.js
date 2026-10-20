import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { authorize } from '@/lib/auth-utils';

export async function DELETE(request) {
  try {
    const { session, error } = await authorize(['ADMIN', 'COMITE']);
    if (error) return error;

    const body = await request.json();
    const { email, bloqueada } = body;

    if (typeof email !== 'string' || typeof bloqueada !== 'boolean') {
      return NextResponse.json(
        { error: 'Datos inválidos' },
        { status: 400 }
      );
    }

    // Verificar que el usuario existe
    const usuarioExistente = await prisma.usuarios.findUnique({
      where: { email }
    });

    if (!usuarioExistente) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }
    // Solo un ADMIN puede bloquear o desbloquear a otro ADMIN
    if (usuarioExistente.rol === 'ADMIN' && session.user.rol !== 'ADMIN') {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 403 }
      );
    }
    //Suspender al usuario en lugar de eliminarlo
    await prisma.usuarios.update({
      where: { email },
      data: { bloqueada: bloqueada }
    });

    return NextResponse.json(
      { 
        success: true,
        message: 'Usuario alterado correctamente',
        usuario: email
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error al alterar usuario:', error);
    return NextResponse.json(
      { error: 'Error al alterar el usuario' },
      { status: 500 }
    );
  }
}