import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getServerSession } from 'next-auth'

export async function PATCH(request) {
  try {
    const session = await getServerSession()

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

    const body = await request.json()
    const { id, titulo, descripcion, fecha_inicio, fecha_cierre, temas } = body

    if (!id) {
      return NextResponse.json(
        { error: 'ID de convocatoria requerido' },
        { status: 400 }
      )
    }

    if (!titulo || !fecha_inicio || !fecha_cierre) {
      return NextResponse.json(
        { error: 'Título, fecha de inicio y fecha de cierre son requeridos' },
        { status: 400 }
      )
    }

    // Validar que la fecha de cierre sea posterior a la fecha de inicio
    if (new Date(fecha_cierre) <= new Date(fecha_inicio)) {
      return NextResponse.json(
        { error: 'La fecha de cierre debe ser posterior a la fecha de inicio' },
        { status: 400 }
      )
    }

    const convocatoriaActualizada = await prisma.convocatoria.update({
      where: { id },
      data: {
        titulo,
        descripcion: descripcion || null,
        fecha_inicio: new Date(fecha_inicio),
        fecha_cierre: new Date(fecha_cierre),
        temas: temas || null
      }
    })

    return NextResponse.json(
      {
        message: 'Convocatoria actualizada exitosamente',
        convocatoria: convocatoriaActualizada
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error al actualizar convocatoria:', error)
    return NextResponse.json(
      { error: 'Error al actualizar convocatoria' },
      { status: 500 }
    )
  }
}