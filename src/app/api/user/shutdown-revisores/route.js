import { NextResponse } from 'next/server';
import { authorize } from '@/lib/auth-utils';
import { prisma } from '@/lib/db';

export async function PUT(request) {
  try {
    const { error } = await authorize(['COMITE', 'ADMIN']);
    if (error) return error;

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