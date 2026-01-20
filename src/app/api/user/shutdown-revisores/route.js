import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/db';

export async function PUT(request) {
  try {
    // Verificar autenticación
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    // Desactivar todos los revisores
    const resultado = await prisma.usuarios.updateMany({
      where: {
        rol: 'REVISOR'
      },
      data: {
        activa: false
      }
    });

    return NextResponse.json({
      success: true,
      mensaje: 'Revisores desactivados exitosamente',
      cantidad: resultado.count
    });

  } catch (error) {
    console.error('Error al desactivar revisores:', error);
    return NextResponse.json(
      { error: 'Error al desactivar revisores' },
      { status: 500 }
    );
  }
}