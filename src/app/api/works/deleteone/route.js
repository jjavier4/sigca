import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function DELETE(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const trabajoId = searchParams.get('trabajoId');

    if (!trabajoId) {
      return NextResponse.json(
        { error: 'ID del trabajo es requerido' },
        { status: 400 }
      );
    }

    // Buscar el trabajo
    const trabajo = await prisma.trabajos.findUnique({
      where: { id: trabajoId }
    });

    if (!trabajo) {
      return NextResponse.json(
        { error: 'Trabajo no encontrado' },
        { status: 404 }
      );
    }
    //verificar que no se asignado el trabajo a un revisor
    const evaluacion = await prisma.asignaciones.findFirst({
        where: { trabajoId: trabajoId }
    });

    if (evaluacion) {   
        return NextResponse.json(
        { error: 'No se puede eliminar el trabajo porque en proceso de evaluacion o fue evaluado' },
        { status: 400 }
      );
    }

    // Eliminar el trabajo (esto también eliminará las evaluaciones por CASCADE)
    await prisma.trabajos.delete({
      where: { id: trabajoId }
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Trabajo eliminado exitosamente'
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error al eliminar trabajo:', error);
    return NextResponse.json(
      { error: 'Error al eliminar trabajo', details: error.message },
      { status: 500 }
    );
  }
}