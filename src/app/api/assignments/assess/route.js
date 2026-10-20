import { NextResponse } from 'next/server';
import { authorize } from '@/lib/auth-utils';
import { validar, evaluarAsignacionSchema } from '@/lib/validation';
import { prisma } from '@/lib/db';


export async function PATCH(request) {
  try {
    // Solo los revisores pueden evaluar asignaciones
    const { session, error } = await authorize(['REVISOR']);
    if (error) return error;

    const { data, error: errorValidacion } = validar(evaluarAsignacionSchema, await request.json());
    if (errorValidacion) return errorValidacion;
    const { id, comentarios, calificacion } = data;

    // Verificar que la asignación existe y pertenece al revisor
    const asignacionExistente = await prisma.asignaciones.findUnique({
      where: { id },
      include: {
        trabajo: {
          select: {
            id: true,
            titulo: true,
            tipo: true
          }
        },
        revisor: {
          select: {
            id: true,
            nombre: true
          }
        }
      }
    });

    if (!asignacionExistente) {
      return NextResponse.json(
        { error: 'Asignación no encontrada' },
        { status: 404 }
      );
    }

    // Verificar que la asignación pertenece al revisor actual
    if (asignacionExistente.revisorId !== session.user.id) {
      return NextResponse.json(
        { error: 'No tienes permiso para evaluar esta asignación' },
        { status: 403 }
      );
    }

    // Verificar que la asignación esté activa
    if (!asignacionExistente.activa) {
      return NextResponse.json(
        { error: 'Esta asignación ya ha sido evaluada' },
        { status: 400 }
      );
    }

    // Actualizar la asignación con la calificación y desactivarla
    const asignacionActualizada = await prisma.asignaciones.update({
      where: { id },
      data: {
        activa: false,
        calificacion: calificacion,
        comentario: comentarios.trim(),
        closeAt: new Date()
      },
      include: {
        trabajo: {
          select: {
            id: true,
            titulo: true,
            tipo: true,
            convocatoria: {
              select: {
                titulo: true
              }
            }
          }
        },
        revisor: {
          select: {
            nombre: true,
            email: true
          }
        }
      }
    });

    return NextResponse.json(
      {
        message: 'Evaluación registrada exitosamente',
        asignacion: {
          id: asignacionActualizada.id,
          calificacion: asignacionActualizada.calificacion,
          comentario: asignacionActualizada.comentario,
          activa: asignacionActualizada.activa,
          closeAt: asignacionActualizada.closeAt,
          trabajo: asignacionActualizada.trabajo,
          revisor: asignacionActualizada.revisor
        }
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error al registrar evaluación:', error);
    
    // Manejo específico de errores de Prisma
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Asignación no encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: 'Error al registrar la evaluación' },
      { status: 500 }
    );
  }
}