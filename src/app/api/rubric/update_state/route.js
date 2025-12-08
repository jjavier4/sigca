import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function PATCH(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return Response.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Solo ADMIN y COMITE pueden modificar rúbricas
    if (!['ADMIN', 'COMITE'].includes(session.user.rol)) {
      return Response.json({ error: 'No tienes permisos' }, { status: 403 });
    }

    const body = await request.json();
    const { id, estado } = body;

    // Validaciones
    if (!id) {
      return Response.json(
        { error: 'El ID es requerido' },
        { status: 400 }
      );
    }

    if (typeof estado !== 'boolean') {
      return Response.json(
        { error: 'El estado debe ser verdadero o falso' },
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

    // Actualizar el estado
    const rubricaActualizada = await prisma.rubrica.update({
      where: { id },
      data: { estado }
    });

    return Response.json({
      success: true,
      message: estado 
        ? 'Criterio activado exitosamente' 
        : 'Criterio desactivado exitosamente',
      data: rubricaActualizada
    });

  } catch (error) {
    console.error('Error al actualizar rúbrica:', error);
    return Response.json(
      { error: 'Error al actualizar rúbrica' },
      { status: 500 }
    );
  }
}