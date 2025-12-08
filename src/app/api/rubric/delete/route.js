// src/app/api/rubricas/delete/route.js
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function DELETE(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return Response.json({ error: 'No autorizado' }, { status: 401 });
    }    
    const body = await request.json();
    const { id } = body;

    // Validación
    if (!id) {
      return Response.json(
        { error: 'El ID es requerido' },
        { status: 400 }
      );
    }

    // Verificar que la rúbrica existe
    const rubricaExistente = await prisma.rubrica.findUnique({
      where: { id }
    });

    if (!rubricaExistente) {
      return Response.json(
        { error: 'Rúbrica no encontrada' },
        { status: 404 }
      );
    }

    // Eliminar la rúbrica
    await prisma.rubrica.delete({
      where: { id }
    });

    return Response.json({
      success: true,
      message: 'Criterio de evaluación eliminado exitosamente'
    });

  } catch (error) {
    console.error('Error al eliminar rúbrica:', error);
    return Response.json(
      { error: 'Error al eliminar rúbrica' },
      { status: 500 }
    );
  }
}