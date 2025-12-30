import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db';

export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    // Solo ADMIN y COMITE pueden eliminar criterios
    if (session.user.rol !== 'ADMIN' && session.user.rol !== 'COMITE') {
      return NextResponse.json(
        { error: 'No tiene permisos para eliminar criterios' },
        { status: 403 }
      );
    }

    const { id } = params;

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
    
    // Manejar errores de integridad referencial si existen evaluaciones asociadas
    if (error.code === 'P2003') {
      return NextResponse.json(
        { error: 'No se puede eliminar el criterio porque tiene evaluaciones asociadas' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Error al eliminar criterio de evaluación' },
      { status: 500 }
    );
  }
}