import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { authorize } from '@/lib/auth-utils';

// Borrado lógico: la convocatoria pasa a activa = false y deja de mostrarse y de aceptar envíos.
// Sus trabajos se conservan; las asignaciones de esos trabajos se eliminan.
export async function DELETE(request) {
  try {
    const { error } = await authorize(['ADMIN', 'COMITE']);
    if (error) return error;

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'ID de convocatoria requerido' },
        { status: 400 }
      );
    }

    // Verificar que la convocatoria existe y sigue activa
    const convocatoriaExistente = await prisma.convocatorias.findFirst({
      where: { id, activa: true }
    });

    if (!convocatoriaExistente) {
      return NextResponse.json(
        { error: 'Convocatoria no encontrada' },
        { status: 404 }
      );
    }

    // Se borran las asignaciones de los trabajos de la convocatoria y se desactiva en una sola transacción
    const [asignacionesEliminadas] = await prisma.$transaction([
      prisma.asignaciones.deleteMany({
        where: { trabajo: { convocatoriaId: id } }
      }),
      prisma.convocatorias.update({
        where: { id },
        data: { activa: false }
      })
    ]);

    return NextResponse.json(
      {
        success: true,
        message: `Convocatoria desactivada correctamente. Asignaciones eliminadas: ${asignacionesEliminadas.count}`,
        asignacionesEliminadas: asignacionesEliminadas.count
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error al desactivar convocatoria:', error);
    return NextResponse.json(
      { error: 'Error al desactivar la convocatoria' },
      { status: 500 }
    );
  }
}
