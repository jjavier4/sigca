import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function DELETE(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    

    const { searchParams } = new URL(request.url);
    const id= searchParams.get('id');

    // Verificar que el criterio existe
    const criterioExistente = await prisma.criteriosEvaluacion.findUnique({
      where: { id }
    });

    if (!criterioExistente) {
      return NextResponse.json(
        { error: 'Criterio no encontrado' },
        { status: 404 }
      );
    }

    // Eliminar el criterio
    await prisma.criteriosEvaluacion.delete({
      where: { id }
    });

    return NextResponse.json(
      { 
        message: 'Criterio eliminado exitosamente',
        id: id
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error al eliminar criterio:', error);
    
      return NextResponse.json(
      { error: 'Error al eliminar criterio de evaluación' },
      { status: 500 }
    );
  }
}