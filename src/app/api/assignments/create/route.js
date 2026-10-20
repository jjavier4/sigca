import { prisma } from '@/lib/db';
import { authorize } from '@/lib/auth-utils';
import { validar, crearAsignacionesSchema } from '@/lib/validation';

export async function POST(request) {
  try {
    const { error } = await authorize(['COMITE', 'ADMIN']);
    if (error) return error;

    const { data, error: errorValidacion } = validar(crearAsignacionesSchema, await request.json());
    if (errorValidacion) return errorValidacion;
    const { trabajoId, revisoresIds } = data;

    // Verificar disponibilidad de cada revisor (máximo 4 trabajos activos)
    for (const revisorId of revisoresIds) {
      const cargaRevisor = await prisma.asignaciones.count({
        where: {
          revisorId: revisorId,
          activa: true
        }
      });

      if (cargaRevisor >= 4) {
        const revisor = await prisma.usuarios.findUnique({
          where: { id: revisorId },
          select: { nombre: true, apellidoP: true }
        });

        return Response.json(
          { 
            error: `El revisor ${revisor?.nombre} ${revisor?.apellidoP} ha alcanzado su límite de 4 trabajos activos` 
          },
          { status: 400 }
        );
      }
    }

    // Verificar que ninguno de los revisores ya esté asignado a este trabajo
    const revisorYaAsignado = await prisma.asignaciones.findFirst({
      where: {
        trabajoId: trabajoId,
        revisorId: {
          in: revisoresIds
        }
      },
      include: {
        revisor: {
          select: {
            nombre: true,
            apellidoP: true
          }
        }
      }
    });

    if (revisorYaAsignado) {
      return Response.json(
        { 
          error: `El revisor ${revisorYaAsignado.revisor.nombre} ${revisorYaAsignado.revisor.apellidoP} ya está asignado a este trabajo` 
        },
        { status: 400 }
      );
    }

    // Crear todas las asignaciones en una transacción usando la función SQL
    const asignaciones = await prisma.$transaction(
      revisoresIds.map(revisorId =>
        prisma.$executeRaw`
          INSERT INTO "Asignaciones" (id, "trabajoId", "revisorId")
          VALUES (generar_asignacion_id(), ${trabajoId}, ${revisorId})
        `
      )
    );

    // Obtener las asignaciones recién creadas para retornarlas
    const asignacionesCreadas = await prisma.asignaciones.findMany({
      where: {
        trabajoId: trabajoId,
        revisorId: {
          in: revisoresIds
        },
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
      },
      take: revisoresIds.length
    });

    return Response.json({
      message: `${revisoresIds.length} asignación(es) creada(s) exitosamente`,
      asignaciones: asignacionesCreadas,
      success: true,
      total: revisoresIds.length
    });

  } catch (error) {
    console.error('Error al crear asignaciones:', error);
    return Response.json(
      { error: 'Error al crear las asignaciones' },
      { status: 500 }
    );
  }
}