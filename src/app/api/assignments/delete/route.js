// app/api/assignments/delete/route.js
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function DELETE(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      );
    }

    // Verificar que sea ADMIN o COMITE
    if (session.user.rol !== 'ADMIN' && session.user.rol !== 'COMITE') {
      return NextResponse.json(
        { error: 'No tienes permisos para eliminar asignaciones' },
        { status: 403 }
      );
    }

    const { asignacionId } = await request.json();

    if (!asignacionId) {
      return NextResponse.json(
        { error: 'ID de asignación requerido' },
        { status: 400 }
      );
    }

    // Verificar que la asignación existe
    const asignacionExistente = await prisma.asignaciones.findUnique({
      where: { id: asignacionId }
    });

    if (!asignacionExistente) {
      return NextResponse.json(
        { error: 'Asignación no encontrada' },
        { status: 404 }
      );
    }

    // Eliminar la asignación
    await prisma.asignaciones.delete({
      where: { id: asignacionId }
    });

    return NextResponse.json({
      message: 'Asignación eliminada exitosamente'
    });

  } catch (error) {
    console.error('Error al eliminar asignación:', error);
    return NextResponse.json(
      { error: 'Error al eliminar la asignación' },
      { status: 500 }
    );
  }
}