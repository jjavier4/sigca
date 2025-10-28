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
    const id= searchParams.get('id');

    // Verificar que la convocatoria existe
    const convocatoriaExistente = await prisma.convocatorias.findUnique({
      where: { id }
    });

    if (!convocatoriaExistente) {
      return NextResponse.json(
        { error: 'Convocatoria no encontrada' },
        { status: 404 }
      );
    }

    // Eliminar la convocatoria
    await prisma.convocatorias.delete({
      where: { id }
    });

    return NextResponse.json(
      { 
        success: true,
        message: 'Convocatoria eliminado correctamente',
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error al eliminar convocatoria:', error);
    return NextResponse.json(
      { error: 'Error al eliminar el convocatoria' },
      { status: 500 }
    );
  }
}