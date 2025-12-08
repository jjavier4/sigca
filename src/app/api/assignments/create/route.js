import { prisma } from '@/lib/db';

export async function POST(request) {
  try {
    const { trabajoId, revisor1Id, revisor2Id } = await request.json();

    // Validaciones
    if (!trabajoId || !revisor1Id || !revisor2Id) {
      return Response.json(
        { error: 'Debe proporcionar un trabajo y dos revisores' },
        { status: 400 }
      );
    }

    if (revisor1Id === revisor2Id) {
      return Response.json(
        { error: 'Debe seleccionar dos revisores diferentes' },
        { status: 400 }
      );
    }

    
    // Verificar disponibilidad de ambos revisores
    const cargaRevisor1 = await prisma.asignaciones.count({
      where: {
        revisorId: revisor1Id,
        activa: true,
        
      }
    });

    const cargaRevisor2 = await prisma.asignaciones.count({
      where: {
        revisorId: revisor2Id,
        activa: true,
       
      }
    });

    if (cargaRevisor1 >= 4) {
      return Response.json(
        { error: 'El primer revisor ha alcanzado su límite de 4 trabajos' },
        { status: 400 }
      );
    }

    if (cargaRevisor2 >= 4) {
      return Response.json(
        { error: 'El segundo revisor ha alcanzado su límite de 4 trabajos' },
        { status: 400 }
      );
    }

    // Verificar que el trabajo no tenga ya 2 asignaciones activas
    const asignacionesExistentes = await prisma.asignaciones.count({
      where: {
        trabajoId: trabajoId,
        activa: true
      }
    });

    if (asignacionesExistentes >= 2) {
      return Response.json(
        { error: 'Este trabajo ya tiene 2 revisores asignados' },
        { status: 400 }
      );
    }

    // Verificar que ninguno de los revisores ya esté asignado a este trabajo
    const revisorYaAsignado = await prisma.asignaciones.findFirst({
      where: {
        trabajoId: trabajoId,
        activa: true,
        OR: [
          { revisorId: revisor1Id },
          { revisorId: revisor2Id }
        ]
      }
    });

    if (revisorYaAsignado) {
      return Response.json(
        { error: 'Uno de los revisores seleccionados ya está asignado a este trabajo' },
        { status: 400 }
      );
    }

    // Crear ambas asignaciones en una transacción
    const asignaciones = await prisma.$transaction([
      prisma.asignaciones.create({
        data: {
          trabajoId: trabajoId,
          revisorId: revisor1Id,
          activa: true
        },
        include: {
          revisor: {
            select: {
              nombre: true,
              apellidoP: true,
              apellidoM: true,
              email: true
            }
          },
          trabajo: {
            select: {
              titulo: true
            }
          }
        }
      }),
      prisma.asignaciones.create({
        data: {
          trabajoId: trabajoId,
          revisorId: revisor2Id,
          activa: true
        },
        include: {
          revisor: {
            select: {
              nombre: true,
              apellidoP: true,
              apellidoM: true,
              email: true
            }
          },
          trabajo: {
            select: {
              titulo: true
            }
          }
        }
      })
    ]);

    return Response.json({
      message: 'Asignaciones creadas exitosamente',
      asignaciones: asignaciones,
      success: true
    });

  } catch (error) {
    console.error('Error al crear asignaciones:', error);
    return Response.json(
      { error: 'Error al crear las asignaciones' },
      { status: 500 }
    );
  }
}