import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { authorize } from '@/lib/auth-utils'
import { validar, actualizarConvocatoriaSchema } from '@/lib/validation'

export async function PATCH(request) {
  try {
    const { error } = await authorize(['COMITE', 'ADMIN'])
    if (error) return error

    const { data, error: errorValidacion } = validar(actualizarConvocatoriaSchema, await request.json())
    if (errorValidacion) return errorValidacion
    const { id, titulo, descripcion, fecha_inicio, fecha_cierre } = data

    const convocatoriaActualizada = await prisma.convocatorias.update({
      where: { id },
      data: {
        titulo,
        descripcion: descripcion || null,
        fecha_inicio: new Date(fecha_inicio),
        fecha_cierre: new Date(fecha_cierre)
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