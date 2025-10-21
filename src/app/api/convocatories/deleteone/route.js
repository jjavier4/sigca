import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function DELETE(request) {
  try {
    // Verificar autenticación
    const session = await getServerSession(authOptions);
    
    if (!session && session.user.rol !== 'ADMIN' && session.user.rol !== 'COMITE') {
      return NextResponse.json(
        { error: 'No autorizado. ' },
        { status: 403 }
      );
    }
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

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

    // Eliminar el usuario
    await prisma.usuarios.delete({
      where: { email }
    });

    return NextResponse.json(
      { 
        success: true,
        message: 'Usuario eliminado correctamente',
        usuario: email
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error al eliminar usuario:', error);
    return NextResponse.json(
      { error: 'Error al eliminar el usuario' },
      { status: 500 }
    );
  }
}