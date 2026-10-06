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

    const body = await request.json();
    const { email, bloqueada } = body;

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