import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(request) {
  try {
    // Verificar autenticación
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      );
    }
    if (session.user.rol !== 'ADMIN' && session.user.rol !== 'COMITE') {
      return NextResponse.json(
        { error: 'No autorizado. ' },
        { status: 403 }
      );
    }

    const anioActual = new Date().getFullYear();
    const convocatorias = await prisma.convocatorias.findMany({
      where: {
        id: {
          startsWith: `${anioActual}-`
        }
      },
      select: {
        id: true,
        titulo: true,
        descripcion: true,
        fecha_inicio: true,
        fecha_cierre: true,
      }
    });

    return NextResponse.json(
      {
        success: true,
        count: convocatorias.length,
        convocatorias
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error al obtener convocatorias:', error);
    return NextResponse.json(
      { error: 'Error al obtener convocatorias', details: error.message },
      { status: 500 }
    );
  }
}