import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return Response.json({ error: 'No autorizado' }, { status: 401 });
    }

    
    const rubricas = await prisma.rubrica.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Separar por estado
    const inactivas = rubricas.filter(r => !r.estado);
    const activas = rubricas.filter(r => r.estado);

    return Response.json({
      success: true,
      data: {
        inactivas,
        activas,
        total: rubricas.length
      }
    });

  } catch (error) {
    console.error('Error al obtener rúbricas:', error);
    return Response.json(
      { error: 'Error al obtener rúbricas' },
      { status: 500 }
    );
  }
}
