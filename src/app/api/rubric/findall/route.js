import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    // Obtener todos los criterios ordenados por grupo y fecha de creación
    const criterios = await prisma.criteriosEvaluacion.findMany({
      orderBy: [
        { grupo: 'asc' }
      ]
    });

    return NextResponse.json(criterios);

  } catch (error) {
    console.error('Error al obtener criterios:', error);
    return NextResponse.json(
      { error: 'Error al obtener criterios de evaluación' },
      { status: 500 }
    );
  }
}
